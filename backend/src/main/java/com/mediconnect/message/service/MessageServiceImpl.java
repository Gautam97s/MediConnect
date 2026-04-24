package com.mediconnect.message.service;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.DoctorProfile;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.repository.DoctorProfileRepository;
import com.mediconnect.auth.service.JwtService;
import com.mediconnect.message.model.Message;
import com.mediconnect.message.model.MessageRequest;
import com.mediconnect.message.repository.MessageRepository;
import com.mediconnect.realtime.RealtimeEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final AuthUserRepository authUserRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final JwtService jwtService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public MessageServiceImpl(
            MessageRepository messageRepository,
            AuthUserRepository authUserRepository,
            DoctorProfileRepository doctorProfileRepository,
            JwtService jwtService,
            RealtimeEventPublisher realtimeEventPublisher
    ) {
        this.messageRepository = messageRepository;
        this.authUserRepository = authUserRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.jwtService = jwtService;
        this.realtimeEventPublisher = realtimeEventPublisher;
    }

    @Override
    public List<Message> getMessages(String authorizationHeader, Long doctorId, String patientName) {
        AuthUser user = resolveCurrentUser(authorizationHeader);

        if (user.getRole() == UserRole.DOCTOR) {
            Long resolvedDoctorId = requireDoctorId(doctorId);
            validateDoctorAccess(user, resolvedDoctorId);

            if (hasText(patientName)) {
                return messageRepository.findByDoctorIdAndPatientNameIgnoreCaseOrderByCreatedAtAsc(
                        resolvedDoctorId,
                        patientName.trim()
                );
            }

            return messageRepository.findByDoctorIdOrderByCreatedAtAsc(resolvedDoctorId);
        }

        String resolvedPatientName = user.getName();
        if (!hasText(resolvedPatientName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient name is missing from the signed-in account");
        }

        if (doctorId != null && doctorId > 0) {
            return messageRepository.findByDoctorIdAndPatientNameIgnoreCaseOrderByCreatedAtAsc(
                    doctorId,
                    resolvedPatientName.trim()
            );
        }

        return messageRepository.findByPatientNameIgnoreCaseOrderByCreatedAtAsc(resolvedPatientName.trim());
    }

    @Override
    @Transactional
    public Message createMessage(String authorizationHeader, MessageRequest request) {
        AuthUser user = resolveCurrentUser(authorizationHeader);
        Long doctorId = requireDoctorId(request.getDoctorId());
        String patientName = normalizePatientName(request.getPatientName());
        String content = normalizeContent(request.getContent());

        if (user.getRole() == UserRole.DOCTOR) {
            validateDoctorAccess(user, doctorId);
        } else if (!namesLikelyMatch(user.getName(), patientName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only send messages for their own conversation");
        }

        Message saved = messageRepository.save(
                Message.builder()
                        .doctorId(doctorId)
                        .patientName(patientName)
                        .senderUserId(user.getId())
                        .senderRole(user.getRole())
                        .senderName(user.getName())
                        .content(content)
                        .build()
        );

        realtimeEventPublisher.publishMessageCreated(saved);
        return saved;
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

    private Long requireDoctorId(Long doctorId) {
        if (doctorId == null || doctorId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor id is required");
        }
        return doctorId;
    }

    private void validateDoctorAccess(AuthUser user, Long doctorId) {
        boolean matchesAuthUserId = user.getId().equals(doctorId);
        boolean matchesDoctorProfileId = doctorProfileRepository.findByUser(user)
                .map(DoctorProfile::getId)
                .filter(profileId -> profileId.equals(doctorId))
                .isPresent();

        if (!matchesAuthUserId && !matchesDoctorProfileId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor cannot access another doctor's messages");
        }
    }

    private String normalizePatientName(String patientName) {
        if (!hasText(patientName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient name is required");
        }
        return patientName.trim();
    }

    private String normalizeContent(String content) {
        if (!hasText(content)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message content is required");
        }
        return content.trim();
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

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
