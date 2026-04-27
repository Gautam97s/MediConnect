package com.mediconnect.order.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pharmacy_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prescription_id", nullable = false)
    private Long prescriptionId;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "delivery_address", nullable = false, length = 1000)
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PharmacyOrderStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pharmacy_order_items", joinColumns = @JoinColumn(name = "order_id"))
    @OrderColumn(name = "item_order")
    @Builder.Default
    private List<PharmacyOrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "ordered_at", updatable = false)
    private LocalDateTime orderedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}