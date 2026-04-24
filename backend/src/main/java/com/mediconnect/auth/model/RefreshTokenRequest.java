package com.mediconnect.auth.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank
    private String refreshToken;
}
