package com.billing.auth.service;

import com.billing.auth.entity.Otp;
import com.billing.auth.repository.OtpRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpRepository repo;

    private OtpService service;

    @BeforeEach
    void setUp() {
        service = new OtpService(repo);
    }

    @Test
    void isVerifiedReturnsFalseWhenOtpIsExpired() {
        Otp otp = new Otp(1L, "user@example.com", "123456", LocalDateTime.now().minusMinutes(1), true);
        when(repo.findTopByEmailOrderByExpiryTimeDesc("user@example.com")).thenReturn(Optional.of(otp));

        assertFalse(service.isVerified("user@example.com"));
    }

    @Test
    void consumeOtpDeletesActiveMatchingOtp() {
        Otp otp = new Otp(1L, "user@example.com", "123456", LocalDateTime.now().plusMinutes(5), false);
        when(repo.findTopByEmailOrderByExpiryTimeDesc("user@example.com")).thenReturn(Optional.of(otp));

        assertTrue(service.consumeOtp("user@example.com", "123456"));
        verify(repo).delete(otp);
    }
}
