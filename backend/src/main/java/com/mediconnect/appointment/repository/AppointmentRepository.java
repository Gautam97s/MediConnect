package com.mediconnect.appointment.repository;

import com.mediconnect.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    @Modifying
    @Transactional
    @Query(value = "TRUNCATE TABLE appointments RESTART IDENTITY", nativeQuery = true)
    void truncateAndResetId();
    
    List<Appointment> findByDoctorId(Long doctorId);
    
    List<Appointment> findByPatientNameContainingIgnoreCase(String patientName);
    
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
}
