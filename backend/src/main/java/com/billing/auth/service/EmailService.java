package com.billing.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String email, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("a65c89001@smtp-brevo.com"); // ✅ IMPORTANT
            helper.setTo(email);
            helper.setSubject("OTP Verification - Billing App");

            helper.setText(
                    "<h3>Your OTP is: " + otp + "</h3>" +
                    "<p>Valid for 5 minutes.</p>",
                    true // HTML enabled
            );

            mailSender.send(message);

            System.out.println("✅ Email sent successfully");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Email sending failed", e);
        }
    }
}