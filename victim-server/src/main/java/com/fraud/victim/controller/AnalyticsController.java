package com.fraud.victim.controller;

import com.fraud.victim.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173") // מאפשר ל-React לגשת למידע
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(analyticsService.getQuickStats());
    }

    @GetMapping("/blacklist")
    public ResponseEntity<Set<String>> getBlacklist() {
        return ResponseEntity.ok(analyticsService.getBlacklist());
    }

    @PostMapping("/block")
    public ResponseEntity<String> blockIp(@RequestParam String ip) {
        analyticsService.blockIp(ip, "Manual block from dashboard");
        return ResponseEntity.ok("IP " + ip + " has been blocked.");
    }


    @DeleteMapping("/unblock")
    public ResponseEntity<String> unblockIp(@RequestParam String ip) {
        System.out.println("🔓 שחרור חסימה ל-IP: " + ip);
        analyticsService.unblockIp(ip);
        return ResponseEntity.ok("IP " + ip + " has been unblocked.");
    }
}