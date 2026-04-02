package com.mediconnect.auth.service;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.DoctorProfile;
import com.mediconnect.auth.model.DoctorVerificationStatus;
import com.mediconnect.auth.model.PatientProfile;
import com.mediconnect.auth.model.UpdateUserProfileRequest;
import com.mediconnect.auth.model.UserProfileResponse;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.repository.DoctorProfileRepository;
import com.mediconnect.auth.repository.PatientProfileRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserProfileService {

    private final AuthUserRepository authUserRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final JwtService jwtService;

    public UserProfileService(
            AuthUserRepository authUserRepository,
            DoctorProfileRepository doctorProfileRepository,
            PatientProfileRepository patientProfileRepository,
            JwtService jwtService
    ) {
        this.authUserRepository = authUserRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.jwtService = jwtService;
    }

    public UserProfileResponse getProfile(String authorizationHeader) {
        AuthUser user = resolveCurrentUser(authorizationHeader);
        return toUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String authorizationHeader, UpdateUserProfileRequest request) {
        AuthUser user = resolveCurrentUser(authorizationHeader);

        String normalizedName = normalize(request.getName());
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (normalizedName == null || normalizedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and email are required");
        }

        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPhone(normalize(request.getPhone()));
        if (user.getRole() == UserRole.DOCTOR) {
            DoctorProfile profile = getOrCreateDoctorProfile(user);
            profile.setLicenseNumber(normalize(request.getLicenseNumber()));
            if (profile.getVerificationStatus() == null) {
                profile.setVerificationStatus(DoctorVerificationStatus.PENDING);
            }
            doctorProfileRepository.save(profile);
        } else {
            PatientProfile profile = getOrCreatePatientProfile(user);
            profile.setDateOfBirth(request.getDateOfBirth());
            profile.setGender(normalize(request.getGender()));
            profile.setBloodType(normalize(request.getBloodType()));
            profile.setAddress(normalize(request.getAddress()));
            profile.setMedicalNumber(normalize(request.getMedicalNumber()));
            profile.setDiagnosis(normalize(request.getDiagnosis()));
            profile.setSecondaryDiagnosis(normalize(request.getSecondaryDiagnosis()));
            profile.setUrgentAlerts(normalize(request.getUrgentAlerts()));
            profile.setEmergencyContactName(normalize(request.getEmergencyContactName()));
            profile.setEmergencyContactRelation(normalize(request.getEmergencyContactRelation()));
            profile.setEmergencyContactPhone(normalize(request.getEmergencyContactPhone()));
            profile.setPrimaryCareProviderName(normalize(request.getPrimaryCareProviderName()));
            profile.setPrimaryCareProviderSpecialty(normalize(request.getPrimaryCareProviderSpecialty()));
            profile.setInsuranceProvider(normalize(request.getInsuranceProvider()));
            profile.setInsurancePlan(normalize(request.getInsurancePlan()));
            profile.setInsuranceMemberId(normalize(request.getInsuranceMemberId()));
            profile.setInsuranceGroupNumber(normalize(request.getInsuranceGroupNumber()));
            profile.setPrimaryCareVisitCopay(normalize(request.getPrimaryCareVisitCopay()));
            profile.setSpecialistVisitCopay(normalize(request.getSpecialistVisitCopay()));
            profile.setEmergencyRoomCopay(normalize(request.getEmergencyRoomCopay()));
            profile.setPrescriptionDrugsCopay(normalize(request.getPrescriptionDrugsCopay()));
            patientProfileRepository.save(profile);
        }

        try {
            AuthUser updated = authUserRepository.save(user);
            return toUserProfileResponse(updated);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
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

    private UserProfileResponse toUserProfileResponse(AuthUser user) {
        DoctorProfile doctorProfile = doctorProfileRepository.findByUser(user).orElse(null);
        PatientProfile patientProfile = patientProfileRepository.findByUser(user).orElse(null);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
            .licenseNumber(doctorProfile != null ? doctorProfile.getLicenseNumber() : user.getLicenseNumber())
            .dateOfBirth(patientProfile != null ? patientProfile.getDateOfBirth() : user.getDateOfBirth())
            .gender(patientProfile != null ? patientProfile.getGender() : user.getGender())
            .bloodType(patientProfile != null ? patientProfile.getBloodType() : user.getBloodType())
            .address(patientProfile != null ? patientProfile.getAddress() : user.getAddress())
            .medicalNumber(patientProfile != null ? patientProfile.getMedicalNumber() : user.getMedicalNumber())
            .diagnosis(patientProfile != null ? patientProfile.getDiagnosis() : user.getDiagnosis())
            .secondaryDiagnosis(patientProfile != null ? patientProfile.getSecondaryDiagnosis() : user.getSecondaryDiagnosis())
            .urgentAlerts(patientProfile != null ? patientProfile.getUrgentAlerts() : user.getUrgentAlerts())
            .emergencyContactName(patientProfile != null ? patientProfile.getEmergencyContactName() : user.getEmergencyContactName())
            .emergencyContactRelation(patientProfile != null ? patientProfile.getEmergencyContactRelation() : user.getEmergencyContactRelation())
            .emergencyContactPhone(patientProfile != null ? patientProfile.getEmergencyContactPhone() : user.getEmergencyContactPhone())
            .primaryCareProviderName(patientProfile != null ? patientProfile.getPrimaryCareProviderName() : user.getPrimaryCareProviderName())
            .primaryCareProviderSpecialty(patientProfile != null ? patientProfile.getPrimaryCareProviderSpecialty() : user.getPrimaryCareProviderSpecialty())
            .insuranceProvider(patientProfile != null ? patientProfile.getInsuranceProvider() : user.getInsuranceProvider())
            .insurancePlan(patientProfile != null ? patientProfile.getInsurancePlan() : user.getInsurancePlan())
            .insuranceMemberId(patientProfile != null ? patientProfile.getInsuranceMemberId() : user.getInsuranceMemberId())
            .insuranceGroupNumber(patientProfile != null ? patientProfile.getInsuranceGroupNumber() : user.getInsuranceGroupNumber())
            .primaryCareVisitCopay(patientProfile != null ? patientProfile.getPrimaryCareVisitCopay() : user.getPrimaryCareVisitCopay())
            .specialistVisitCopay(patientProfile != null ? patientProfile.getSpecialistVisitCopay() : user.getSpecialistVisitCopay())
            .emergencyRoomCopay(patientProfile != null ? patientProfile.getEmergencyRoomCopay() : user.getEmergencyRoomCopay())
            .prescriptionDrugsCopay(patientProfile != null ? patientProfile.getPrescriptionDrugsCopay() : user.getPrescriptionDrugsCopay())
                .build();
    }

        private DoctorProfile getOrCreateDoctorProfile(AuthUser user) {
            return doctorProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    DoctorProfile profile = DoctorProfile.builder()
                        .user(user)
                        .licenseNumber(normalize(user.getLicenseNumber()))
                        .verificationStatus(DoctorVerificationStatus.PENDING)
                        .build();
                    return doctorProfileRepository.save(profile);
                });
        }

        private PatientProfile getOrCreatePatientProfile(AuthUser user) {
            return patientProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    PatientProfile profile = PatientProfile.builder()
                        .user(user)
                        .dateOfBirth(user.getDateOfBirth())
                        .gender(user.getGender())
                        .bloodType(user.getBloodType())
                        .address(user.getAddress())
                        .medicalNumber(user.getMedicalNumber())
                        .diagnosis(user.getDiagnosis())
                        .secondaryDiagnosis(user.getSecondaryDiagnosis())
                        .urgentAlerts(user.getUrgentAlerts())
                        .emergencyContactName(user.getEmergencyContactName())
                        .emergencyContactRelation(user.getEmergencyContactRelation())
                        .emergencyContactPhone(user.getEmergencyContactPhone())
                        .primaryCareProviderName(user.getPrimaryCareProviderName())
                        .primaryCareProviderSpecialty(user.getPrimaryCareProviderSpecialty())
                        .insuranceProvider(user.getInsuranceProvider())
                        .insurancePlan(user.getInsurancePlan())
                        .insuranceMemberId(user.getInsuranceMemberId())
                        .insuranceGroupNumber(user.getInsuranceGroupNumber())
                        .primaryCareVisitCopay(user.getPrimaryCareVisitCopay())
                        .specialistVisitCopay(user.getSpecialistVisitCopay())
                        .emergencyRoomCopay(user.getEmergencyRoomCopay())
                        .prescriptionDrugsCopay(user.getPrescriptionDrugsCopay())
                        .build();
                    return patientProfileRepository.save(profile);
                });
        }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeEmail(String email) {
        String normalized = normalize(email);
        return normalized == null ? null : normalized.toLowerCase();
    }
}
