package com.mediconnect.doctorslots.controller;

import com.mediconnect.doctorslots.model.DoctorAvailabilityRequest;
import com.mediconnect.doctorslots.model.DoctorAvailabilityResponse;
import com.mediconnect.doctorslots.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-slots")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    public DoctorAvailabilityController(DoctorAvailabilityService doctorAvailabilityService) {
        this.doctorAvailabilityService = doctorAvailabilityService;
    }

    @GetMapping
    public List<DoctorAvailabilityResponse> getDoctorSlots(@RequestParam(name = "doctorIds", required = false) String doctorIds) {
        return doctorAvailabilityService.getDoctorSlots(doctorIds);
    }

    @PutMapping("/me")
    public DoctorAvailabilityResponse updateDoctorSlots(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody DoctorAvailabilityRequest request
    ) {
        return doctorAvailabilityService.updateDoctorSlots(authorizationHeader, request);
    }
}
