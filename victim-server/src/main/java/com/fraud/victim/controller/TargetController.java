package com.fraud.victim.controller;

import com.fraud.victim.model.AttackLog;
import com.fraud.victim.repository.AttackLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * בקר המטרה המעודכן בשרת 2.
 * מבצע שמירה של כל תקיפה נכנסת למסד הנתונים.
 */
@RestController
@RequestMapping("/api")
public class TargetController {

    // הזרקת ה-Repository לניהול השמירה
    private final AttackLogRepository attackLogRepository;

    public TargetController(AttackLogRepository attackLogRepository) {
        this.attackLogRepository = attackLogRepository;
    }

    /**
     * נקודת קצה לדימוי Brute Force על Login
     */
    @PostMapping("/login")
    public ResponseEntity<?> mockLogin(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        saveLog(request, "BRUTE_FORCE_ATTEMPT", "User: " + credentials.get("username"));
        return ResponseEntity.ok(Map.of("status", "attempt_received"));
    }

    /**
     * ה-Endpoint המרכזי ששרת 1 תוקף בסימולציה
     */
    @RequestMapping(value = "/target", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> generalTarget(@RequestBody(required = false) String body, HttpServletRequest request) {

        System.out.println("Processing incoming attack and saving to DB...");

        // קריאה למתודת העזר לשמירה
        saveLog(request, "GENERAL_ATTACK", body);

        return ResponseEntity.ok(Map.of(
                "message", "Target hit and logged!",
                "server", "Server 2 (Victim)"
        ));
    }

    /**
     * מתודת עזר ליצירת ישות הלוג ושמירתה
     */
    private void saveLog(HttpServletRequest request, String type, String payload) {
        try {
            AttackLog log = new AttackLog();
            log.setClientIp(request.getRemoteAddr());
            log.setMethod(request.getMethod());
            log.setEndpoint(request.getRequestURI());
            log.setPayload(payload != null ? payload : "No payload");
            log.setTimestamp(LocalDateTime.now());
            log.setResponseStatus(200);

            attackLogRepository.save(log);
            System.out.println("Attack logged successfully with ID: " + log.getId());
        } catch (Exception e) {
            System.err.println("Error saving attack log: " + e.getMessage());
        }
    }
}