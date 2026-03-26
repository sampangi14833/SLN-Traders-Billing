package com.billing.auth.service;

import com.billing.auth.config.JwtUtil;
import com.billing.auth.dto.LoginRequest;
import com.billing.auth.dto.RegisterRequest;
import com.billing.auth.dto.ResetPasswordRequest;
import com.billing.auth.entity.User;
import com.billing.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository repo;
    private final OtpService otpService;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository repo,
                       OtpService otpService,
                       PasswordEncoder encoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.repo = repo;
        this.otpService = otpService;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public boolean isEmailRegistered(String email) {
        return repo.existsByEmail(email);
    }

    public void sendOtp(String email) {
        String otp = otpService.generateOtp(email);
        emailService.sendOtp(email, otp);
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (!otpService.isVerified(request.getEmail())) {
            return "OTP not verified or expired";
        }

        if (repo.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setVerified(true);

        repo.save(user);
        otpService.clearOtp(request.getEmail());

        return "Registered";
    }

    public String login(LoginRequest request) {
        Optional<User> user = repo.findByEmail(request.getEmail());

        if (user.isPresent()
                && user.get().isVerified()
                && encoder.matches(request.getPassword(), user.get().getPassword())) {
            return jwtUtil.generateToken(request.getEmail());
        }

        return null;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean valid = otpService.consumeOtp(request.getEmail(), request.getOtp());
        if (!valid) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        repo.save(user);
    }
}
