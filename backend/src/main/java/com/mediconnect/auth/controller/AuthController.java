package com.mediconnect.auth.controller;

import com.mediconnect.auth.model.AuthResponse;
import com.mediconnect.auth.model.ForgotPasswordRequest;
import com.mediconnect.auth.model.LoginRequest;
import com.mediconnect.auth.model.LogoutRequest;
import com.mediconnect.auth.model.RefreshTokenRequest;
import com.mediconnect.auth.model.RegisterRequest;
import com.mediconnect.auth.model.ResetPasswordRequest;
import com.mediconnect.auth.model.TwoFactorVerifyRequest;
import com.mediconnect.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping({"/register", "/signup"})
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping({"/login", "/signin"})
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify-2fa")
    public AuthResponse verify2fa(@Valid @RequestBody TwoFactorVerifyRequest request) {
        return authService.verify2fa(request);
    }

    @PostMapping({"/forgot-password", "/forgot"})
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@RequestBody(required = false) LogoutRequest request) {
        return authService.logout(request);
    }

    @PostMapping({"/reset-password", "/reset"})
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }
}
