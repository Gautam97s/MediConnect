package com.mediconnect.auth.model;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserProfileRequest {
    private String name;
    private String email;
    private String phone;
    private String licenseNumber;
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
