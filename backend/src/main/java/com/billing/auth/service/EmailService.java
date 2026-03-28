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

            Map<String, String> sender = new HashMap<>();
            sender.put("email", "sampangisuman26@gmail.com");

            Map<String, String> to = new HashMap<>();
            to.put("email", email);

            body.put("sender", sender);
            body.put("to", new Object[]{to});
            body.put("subject", "OTP Verification");
            body.put("htmlContent",
                    "<h3>Your OTP: " + otp + "</h3><p>Valid for 5 minutes</p>");

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