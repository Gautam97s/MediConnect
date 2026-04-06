package com.mediconnect.consultation.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSessionResponse {

    private Long appointmentId;
    private String roomName;
    private String token;
    private Long appId;
    private String serverUrl;
    private String userId;
    private String userName;
    private boolean canPublish;
}
