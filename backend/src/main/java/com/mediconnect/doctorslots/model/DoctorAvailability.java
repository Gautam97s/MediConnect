package com.mediconnect.doctorslots.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table(name = "doctor_availability")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_doctor_id", nullable = false, unique = true)
    private Long bookingDoctorId;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "updated_by_user_id")
    private Long updatedByUserId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "doctor_availability_slots",
            joinColumns = @JoinColumn(name = "doctor_availability_id")
    )
    @Column(name = "slot_label", nullable = false)
    @Builder.Default
    private List<String> slots = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
