package com.mediconnect.prescription.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {

    private Long id;
    private Long appointmentId;
    private Long doctorId;
    private String doctorName;
    private String patientName;
    private String reason;
    private String consultationNotes;
    private LocalDateTime issuedAt;
    private List<PrescriptionItemData> items;
    private String pdfPath;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionItemData {
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
