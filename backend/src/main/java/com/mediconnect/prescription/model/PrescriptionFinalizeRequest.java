package com.mediconnect.prescription.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionFinalizeRequest {

    @NotNull(message = "Appointment id is required")
    private Long appointmentId;

    @NotNull(message = "Doctor id is required")
    private Long doctorId;

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @Size(max = 4000, message = "Consultation notes must be at most 4000 characters")
    private String consultationNotes;

    @Valid
    @NotEmpty(message = "At least one prescription item is required")
    private List<PrescriptionItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionItemRequest {
        @NotBlank(message = "Medication name is required")
        private String medicationName;

        @NotBlank(message = "Dosage is required")
        private String dosage;

        @NotBlank(message = "Frequency is required")
        private String frequency;

        private String duration;

        private String instructions;
    }
}
