package com.billing.auth.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void forgotPasswordDoesNotExposeWhetherEmailExists() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .param("email", "missing@example.com")
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.10");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("If the email is registered, an OTP has been sent"));
    }

    @Test
    void loginValidationRejectsBadPayload() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"bad-email\",\"password\":\"123\"}")
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.11");
                            return request;
                        }))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void repeatedLoginAttemptsAreRateLimited() throws Exception {
        String body = "{\"email\":\"nobody@example.com\",\"password\":\"password1\"}";

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body)
                            .with(request -> {
                                request.setRemoteAddr("127.0.0.12");
                                return request;
                            }))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.12");
                            return request;
                        }))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Too many attempts. Try again later."));
    }
}
