package com.fraud.victim.controller;

import com.fraud.victim.model.AttackLog;
import com.fraud.victim.repository.AttackLogRepository;
import com.fraud.victim.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173") // מאפשר ל-React לגשת למידע
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AttackLogRepository attackLogRepository;

    public AnalyticsController(AnalyticsService analyticsService, AttackLogRepository attackLogRepository) {
        this.analyticsService = analyticsService;
        this.attackLogRepository = attackLogRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(analyticsService.getQuickStats());
    }

    @GetMapping("/blacklist")
    public ResponseEntity<Set<String>> getBlacklist() {
        return ResponseEntity.ok(analyticsService.getBlacklist());
    }

    /**
     * שליפת כל לוגי ההתקפות מהמסד עבור עמוד הדוחות.
     * ממוינים לפי זמן (החדש ביותר קודם).
     */
    @GetMapping("/logs")
    public ResponseEntity<List<AttackLog>> getAllLogs() {
        List<AttackLog> logs = attackLogRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(logs);
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