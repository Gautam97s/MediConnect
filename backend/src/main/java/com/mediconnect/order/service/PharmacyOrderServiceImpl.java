package com.mediconnect.order.service;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.repository.PatientProfileRepository;
import com.mediconnect.auth.service.JwtService;
import com.mediconnect.order.model.CreatePrescriptionOrderRequest;
import com.mediconnect.order.model.PharmacyOrder;
import com.mediconnect.order.model.PharmacyOrderItem;
import com.mediconnect.order.model.PharmacyOrderResponse;
import com.mediconnect.order.model.PharmacyOrderStatus;
import com.mediconnect.order.repository.PharmacyOrderRepository;
import com.mediconnect.prescription.model.Prescription;
import com.mediconnect.prescription.model.PrescriptionItem;
import com.mediconnect.prescription.repository.PrescriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PharmacyOrderServiceImpl implements PharmacyOrderService {

    private final PharmacyOrderRepository pharmacyOrderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AuthUserRepository authUserRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final JwtService jwtService;

    public PharmacyOrderServiceImpl(
            PharmacyOrderRepository pharmacyOrderRepository,
            PrescriptionRepository prescriptionRepository,
            AuthUserRepository authUserRepository,
            PatientProfileRepository patientProfileRepository,
            JwtService jwtService
    ) {
        this.pharmacyOrderRepository = pharmacyOrderRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.authUserRepository = authUserRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public PharmacyOrderResponse createPrescriptionOrder(String authorizationHeader, CreatePrescriptionOrderRequest request) {
        AuthUser user = resolveCurrentUser(authorizationHeader);
        if (user.getRole() != UserRole.PATIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patients can place pharmacy orders");
        }

        Prescription prescription = prescriptionRepository.findById(request.getPrescriptionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

        if (!namesLikelyMatch(user.getName(), prescription.getPatientName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot order medicines for another patient");
        }

        String deliveryAddress = resolveDeliveryAddress(user, request.getDeliveryAddress());
        if (deliveryAddress == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery address is required");
        }

        if (prescription.getItems() == null || prescription.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prescription has no medicine items");
        }

        PharmacyOrder order = PharmacyOrder.builder()
                .prescriptionId(prescription.getId())
                .appointmentId(prescription.getAppointmentId())
                .patientId(user.getId())
                .patientName(prescription.getPatientName())
                .doctorName(prescription.getDoctorName())
                .deliveryAddress(deliveryAddress)
                .status(PharmacyOrderStatus.PLACED)
                .items(toOrderItems(prescription.getItems()))
                .build();

        PharmacyOrder saved = pharmacyOrderRepository.save(order);
        return toResponse(saved);
    }

    @Override
    public List<PharmacyOrderResponse> getMyOrders(String authorizationHeader) {
        AuthUser user = resolveCurrentUser(authorizationHeader);
        if (user.getRole() != UserRole.PATIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only patients can access pharmacy orders");
        }

        return pharmacyOrderRepository.findByPatientIdOrderByOrderedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private List<PharmacyOrderItem> toOrderItems(List<PrescriptionItem> prescriptionItems) {
        return prescriptionItems.stream()
                .map(item -> PharmacyOrderItem.builder()
                        .medicationName(item.getMedicationName())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .instructions(item.getInstructions())
                        .build())
                .collect(Collectors.toList());
    }

    private PharmacyOrderResponse toResponse(PharmacyOrder order) {
        return PharmacyOrderResponse.builder()
                .id(order.getId())
                .prescriptionId(order.getPrescriptionId())
                .appointmentId(order.getAppointmentId())
                .patientId(order.getPatientId())
                .patientName(order.getPatientName())
                .doctorName(order.getDoctorName())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .orderedAt(order.getOrderedAt())
                .items(order.getItems().stream()
                        .map(item -> PharmacyOrderResponse.PharmacyOrderItemData.builder()
                                .medicationName(item.getMedicationName())
                                .dosage(item.getDosage())
                                .frequency(item.getFrequency())
                                .duration(item.getDuration())
                                .instructions(item.getInstructions())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private String resolveDeliveryAddress(AuthUser user, String requestedAddress) {
        String normalizedRequestedAddress = normalizeText(requestedAddress);
        if (normalizedRequestedAddress != null) {
            return normalizedRequestedAddress;
        }

        String profileAddress = patientProfileRepository.findByUser(user)
                .map(profile -> normalizeText(profile.getAddress()))
                .orElse(null);

        if (profileAddress != null) {
            return profileAddress;
        }

        return normalizeText(user.getAddress());
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

    private String normalizeText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }
}