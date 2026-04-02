package com.mediconnect.auth.repository;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUser(AuthUser user);
}
