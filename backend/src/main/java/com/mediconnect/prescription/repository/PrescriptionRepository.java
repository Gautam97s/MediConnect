package com.mediconnect.prescription.repository;

import com.mediconnect.prescription.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByAppointmentId(Long appointmentId);
    List<Prescription> findByDoctorIdOrderByIssuedAtDesc(Long doctorId);
    List<Prescription> findByPatientNameIgnoreCaseOrderByIssuedAtDesc(String patientName);
    Optional<Prescription> findByAppointmentIdAndPatientNameIgnoreCase(Long appointmentId, String patientName);
    Optional<Prescription> findByAppointmentIdAndDoctorId(Long appointmentId, Long doctorId);
}
