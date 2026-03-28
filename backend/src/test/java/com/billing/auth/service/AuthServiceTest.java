package com.billing.auth.service;

import com.billing.auth.config.JwtUtil;
import com.billing.auth.dto.ResetPasswordRequest;
import com.billing.auth.entity.User;
import com.billing.auth.repository.OtpRepository;
import com.billing.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        OtpService otpService = new OtpService(otpRepository);
        EmailService emailService = new EmailService();
        JwtUtil jwtUtil = new JwtUtil("test-secret-key-test-secret-key-1234", 60_000L);
        authService = new AuthService(userRepository, otpService, passwordEncoder, jwtUtil, emailService);
    }

    @Test
    void resetPasswordChecksUserBeforeConsumingOtp() {
        ResetPasswordRequest request = new ResetPasswordRequest("missing@example.com", "password123", "123456");
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.resetPassword(request)
        );

        assertEquals("User not found", exception.getMessage());
        verifyNoInteractions(otpRepository);
    }

    @Test
    void resetPasswordConsumesOtpWhenUserExists() {
        ResetPasswordRequest request = new ResetPasswordRequest("user@example.com", "password123", "123456");
        User user = new User();
        user.setEmail("user@example.com");
        user.setVerified(true);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.resetPassword(request)
        );

        assertEquals("Invalid OTP", exception.getMessage());
    }
}
