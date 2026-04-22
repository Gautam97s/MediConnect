package com.mediconnect.message.repository;

import com.mediconnect.message.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByDoctorIdOrderByCreatedAtAsc(Long doctorId);
    List<Message> findByDoctorIdAndPatientNameIgnoreCaseOrderByCreatedAtAsc(Long doctorId, String patientName);
    List<Message> findByPatientNameIgnoreCaseOrderByCreatedAtAsc(String patientName);
}
