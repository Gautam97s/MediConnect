package com.mediconnect.auth.service;

import com.mediconnect.auth.model.AuthResponse;
import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.ForgotPasswordRequest;
import com.mediconnect.auth.model.LoginRequest;
import com.mediconnect.auth.model.LogoutRequest;
import com.mediconnect.auth.model.PasswordResetToken;
import com.mediconnect.auth.model.RefreshTokenRequest;
import com.mediconnect.auth.model.RegisterRequest;
import com.mediconnect.auth.model.ResetPasswordRequest;
import com.mediconnect.auth.model.UserRole;
import com.mediconnect.auth.repository.AuthUserRepository;
import com.mediconnect.auth.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final StringRedisTemplate redisTemplate;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${auth.refresh.expiration-ms}")
    private long refreshExpirationMs;

    @Value("${auth.refresh.prefix}")
    private String refreshPrefix;

    public AuthService(
            AuthUserRepository authUserRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            StringRedisTemplate redisTemplate,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.authUserRepository = authUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.redisTemplate = redisTemplate;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        UserRole role = parseRole(request.getRole());
        String licenseNumber = normalizeLicenseNumber(request.getLicenseNumber());

        if (authUserRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (role == UserRole.DOCTOR && licenseNumber == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor license number is required");
        }

        AuthUser user = AuthUser.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .licenseNumber(licenseNumber)
                .build();

        AuthUser saved = authUserRepository.save(user);
        String token = jwtService.generateToken(saved);
        String refreshToken = issueRefreshToken(saved);

        return toAuthResponse(saved, token, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        UserRole requestedRole = parseRole(request.getRole());
        if (requestedRole != user.getRole()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Selected role does not match your account");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = issueRefreshToken(user);
        return toAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String incomingRefreshToken = request.getRefreshToken();
        String userIdValue = getUserIdFromRefreshToken(incomingRefreshToken);

        Long userId;
        try {
            userId = Long.parseLong(userIdValue);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        AuthUser user = authUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh session is invalid"));

        // Rotate token for better session security.
        deleteRefreshToken(incomingRefreshToken);
        String newRefreshToken = issueRefreshToken(user);
        String accessToken = jwtService.generateToken(user);

        return toAuthResponse(user, accessToken, newRefreshToken);
    }

    public Map<String, String> logout(LogoutRequest request) {
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            deleteRefreshToken(request.getRefreshToken());
        }
        return Map.of("message", "Logged out successfully");
    }

    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        if (user == null) {
            // Keep response generic for security.
            return Map.of("message", "If this email exists, reset instructions were sent.");
        }

        // Keep one active token per user.
        passwordResetTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);

        // In production, this token should be sent via email.
        return Map.of(
                "message", "Reset token generated. Use this token in reset-password call.",
                "token", token
        );
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken tokenData = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is invalid or expired"));

        if (tokenData.isUsed() || tokenData.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is invalid or expired");
        }

        AuthUser user = tokenData.getUser();

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        authUserRepository.save(user);

        tokenData.setUsed(true);
        passwordResetTokenRepository.save(tokenData);

        return Map.of("message", "Password updated successfully");
    }

    private UserRole parseRole(String roleValue) {
        if (roleValue == null || roleValue.isBlank()) {
            return UserRole.PATIENT;
        }

        String normalized = roleValue.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }

        try {
            return UserRole.valueOf(normalized);
        } catch (IllegalArgumentException ignored) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
    }

    private AuthResponse toAuthResponse(AuthUser user, String token, String refreshToken) {
        long now = System.currentTimeMillis();
        return AuthResponse.builder()
                .token(token)
            .expiresAtEpochMs(jwtService.getExpiresAtEpochMs())
                .refreshToken(refreshToken)
                .refreshExpiresAtEpochMs(now + refreshExpirationMs)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .licenseNumber(user.getLicenseNumber())
                        .build())
                .build();
    }

    private String normalizeLicenseNumber(String licenseNumber) {
        if (licenseNumber == null) {
            return null;
        }

        String normalized = licenseNumber.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String issueRefreshToken(AuthUser user) {
        String refreshToken = UUID.randomUUID().toString();
        String key = refreshPrefix + refreshToken;

        try {
            redisTemplate.opsForValue().set(key, String.valueOf(user.getId()), Duration.ofMillis(refreshExpirationMs));
        } catch (RedisConnectionFailureException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Redis session store unavailable. Configure REDIS env keys and ensure Redis is reachable."
            );
        }

        return refreshToken;
    }

    private String getUserIdFromRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token is required");
        }

        try {
            String userIdValue = redisTemplate.opsForValue().get(refreshPrefix + refreshToken);
            if (userIdValue == null || userIdValue.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh session expired or invalid");
            }
            return userIdValue;
        } catch (RedisConnectionFailureException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Redis session store unavailable. Configure REDIS env keys and ensure Redis is reachable."
            );
        }
    }

    private void deleteRefreshToken(String refreshToken) {
        try {
            redisTemplate.delete(refreshPrefix + refreshToken);
        } catch (RedisConnectionFailureException ex) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Redis session store unavailable. Configure REDIS env keys and ensure Redis is reachable."
            );
        }
    }

}
