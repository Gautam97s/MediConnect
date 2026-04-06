package com.mediconnect.doctorslots.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailabilityResponse {

    private Long bookingDoctorId;
    private String doctorName;
    private List<String> slots;
}
