package com.fraud.backend.controller;

import com.fraud.backend.model.entity.User;
import com.fraud.backend.repository.UserRepository;
import com.fraud.backend.service.JwtService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        System.out.println("🔐 Login attempt for user: " + request.getUsername());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            var user = userRepository.findByUsername(request.getUsername()).orElseThrow();
            var token = jwtService.generateToken(user);
            System.out.println("✅ Login successful for: " + request.getUsername());
            return ResponseEntity.ok(Map.of("token", token));

        } catch (BadCredentialsException e) {
            System.err.println("❌ Invalid password for user: " + request.getUsername());
            return ResponseEntity.status(403).body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            System.err.println("❌ Login failed: " + e.getMessage());
            e.printStackTrace();
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

    @Data
    public static class AuthRequest {
        private String username;
        private String password;
    }
}