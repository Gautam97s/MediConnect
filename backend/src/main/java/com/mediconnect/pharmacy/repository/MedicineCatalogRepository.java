package com.mediconnect.pharmacy.repository;

import com.mediconnect.pharmacy.model.MedicineCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineCatalogRepository extends JpaRepository<MedicineCatalog, Long> {

    List<MedicineCatalog> findAllByOrderByIdAsc();

    List<MedicineCatalog> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrderByNameAsc(
            String name,
            String category
    );
}