package com.mediconnect.order.repository;

import com.mediconnect.order.model.PharmacyOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PharmacyOrderRepository extends JpaRepository<PharmacyOrder, Long> {

    List<PharmacyOrder> findByPatientIdOrderByOrderedAtDesc(Long patientId);
}