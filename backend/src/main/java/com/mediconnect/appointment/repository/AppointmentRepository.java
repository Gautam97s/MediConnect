package com.mediconnect.appointment.repository;

import com.mediconnect.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByDoctorId(Long doctorId);
    
    List<Appointment> findByPatientNameContainingIgnoreCase(String patientName);
    
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);
}
