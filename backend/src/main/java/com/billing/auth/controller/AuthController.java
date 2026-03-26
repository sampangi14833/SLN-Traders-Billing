package com.billing.auth.controller;

import com.billing.auth.dto.ApiResponse;
import com.billing.auth.dto.LoginRequest;
import com.billing.auth.dto.OtpRequest;
import com.billing.auth.dto.RegisterRequest;
import com.billing.auth.dto.ResetPasswordRequest;
import com.billing.auth.service.AuthRateLimitService;
import com.billing.auth.service.AuthService;
import com.billing.auth.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService service;
    private final OtpService otpService;
    private final AuthRateLimitService rateLimitService;

    public AuthController(AuthService service, OtpService otpService, AuthRateLimitService rateLimitService) {
        this.service = service;
        this.otpService = otpService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestParam @NotBlank @Email String email,
                                                     HttpServletRequest request) {
        rateLimitService.checkOtpSendAttempt(email, request.getRemoteAddr());
        service.sendOtp(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "OTP sent", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verify(@Valid @RequestBody OtpRequest requestBody,
                                                    HttpServletRequest request) {
        rateLimitService.checkOtpVerificationAttempt(requestBody.getEmail(), request.getRemoteAddr());
        boolean valid = otpService.verifyOtp(requestBody.getEmail(), requestBody.getOtp());

        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Invalid OTP", null));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OTP verified", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest requestBody,
                                                      HttpServletRequest request) {
        rateLimitService.checkRegistrationAttempt(requestBody.getEmail(), request.getRemoteAddr());
        String message = service.register(requestBody);

        if ("OTP not verified or expired".equals(message) || "User already exists".equals(message)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, message, null));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, message, null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody LoginRequest requestBody,
                                                     HttpServletRequest request) {
        rateLimitService.checkLoginAttempt(requestBody.getEmail(), request.getRemoteAddr());
        String token = service.login(requestBody);

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Invalid email or password", null));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam @NotBlank @Email String email,
                                                            HttpServletRequest request) {
        rateLimitService.checkOtpSendAttempt(email, request.getRemoteAddr());

        if (!service.isEmailRegistered(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Email not registered", null));
        }

        service.sendOtp(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "OTP sent", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest requestBody,
                                                           HttpServletRequest request) {
        rateLimitService.checkPasswordResetAttempt(requestBody.getEmail(), request.getRemoteAddr());
        service.resetPassword(requestBody);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password updated", null));
    }
}
