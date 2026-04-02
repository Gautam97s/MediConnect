package com.mediconnect.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private long expiresAtEpochMs;
    private String refreshToken;
    private long refreshExpiresAtEpochMs;
    private UserDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private UserRole role;
        private String licenseNumber;
        private String phone;
        private LocalDate dateOfBirth;
        private String gender;
        private String bloodType;
        private String address;
        private String medicalNumber;
        private String diagnosis;
        private String secondaryDiagnosis;
        private String urgentAlerts;
        private String emergencyContactName;
        private String emergencyContactRelation;
        private String emergencyContactPhone;
        private String primaryCareProviderName;
        private String primaryCareProviderSpecialty;
        private String insuranceProvider;
        private String insurancePlan;
        private String insuranceMemberId;
        private String insuranceGroupNumber;
        private String primaryCareVisitCopay;
        private String specialistVisitCopay;
        private String emergencyRoomCopay;
        private String prescriptionDrugsCopay;
    }
}
