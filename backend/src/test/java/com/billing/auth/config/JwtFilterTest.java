package com.billing.auth.config;

import com.billing.auth.entity.User;
import com.billing.auth.repository.UserRepository;
import com.billing.auth.service.CustomUserDetailsService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

class JwtFilterTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void disabledUsersAreNotAuthenticatedFromJwt() throws Exception {
        JwtUtil jwtUtil = new JwtUtil("test-secret-key-test-secret-key-1234", 60_000L);
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        CustomUserDetailsService userDetailsService = new CustomUserDetailsService(userRepository);
        JwtFilter filter = new JwtFilter(jwtUtil, userDetailsService);

        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("encoded-password");
        user.setVerified(false);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        String token = jwtUtil.generateToken("user@example.com");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/private");
        request.addHeader("Authorization", "Bearer " + token);

        filter.doFilterInternal(request, new MockHttpServletResponse(), new MockFilterChain());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
