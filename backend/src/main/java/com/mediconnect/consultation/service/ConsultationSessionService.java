package com.mediconnect.consultation.service;

import com.mediconnect.appointment.model.Appointment;
import com.mediconnect.appointment.service.AppointmentService;
import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.DoctorProfile;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.repository.DoctorProfileRepository;
import com.mediconnect.auth.service.JwtService;
import com.mediconnect.consultation.model.ConsultationSessionResponse;
import com.mediconnect.consultation.util.ZegoTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class ConsultationSessionService {

    private static final Pattern ROOM_SAFE_PATTERN = Pattern.compile("[^A-Za-z0-9_-]");
    private static final int DEFAULT_TOKEN_LIFETIME_SECONDS = 4 * 60 * 60;

    private final AppointmentService appointmentService;
    private final AuthUserRepository authUserRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final JwtService jwtService;
    private final long zegoAppId;
    private final String zegoServerSecret;
    private final String zegoServerUrl;

    public ConsultationSessionService(
            AppointmentService appointmentService,
            AuthUserRepository authUserRepository,
            DoctorProfileRepository doctorProfileRepository,
            JwtService jwtService,
            @Value("${zego.app-id:0}") long zegoAppId,
            @Value("${zego.server-secret:}") String zegoServerSecret,
            @Value("${zego.server-url:}") String zegoServerUrl
    ) {
        this.appointmentService = appointmentService;
        this.authUserRepository = authUserRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.jwtService = jwtService;
        this.zegoAppId = zegoAppId;
        this.zegoServerSecret = zegoServerSecret;
        this.zegoServerUrl = zegoServerUrl;
    }

    public ConsultationSessionResponse getSession(String authorizationHeader, Long appointmentId) {
        if (zegoAppId <= 0 || zegoServerSecret == null || zegoServerSecret.isBlank()
                || zegoServerUrl == null || zegoServerUrl.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_IMPLEMENTED,
                    "ZEGO is not configured on the backend. Set zego.app-id, zego.server-secret, and zego.server-url."
            );
        }

        AuthUser user = resolveCurrentUser(authorizationHeader);
        Appointment appointment = appointmentService.getAppointmentById(appointmentId);
        validateUserCanJoin(user, appointment);

        String roomName = buildRoomName(appointmentId);
        String userId = buildUserId(user, appointmentId);
        boolean canPublish = true;
        String token = ZegoTokenGenerator.generateToken(
                zegoAppId,
                userId,
                zegoServerSecret,
                resolveTokenLifetime(appointment.getAppointmentDate()),
                roomName,
                canPublish
        );

        return ConsultationSessionResponse.builder()
                .appointmentId(appointmentId)
                .roomName(roomName)
                .token(token)
                .appId(zegoAppId)
                .serverUrl(zegoServerUrl)
                .userId(userId)
                .userName(user.getName())
                .canPublish(canPublish)
                .build();
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

    private String buildRoomName(Long appointmentId) {
        return ROOM_SAFE_PATTERN.matcher("mediconnect-appointment-" + appointmentId).replaceAll("-");
    }

    private void validateUserCanJoin(AuthUser user, Appointment appointment) {
        if (user.getRole() == UserRole.DOCTOR) {
            boolean appointmentUsesKnownDoctorId = authUserRepository.findById(appointment.getDoctorId()).isPresent()
                    || doctorProfileRepository.findById(appointment.getDoctorId()).isPresent();
            boolean matchesAuthUserId = user.getId().equals(appointment.getDoctorId());
            boolean matchesDoctorProfileId = doctorProfileRepository.findByUser(user)
                    .map(DoctorProfile::getId)
                    .filter(profileId -> profileId.equals(appointment.getDoctorId()))
                    .isPresent();

            if (appointmentUsesKnownDoctorId && !matchesAuthUserId && !matchesDoctorProfileId) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Doctor cannot join another doctor's consultation");
            }
        }
    }

    private String buildUserId(AuthUser user, Long appointmentId) {
        return user.getRole().name().toLowerCase(Locale.ROOT) + "-" + user.getId() + "-" + appointmentId;
    }

    private int resolveTokenLifetime(LocalDateTime appointmentDate) {
        long secondsUntilExpiry = appointmentDate
                .plusHours(4)
                .toEpochSecond(ZoneOffset.UTC) - LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
        if (secondsUntilExpiry <= 0) {
            return DEFAULT_TOKEN_LIFETIME_SECONDS;
        }
        return (int) Math.min(secondsUntilExpiry, Integer.MAX_VALUE);
    }
}
