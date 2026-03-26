package com.billing.auth.service;

import com.billing.auth.entity.Otp;
import com.billing.auth.repository.OtpRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

@Service
public class OtpService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OtpRepository repo;

    public OtpService(OtpRepository repo) {
        this.repo = repo;
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        Otp record = repo.findTopByEmailOrderByExpiryTimeDesc(email).orElse(new Otp());
        record.setEmail(email);
        record.setOtp(otp);
        record.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        record.setVerified(false);

        repo.save(record);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<Otp> optional = repo.findTopByEmailOrderByExpiryTimeDesc(email);
        if (optional.isEmpty()) {
            return false;
        }

        Otp storedOtp = optional.get();
        if (!matchesActiveOtp(storedOtp, otp)) {
            return false;
        }

        if (!storedOtp.isVerified()) {
            storedOtp.setVerified(true);
            repo.save(storedOtp);
        }

        return true;
    }

    public boolean isVerified(String email) {
        return repo.findTopByEmailOrderByExpiryTimeDesc(email)
                .filter(otp -> otp.getExpiryTime() != null)
                .filter(otp -> otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .map(Otp::isVerified)
                .orElse(false);
    }

    public boolean consumeOtp(String email, String otp) {
        Optional<Otp> optional = repo.findTopByEmailOrderByExpiryTimeDesc(email);
        if (optional.isEmpty()) {
            return false;
        }

        Otp storedOtp = optional.get();
        if (!matchesActiveOtp(storedOtp, otp)) {
            return false;
        }

        repo.delete(storedOtp);
        return true;
    }

    public void clearOtp(String email) {
        repo.findTopByEmailOrderByExpiryTimeDesc(email)
                .ifPresent(repo::delete);
    }

    private boolean matchesActiveOtp(Otp storedOtp, String submittedOtp) {
        return Objects.equals(storedOtp.getOtp(), submittedOtp)
                && storedOtp.getExpiryTime() != null
                && storedOtp.getExpiryTime().isAfter(LocalDateTime.now());
    }
}
