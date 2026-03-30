package com.mediconnect.auth.repository;

import com.mediconnect.auth.model.AuthUser;
import com.mediconnect.auth.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser(AuthUser user);

    long deleteByExpiresAtBefore(LocalDateTime cutoff);
}
