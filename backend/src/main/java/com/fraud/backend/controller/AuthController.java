package com.fraud.backend.controller;

import com.fraud.backend.model.dto.AuthenticationRequest;
import com.fraud.backend.model.dto.AuthenticationResponse;
import com.fraud.backend.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Injection דרך הקונסטרוקטור (Spring מטפל ב- wiring)
    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        // 1. אימות פרטי המשתמש
        // אם האימות נכשל (סיסמה שגויה), ה-authenticationManager זורק Exception
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. אם הגענו לכאן, האימות הצליח. טוענים את פרטי המשתמש
        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 3. יצירת הטוקן JWT
        final String jwt = jwtService.generateToken(userDetails);

        // 4. החזרת הטוקן ל-Frontend
        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }
}