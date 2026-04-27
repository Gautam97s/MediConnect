package com.mediconnect.pharmacy.controller;

import com.mediconnect.pharmacy.model.MedicineCatalog;
import com.mediconnect.pharmacy.repository.MedicineCatalogRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineCatalogController {

    private final MedicineCatalogRepository medicineCatalogRepository;

    public MedicineCatalogController(MedicineCatalogRepository medicineCatalogRepository) {
        this.medicineCatalogRepository = medicineCatalogRepository;
    }

    @GetMapping
    public List<MedicineCatalog> getMedicines(@RequestParam(required = false) String q) {
        if (q == null || q.trim().isEmpty()) {
            return medicineCatalogRepository.findAllByOrderByIdAsc();
        }

        String query = q.trim();
        return medicineCatalogRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrderByNameAsc(query, query);
    }
}