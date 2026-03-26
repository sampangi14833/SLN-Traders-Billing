package com.billing.auth.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DtoNormalizationTest {

    @Test
    void requestDtosNormalizeEmailFields() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("  USER@Example.COM ");

        OtpRequest otpRequest = new OtpRequest();
        otpRequest.setEmail("  USER@Example.COM ");

        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("  USER@Example.COM ");
        registerRequest.setName("  John Doe  ");

        ResetPasswordRequest resetPasswordRequest = new ResetPasswordRequest();
        resetPasswordRequest.setEmail("  USER@Example.COM ");
        resetPasswordRequest.setOtp(" 123456 ");

        assertEquals("user@example.com", loginRequest.getEmail());
        assertEquals("user@example.com", otpRequest.getEmail());
        assertEquals("user@example.com", registerRequest.getEmail());
        assertEquals("John Doe", registerRequest.getName());
        assertEquals("user@example.com", resetPasswordRequest.getEmail());
        assertEquals("123456", resetPasswordRequest.getOtp());
    }
}
