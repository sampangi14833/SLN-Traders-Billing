package com.billing.auth.service;

import com.billing.auth.exception.RateLimitExceededException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AuthRateLimitService {

    private static final String LIMIT_MESSAGE = "Too many attempts. Try again later.";
    private static final Duration MAX_WINDOW = Duration.ofMinutes(15);
    private static final int DEFAULT_CLEANUP_INTERVAL = 100;

    private final ConcurrentHashMap<String, AttemptBucket> buckets = new ConcurrentHashMap<>();
    private final Clock clock;
    private final int cleanupInterval;
    private final AtomicInteger operationCount = new AtomicInteger();

    public AuthRateLimitService() {
        this(Clock.systemUTC(), DEFAULT_CLEANUP_INTERVAL);
    }

    AuthRateLimitService(Clock clock) {
        this(clock, DEFAULT_CLEANUP_INTERVAL);
    }

    AuthRateLimitService(Clock clock, int cleanupInterval) {
        this.clock = clock;
        this.cleanupInterval = cleanupInterval;
    }

    public void checkOtpSendAttempt(String email, String clientId) {
        check("otp-send:email:" + normalize(email), 3, Duration.ofMinutes(10));
        check("otp-send:client:" + normalize(clientId), 10, Duration.ofMinutes(10));
    }

    public void checkOtpVerificationAttempt(String email, String clientId) {
        check("otp-verify:email:" + normalize(email), 10, Duration.ofMinutes(10));
        check("otp-verify:client:" + normalize(clientId), 25, Duration.ofMinutes(10));
    }

    public void checkRegistrationAttempt(String email, String clientId) {
        check("register:email:" + normalize(email), 5, Duration.ofMinutes(10));
        check("register:client:" + normalize(clientId), 15, Duration.ofMinutes(10));
    }

    public void checkLoginAttempt(String email, String clientId) {
        check("login:email:" + normalize(email), 10, Duration.ofMinutes(10));
        check("login:client:" + normalize(clientId), 30, Duration.ofMinutes(10));
    }

    public void checkPasswordResetAttempt(String email, String clientId) {
        check("reset:email:" + normalize(email), 5, Duration.ofMinutes(15));
        check("reset:client:" + normalize(clientId), 15, Duration.ofMinutes(15));
    }

    private void check(String key, int maxAttempts, Duration window) {
        Instant now = clock.instant();
        AttemptBucket bucket = buckets.computeIfAbsent(key, unused -> new AttemptBucket());

        synchronized (bucket) {
            pruneOlderThan(bucket, now.minus(window));

            if (bucket.attempts.size() >= maxAttempts) {
                throw new RateLimitExceededException(LIMIT_MESSAGE);
            }

            bucket.attempts.addLast(now);
        }

        cleanupIfNeeded(now);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    int bucketCount() {
        return buckets.size();
    }

    private void cleanupIfNeeded(Instant now) {
        if (cleanupInterval <= 0 || operationCount.incrementAndGet() % cleanupInterval != 0) {
            return;
        }

        Instant cutoff = now.minus(MAX_WINDOW);
        buckets.forEach((key, bucket) -> {
            synchronized (bucket) {
                pruneOlderThan(bucket, cutoff);
                if (bucket.attempts.isEmpty()) {
                    buckets.remove(key, bucket);
                }
            }
        });
    }

    private void pruneOlderThan(AttemptBucket bucket, Instant cutoff) {
        while (!bucket.attempts.isEmpty() && bucket.attempts.peekFirst().isBefore(cutoff)) {
            bucket.attempts.removeFirst();
        }
    }

    private static final class AttemptBucket {
        private final Deque<Instant> attempts = new ArrayDeque<>();
    }
}
