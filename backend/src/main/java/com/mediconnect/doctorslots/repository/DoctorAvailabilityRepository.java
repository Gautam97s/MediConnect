package com.mediconnect.doctorslots.repository;

import com.mediconnect.doctorslots.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    Optional<DoctorAvailability> findByBookingDoctorId(Long bookingDoctorId);
    List<DoctorAvailability> findByBookingDoctorIdIn(Collection<Long> bookingDoctorIds);
}
