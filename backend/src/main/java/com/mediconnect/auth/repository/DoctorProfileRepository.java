package com.mediconnect.auth.repository;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUser(AuthUser user);
}
