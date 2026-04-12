package com.mediconnect.doctorslots.service;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.service.JwtService;
import com.mediconnect.doctorslots.model.DoctorAvailability;
import com.mediconnect.doctorslots.model.DoctorAvailabilityRequest;
import com.mediconnect.doctorslots.model.DoctorAvailabilityResponse;
import com.mediconnect.doctorslots.repository.DoctorAvailabilityRepository;
import com.mediconnect.realtime.RealtimeEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final AuthUserRepository authUserRepository;
    private final JwtService jwtService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public DoctorAvailabilityService(
            DoctorAvailabilityRepository doctorAvailabilityRepository,
            AuthUserRepository authUserRepository,
            JwtService jwtService,
            RealtimeEventPublisher realtimeEventPublisher
    ) {
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.authUserRepository = authUserRepository;
        this.jwtService = jwtService;
        this.realtimeEventPublisher = realtimeEventPublisher;
    }

    public List<DoctorAvailabilityResponse> getDoctorSlots(String doctorIdsParam) {
        List<Long> doctorIds = parseDoctorIds(doctorIdsParam);
        if (doctorIds.isEmpty()) {
            return List.of();
        }

        return doctorAvailabilityRepository.findByBookingDoctorIdIn(doctorIds).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public DoctorAvailabilityResponse updateDoctorSlots(String authorizationHeader, DoctorAvailabilityRequest request) {
        AuthUser user = resolveCurrentUser(authorizationHeader);
        if (user.getRole() != UserRole.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only doctors can manage consultation slots");
        }

        Long bookingDoctorId = request.getBookingDoctorId();
        if (bookingDoctorId == null || bookingDoctorId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking doctor id is required");
        }

        String doctorName = normalizeDoctorName(request.getDoctorName());
        if (doctorName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor name is required");
        }

        List<String> normalizedSlots = normalizeSlots(request.getSlots());

        DoctorAvailability availability = doctorAvailabilityRepository.findByBookingDoctorId(bookingDoctorId)
                .orElseGet(() -> DoctorAvailability.builder()
                        .bookingDoctorId(bookingDoctorId)
                        .doctorName(doctorName)
                        .build());

        availability.setDoctorName(doctorName);
        availability.setUpdatedByUserId(user.getId());
        availability.setSlots(normalizedSlots);

        DoctorAvailability saved = doctorAvailabilityRepository.save(availability);
        DoctorAvailabilityResponse response = toResponse(saved);
        realtimeEventPublisher.publishDoctorSlotsUpdated(response);
        return response;
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

    private List<Long> parseDoctorIds(String doctorIdsParam) {
        if (doctorIdsParam == null || doctorIdsParam.isBlank()) {
            return List.of();
        }

        return List.of(doctorIdsParam.split(",")).stream()
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> {
                    try {
                        return Long.valueOf(value);
                    } catch (NumberFormatException ex) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "doctorIds must contain only numeric ids");
                    }
                })
                .toList();
    }

    private List<String> normalizeSlots(List<String> slots) {
        if (slots == null) {
            return List.of();
        }

        LinkedHashSet<String> uniqueSlots = new LinkedHashSet<>();
        for (String slot : slots) {
            String normalized = normalizeSlot(slot);
            if (normalized != null) {
                uniqueSlots.add(normalized);
            }
        }

        List<String> sorted = new ArrayList<>(uniqueSlots);
        sorted.sort(Comparator.comparingInt(this::toSlotMinutes));
        return sorted;
    }

    private String normalizeSlot(String slot) {
        if (slot == null) {
            return null;
        }

        String normalized = slot.trim().toUpperCase();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeDoctorName(String doctorName) {
        if (doctorName == null) {
            return null;
        }

        String normalized = doctorName.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private int toSlotMinutes(String slotLabel) {
        if (slotLabel == null) {
            return Integer.MAX_VALUE;
        }

        String normalized = slotLabel.trim().toUpperCase();
        String[] parts = normalized.split("\\s+");
        if (parts.length != 2) {
            return Integer.MAX_VALUE;
        }

        String[] timeParts = parts[0].split(":");
        if (timeParts.length != 2) {
            return Integer.MAX_VALUE;
        }

        try {
            int hours = Integer.parseInt(timeParts[0]);
            int minutes = Integer.parseInt(timeParts[1]);
            String meridiem = parts[1];

            if (Objects.equals(meridiem, "PM") && hours != 12) {
                hours += 12;
            }
            if (Objects.equals(meridiem, "AM") && hours == 12) {
                hours = 0;
            }

            return (hours * 60) + minutes;
        } catch (NumberFormatException ex) {
            return Integer.MAX_VALUE;
        }
    }

    private DoctorAvailabilityResponse toResponse(DoctorAvailability availability) {
        return DoctorAvailabilityResponse.builder()
                .bookingDoctorId(availability.getBookingDoctorId())
                .doctorName(availability.getDoctorName())
                .slots(availability.getSlots() == null ? List.of() : List.copyOf(availability.getSlots()))
                .build();
    }
}
