package com.mediconnect.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "phone")
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "medical_number")
    private String medicalNumber;

    @Column(name = "diagnosis", length = 500)
    private String diagnosis;

    @Column(name = "secondary_diagnosis", length = 500)
    private String secondaryDiagnosis;

    @Column(name = "urgent_alerts", length = 500)
    private String urgentAlerts;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_relation")
    private String emergencyContactRelation;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "primary_care_provider_name")
    private String primaryCareProviderName;

    @Column(name = "primary_care_provider_specialty")
    private String primaryCareProviderSpecialty;

    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_plan")
    private String insurancePlan;

    @Column(name = "insurance_member_id")
    private String insuranceMemberId;

    @Column(name = "insurance_group_number")
    private String insuranceGroupNumber;

    @Column(name = "primary_care_visit_copay")
    private String primaryCareVisitCopay;

    @Column(name = "specialist_visit_copay")
    private String specialistVisitCopay;

    @Column(name = "emergency_room_copay")
    private String emergencyRoomCopay;

    @Column(name = "prescription_drugs_copay")
    private String prescriptionDrugsCopay;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
