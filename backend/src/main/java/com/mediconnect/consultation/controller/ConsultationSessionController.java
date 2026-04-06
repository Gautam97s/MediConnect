package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.model.ConsultationSessionResponse;
import com.mediconnect.consultation.service.ConsultationSessionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationSessionController {

    private final ConsultationSessionService consultationSessionService;

    public ConsultationSessionController(ConsultationSessionService consultationSessionService) {
        this.consultationSessionService = consultationSessionService;
    }

    @GetMapping("/{appointmentId}/session")
    public ConsultationSessionResponse getSession(
            @RequestHeader(name = "Authorization", required = false) String authorizationHeader,
            @PathVariable Long appointmentId
    ) {
        return consultationSessionService.getSession(authorizationHeader, appointmentId);
    }
}
