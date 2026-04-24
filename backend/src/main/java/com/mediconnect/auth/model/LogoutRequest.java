package com.mediconnect.auth.model;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
