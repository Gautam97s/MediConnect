package com.mediconnect.doctorslots.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailabilityRequest {

    @NotNull
    private Long bookingDoctorId;

    @NotBlank
    private String doctorName;

    private List<String> slots;
}
