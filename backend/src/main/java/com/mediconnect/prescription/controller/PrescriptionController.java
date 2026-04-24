package com.mediconnect.prescription.controller;

import com.mediconnect.prescription.model.PrescriptionFinalizeRequest;
import com.mediconnect.prescription.model.PrescriptionResponse;
import com.mediconnect.prescription.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping("/complete")
    public PrescriptionResponse finalizeConsultationPrescription(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody PrescriptionFinalizeRequest request
    ) {
        return prescriptionService.finalizeConsultationPrescription(authorizationHeader, request);
    }

    @GetMapping
    public List<PrescriptionResponse> getPrescriptions(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @RequestParam(required = false) Long appointmentId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String patientName
    ) {
        return prescriptionService.getPrescriptions(authorizationHeader, appointmentId, doctorId, patientName);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long id
    ) {
        byte[] pdf = prescriptionService.generatePrescriptionPdf(authorizationHeader, id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=prescription-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
