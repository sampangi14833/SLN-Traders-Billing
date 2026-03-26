package com.billing.auth.service;

import com.billing.auth.exception.RateLimitExceededException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuthRateLimitServiceTest {

    @Test
    void loginAttemptsAreBlockedAfterThreshold() {
        MutableClock clock = new MutableClock(Instant.parse("2026-01-01T00:00:00Z"));
        AuthRateLimitService service = new AuthRateLimitService(clock);

        for (int i = 0; i < 10; i++) {
            service.checkLoginAttempt("user@example.com", "127.0.0.1");
        }

        assertThrows(
                RateLimitExceededException.class,
                () -> service.checkLoginAttempt("user@example.com", "127.0.0.1")
        );
    }

    @Test
    void loginAttemptsRecoverAfterWindowExpires() {
        MutableClock clock = new MutableClock(Instant.parse("2026-01-01T00:00:00Z"));
        AuthRateLimitService service = new AuthRateLimitService(clock);

        for (int i = 0; i < 10; i++) {
            service.checkLoginAttempt("user@example.com", "127.0.0.1");
        }

        assertThrows(
                RateLimitExceededException.class,
                () -> service.checkLoginAttempt("user@example.com", "127.0.0.1")
        );

        clock.advance(Duration.ofMinutes(11));

        assertDoesNotThrow(() -> service.checkLoginAttempt("user@example.com", "127.0.0.1"));
    }

    @Test
    void staleBucketsAreRemovedDuringCleanup() {
        MutableClock clock = new MutableClock(Instant.parse("2026-01-01T00:00:00Z"));
        AuthRateLimitService service = new AuthRateLimitService(clock, 1);

        service.checkLoginAttempt("first@example.com", "127.0.0.1");
        assertEquals(2, service.bucketCount());

        clock.advance(Duration.ofMinutes(16));

        service.checkLoginAttempt("second@example.com", "127.0.0.2");

        assertEquals(2, service.bucketCount());
    }

    private static final class MutableClock extends Clock {

        private Instant instant;

        private MutableClock(Instant instant) {
            this.instant = instant;
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }

        private void advance(Duration duration) {
            instant = instant.plus(duration);
        }
    }
}
