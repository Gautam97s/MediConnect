package com.mediconnect.prescription.service;

import com.mediconnect.appointment.model.Appointment;
import com.mediconnect.appointment.model.AppointmentStatus;
import com.mediconnect.appointment.repository.AppointmentRepository;
import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.DoctorProfile;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.repository.DoctorProfileRepository;
import com.mediconnect.auth.service.JwtService;
import com.mediconnect.prescription.model.Prescription;
import com.mediconnect.prescription.model.PrescriptionFinalizeRequest;
import com.mediconnect.prescription.model.PrescriptionItem;
import com.mediconnect.prescription.model.PrescriptionResponse;
import com.mediconnect.prescription.repository.PrescriptionRepository;
import com.mediconnect.realtime.RealtimeEventPublisher;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.redis.RedisConnectionFailureException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private static final DateTimeFormatter PDF_DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuthUserRepository authUserRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final JwtService jwtService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public PrescriptionServiceImpl(
            PrescriptionRepository prescriptionRepository,
            AppointmentRepository appointmentRepository,
            AuthUserRepository authUserRepository,
            DoctorProfileRepository doctorProfileRepository,
            JwtService jwtService,
            RealtimeEventPublisher realtimeEventPublisher
    ) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentRepository = appointmentRepository;
        this.authUserRepository = authUserRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.jwtService = jwtService;
        this.realtimeEventPublisher = realtimeEventPublisher;
    }

    @Override
    @Transactional
    public PrescriptionResponse finalizeConsultationPrescription(String authorizationHeader, PrescriptionFinalizeRequest request) {
        AuthUser user = resolveCurrentUser(authorizationHeader);
        if (user.getRole() != UserRole.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctors can finalize prescriptions");
        }

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        validateDoctorAccess(user, appointment.getDoctorId(), request.getDoctorId());

        List<PrescriptionItem> items = normalizeItems(request.getItems());
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointment.getId())
                .orElseGet(Prescription::new);

        prescription.setAppointmentId(appointment.getId());
        prescription.setDoctorId(appointment.getDoctorId());
        prescription.setDoctorName(normalizeDoctorName(request.getDoctorName(), user.getName()));
        prescription.setPatientName(appointment.getPatientName());
        prescription.setReason(appointment.getReason());
        prescription.setConsultationNotes(normalizeOptionalText(request.getConsultationNotes()));
        prescription.setItems(items);

        Prescription saved = prescriptionRepository.save(prescription);

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            realtimeEventPublisher.publishAppointmentUpdated(updatedAppointment);
        }

        PrescriptionResponse response = toResponse(saved);
        realtimeEventPublisher.publishPrescriptionReady(response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptions(String authorizationHeader, Long appointmentId, Long doctorId, String patientName) {
        AuthUser user = resolveCurrentUser(authorizationHeader);

        if (appointmentId != null && appointmentId > 0) {
            Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId).orElse(null);
            if (prescription == null) {
                return List.of();
            }
            validatePrescriptionAccess(user, prescription);
            return List.of(toResponse(prescription));
        }

        if (user.getRole() == UserRole.DOCTOR) {
            Long resolvedDoctorId = doctorId != null && doctorId > 0 ? doctorId : resolveDoctorAccessId(user);
            validateDoctorAccess(user, resolvedDoctorId, resolvedDoctorId);
            return prescriptionRepository.findByDoctorIdOrderByIssuedAtDesc(resolvedDoctorId).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        String resolvedPatientName = user.getName();
        if (StringUtils.hasText(patientName) && !namesLikelyMatch(resolvedPatientName, patientName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only access their own prescriptions");
        }

        return prescriptionRepository.findByPatientNameIgnoreCaseOrderByIssuedAtDesc(resolvedPatientName.trim()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePrescriptionPdf(String authorizationHeader, Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

        AuthUser user = resolveCurrentUser(authorizationHeader);
        validatePrescriptionAccess(user, prescription);

        try (PDDocument document = new PDDocument(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float margin = 56f;
                float y = page.getMediaBox().getHeight() - margin;

                y = writeLine(content, PDType1Font.HELVETICA_BOLD, 20, margin, y, "MediConnect Prescription");
                y = writeLine(content, PDType1Font.HELVETICA, 10, margin, y - 4, "Issued: " + formatIssuedAt(prescription));
                y = writeLine(content, PDType1Font.HELVETICA_BOLD, 12, margin, y - 16, "Doctor");
                y = writeLine(content, PDType1Font.HELVETICA, 11, margin, y - 2, prescription.getDoctorName());
                y = writeLine(content, PDType1Font.HELVETICA_BOLD, 12, margin, y - 16, "Patient");
                y = writeLine(content, PDType1Font.HELVETICA, 11, margin, y - 2, prescription.getPatientName());
                y = writeLine(content, PDType1Font.HELVETICA_BOLD, 12, margin, y - 16, "Reason");
                y = writeWrapped(content, PDType1Font.HELVETICA, 11, margin, y - 2, 480f, defaultText(prescription.getReason(), "General consultation"));

                y = writeLine(content, PDType1Font.HELVETICA_BOLD, 12, margin, y - 18, "Medicines");
                int index = 1;
                for (PrescriptionItem item : prescription.getItems()) {
                    y = writeWrapped(
                            content,
                            PDType1Font.HELVETICA,
                            11,
                            margin,
                            y - 4,
                            480f,
                            index + ". " + item.getMedicationName() + " | Dose: " + item.getDosage()
                                    + " | Frequency: " + item.getFrequency()
                                    + optionalSegment(" | Duration: ", item.getDuration())
                                    + optionalSegment(" | Instructions: ", item.getInstructions())
                    );
                    index++;
                }

                y = writeLine(content, PDType1Font.HELVETICA_BOLD, 12, margin, y - 16, "Consultation Notes");
                writeWrapped(content, PDType1Font.HELVETICA, 11, margin, y - 2, 480f, defaultText(prescription.getConsultationNotes(), "No additional notes recorded."));
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate prescription PDF");
        }
    }

    private AuthUser resolveCurrentUser(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid authorization header");
        }

        String token = authorizationHeader.substring(7).trim();
        if (token.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing access token");
        }

        String email;
        try {
            email = jwtService.extractEmail(token);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
        }

        return authUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found for token"));
    }

    private void validatePrescriptionAccess(AuthUser user, Prescription prescription) {
        if (user.getRole() == UserRole.DOCTOR) {
            validateDoctorAccess(user, prescription.getDoctorId(), prescription.getDoctorId());
            return;
        }

        if (!namesLikelyMatch(user.getName(), prescription.getPatientName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another patient's prescription");
        }
    }

    private void validateDoctorAccess(AuthUser user, Long appointmentDoctorId, Long requestedDoctorId) {
        boolean appointmentUsesKnownDoctorId = authUserRepository.findById(appointmentDoctorId).isPresent()
                || doctorProfileRepository.findById(appointmentDoctorId).isPresent();
        boolean requestUsesKnownDoctorId = authUserRepository.findById(requestedDoctorId).isPresent()
                || doctorProfileRepository.findById(requestedDoctorId).isPresent();
        Long profileId = doctorProfileRepository.findByUser(user)
                .map(DoctorProfile::getId)
                .orElse(null);

        boolean matchesRequested = user.getId().equals(requestedDoctorId) || (profileId != null && profileId.equals(requestedDoctorId));
        boolean matchesAppointment = user.getId().equals(appointmentDoctorId) || (profileId != null && profileId.equals(appointmentDoctorId));

        if ((requestUsesKnownDoctorId || appointmentUsesKnownDoctorId) && !matchesRequested && !matchesAppointment) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor cannot access another doctor's prescriptions");
        }
    }

    private Long resolveDoctorAccessId(AuthUser user) {
        return doctorProfileRepository.findByUser(user)
                .map(DoctorProfile::getId)
                .orElse(user.getId());
    }

    private List<PrescriptionItem> normalizeItems(List<PrescriptionFinalizeRequest.PrescriptionItemRequest> requestItems) {
        List<PrescriptionItem> items = new ArrayList<>();
        for (PrescriptionFinalizeRequest.PrescriptionItemRequest item : requestItems) {
            items.add(PrescriptionItem.builder()
                    .medicationName(requireText(item.getMedicationName(), "Medication name is required"))
                    .dosage(requireText(item.getDosage(), "Dosage is required"))
                    .frequency(requireText(item.getFrequency(), "Frequency is required"))
                    .duration(normalizeOptionalText(item.getDuration()))
                    .instructions(normalizeOptionalText(item.getInstructions()))
                    .build());
        }
        return items;
    }

    private PrescriptionResponse toResponse(Prescription prescription) {
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .appointmentId(prescription.getAppointmentId())
                .doctorId(prescription.getDoctorId())
                .doctorName(prescription.getDoctorName())
                .patientName(prescription.getPatientName())
                .reason(prescription.getReason())
                .consultationNotes(prescription.getConsultationNotes())
                .issuedAt(prescription.getIssuedAt())
                .items(prescription.getItems().stream()
                        .map(item -> PrescriptionResponse.PrescriptionItemData.builder()
                                .medicationName(item.getMedicationName())
                                .dosage(item.getDosage())
                                .frequency(item.getFrequency())
                                .duration(item.getDuration())
                                .instructions(item.getInstructions())
                                .build())
                        .collect(Collectors.toList()))
                .pdfPath("/api/prescriptions/" + prescription.getId() + "/pdf")
                .build();
    }

    private String normalizeDoctorName(String requestedDoctorName, String fallbackDoctorName) {
        if (StringUtils.hasText(requestedDoctorName)) {
            return requestedDoctorName.trim();
        }
        return requireText(fallbackDoctorName, "Doctor name is required");
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean namesLikelyMatch(String left, String right) {
        return normalizeName(left).equals(normalizeName(right));
    }

    private String normalizeName(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase()
                .replaceAll("\\b(dr|mr|mrs|ms)\\.?\\s+", "")
                .replaceAll("[^a-z\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private float writeLine(PDPageContentStream content, PDType1Font font, int fontSize, float x, float y, String text) throws IOException {
        content.beginText();
        content.setFont(font, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(text);
        content.endText();
        return y - (fontSize + 6);
    }

    private float writeWrapped(PDPageContentStream content, PDType1Font font, int fontSize, float x, float y, float maxWidth, String text) throws IOException {
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        float currentY = y;

        for (String word : words) {
            String candidate = line.length() == 0 ? word : line + " " + word;
            float candidateWidth = font.getStringWidth(candidate) / 1000 * fontSize;
            if (candidateWidth > maxWidth && line.length() > 0) {
                currentY = writeLine(content, font, fontSize, x, currentY, line.toString());
                line = new StringBuilder(word);
            } else {
                line = new StringBuilder(candidate);
            }
        }

        if (line.length() > 0) {
            currentY = writeLine(content, font, fontSize, x, currentY, line.toString());
        }

        return currentY;
    }

    private String formatIssuedAt(Prescription prescription) {
        if (prescription.getIssuedAt() == null) {
            return "Pending issue timestamp";
        }
        return prescription.getIssuedAt().format(PDF_DATE_FORMAT);
    }

    private String defaultText(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private String optionalSegment(String prefix, String value) {
        return StringUtils.hasText(value) ? prefix + value.trim() : "";
    }
}
