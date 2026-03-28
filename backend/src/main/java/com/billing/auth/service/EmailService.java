package com.billing.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${BREVO_API_KEY}")
    private String apiKey;

    public void sendOtp(String email, String otp) {
        try {
            String url = "https://api.brevo.com/v3/smtp/email";

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, Object> body = new HashMap<>();

            // ✅ sender
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "SLN Traders");
            sender.put("email", "sampangisuman26@gmail.com");

            // ✅ receiver
            Map<String, String> to = new HashMap<>();
            to.put("email", email);

            // 🔥 IMPORTANT (you missed this)
            body.put("sender", sender);
            body.put("to", new Object[]{to});

            // subject
            body.put("subject", "🔐 OTP Verification - SLN Traders");

            // premium HTML email
            body.put("htmlContent",
                "<div style='background:#f4f6f8; padding:30px; font-family:Segoe UI, Arial, sans-serif;'>" +

                    "<div style='max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);'>" +

                        "<h2 style='color:#2c3e50; text-align:center; margin-bottom:10px;'>SLN Traders</h2>" +
                        "<p style='text-align:center; color:#7f8c8d; font-size:14px;'>Secure Billing System</p>" +

                        "<hr style='margin:20px 0;'>" +

                        "<p style='font-size:16px; color:#333;'>Hello,</p>" +
                        "<p style='font-size:15px; color:#555;'>Use the following One-Time Password (OTP) to continue:</p>" +

                        "<div style='text-align:center; margin:30px 0;'>" +
                            "<span style='display:inline-block; padding:15px 25px; font-size:28px; font-weight:bold; " +
                            "letter-spacing:6px; background:#ecf3ff; color:#2d89ef; border-radius:8px;'>" +
                                otp +
                            "</span>" +
                        "</div>" +

                        "<p style='font-size:14px; color:#555;'>This OTP is valid for <b>5 minutes</b>.</p>" +
                        "<p style='font-size:13px; color:#888;'>Do not share this code with anyone.</p>" +

                        "<hr style='margin:25px 0;'>" +

                        "<p style='font-size:12px; color:#999; text-align:center;'>© 2026 SLN Traders. All rights reserved.</p>" +

                    "</div>" +

                "</div>"
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, request, String.class);

            System.out.println("✅ Email sent: " + response.getStatusCode());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Email sending failed", e);
        }
    }
}