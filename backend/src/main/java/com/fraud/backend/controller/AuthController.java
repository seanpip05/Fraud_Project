package com.fraud.backend.controller;

import com.fraud.backend.model.entity.User;
import com.fraud.backend.repository.UserRepository;
import com.fraud.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // ==================== מנגנון Lockout ====================

    /** מבנה נתונים לניהול ניסיונות כושלים לפי IP */
    private static class LoginAttemptInfo {
        int failedAttempts = 0;
        LocalDateTime lockoutUntil = null;
        LocalDateTime lastAttempt = null;
    }

    /** מאגר ניסיונות כושלים בזיכרון — לפי כתובת IP */
    private final ConcurrentHashMap<String, LoginAttemptInfo> loginAttempts = new ConcurrentHashMap<>();

    /** מספר הניסיונות המותרים לפני נעילה */
    private static final int MAX_FAILED_ATTEMPTS = 5;

    /** משך זמן הנעילה בדקות */
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    // ===========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        String username = request.getUsername();

        System.out.println("🔐 Login attempt for user: " + username + " from IP: " + clientIp);

        // --- בדיקת Lockout ---
        LoginAttemptInfo attemptInfo = loginAttempts.computeIfAbsent(clientIp, k -> new LoginAttemptInfo());

        if (attemptInfo.lockoutUntil != null && LocalDateTime.now().isBefore(attemptInfo.lockoutUntil)) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), attemptInfo.lockoutUntil).toMinutes() + 1;
            System.err.println("🔒 Login BLOCKED for IP " + clientIp + " — Account locked for " + minutesLeft + " more minute(s).");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                    "error", "Account locked due to too many failed login attempts.",
                    "retryAfterMinutes", minutesLeft,
                    "message", "Please wait " + minutesLeft + " minute(s) before trying again."
            ));
        }

        // --- Rate Limiting: הגנה מניסיון מהיר מדי ---
        if (attemptInfo.lastAttempt != null) {
            long msSinceLastAttempt = java.time.Duration.between(attemptInfo.lastAttempt, LocalDateTime.now()).toMillis();
            if (msSinceLastAttempt < 1000) { // פחות משנייה בין ניסיונות
                System.err.println("⚡ Rate limit hit for IP " + clientIp + " — Too fast!");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                        "error", "Too many requests. Please slow down."
                ));
            }
        }
        attemptInfo.lastAttempt = LocalDateTime.now();

        // --- ניסיון אימות ---
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.getPassword()));

            var user = userRepository.findByUsername(username).orElseThrow();
            var token = jwtService.generateToken(user);

            // איפוס מונה הניסיונות הכושלים לאחר הצלחה
            loginAttempts.remove(clientIp);

            System.out.println("✅ Login successful for: " + username + " from IP: " + clientIp);
            logSecurityEvent("LOGIN_SUCCESS", clientIp, username);

            return ResponseEntity.ok(Map.of("token", token));

        } catch (BadCredentialsException e) {
            // ספירת הכישלון
            attemptInfo.failedAttempts++;
            int remaining = MAX_FAILED_ATTEMPTS - attemptInfo.failedAttempts;

            System.err.println("❌ Invalid password for user: " + username
                    + " from IP: " + clientIp
                    + " | Failed attempts: " + attemptInfo.failedAttempts + "/" + MAX_FAILED_ATTEMPTS);

            logSecurityEvent("LOGIN_FAILED", clientIp, username);

            // בדיקה אם הגיע לסף הנעילה
            if (attemptInfo.failedAttempts >= MAX_FAILED_ATTEMPTS) {
                attemptInfo.lockoutUntil = LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES);
                System.err.println("🔒🔒🔒 IP " + clientIp + " LOCKED OUT until " + attemptInfo.lockoutUntil
                        + " after " + MAX_FAILED_ATTEMPTS + " failed attempts!");

                logSecurityEvent("ACCOUNT_LOCKOUT", clientIp, username);

                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                        "error", "Too many failed login attempts. Account locked for " + LOCKOUT_DURATION_MINUTES + " minutes.",
                        "locked", true,
                        "retryAfterMinutes", LOCKOUT_DURATION_MINUTES
                ));
            }

            return ResponseEntity.status(403).body(Map.of(
                    "error", "Invalid username or password",
                    "remainingAttempts", remaining
            ));

        } catch (Exception e) {
            System.err.println("❌ Login failed: " + e.getMessage());
            logSecurityEvent("LOGIN_ERROR", clientIp, username);
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // הוספת אפשרות להירשם כדי לייצר משתמש עם סיסמה מוצפנת ב-DB
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        // כאן הקסם - אנחנו מצפינים את הסיסמה לפני השמירה
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf("ADMIN"));

        userRepository.save(user);
        System.out.println("👤 New user registered: " + request.getUsername());
        return ResponseEntity.ok(Map.of("message", "User registered successfully. Now try to login."));
    }

    /**
     * תיעוד אירועי אבטחה בלוג המערכת — Audit Trail.
     * בסביבת ייצור זה היה נשמר ל-DB, כאן מדפיס לקונסול.
     */
    private void logSecurityEvent(String eventType, String ip, String username) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.println("📋 [SECURITY AUDIT] " + timestamp + " | " + eventType + " | IP: " + ip + " | User: " + username);
    }

    @Data
    public static class AuthRequest {
        private String username;
        private String password;
    }
}