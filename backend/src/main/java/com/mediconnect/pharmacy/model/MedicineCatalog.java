package com.mediconnect.pharmacy.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "medicine_catalog",
    indexes = {
        @Index(name = "idx_medicine_catalog_name", columnList = "name"),
        @Index(name = "idx_medicine_catalog_category", columnList = "category")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String strength;

    @Column(name = "dosage_form", nullable = false)
    private String dosageForm;

    @Column(nullable = false)
    private String category;

    @Column(name = "pack_size", nullable = false)
    private String packSize;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Boolean covered;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal copay;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 1000)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}