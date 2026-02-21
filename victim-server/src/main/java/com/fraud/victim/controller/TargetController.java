package com.fraud.victim.controller;

import com.fraud.victim.model.AttackLog;
import com.fraud.victim.repository.AttackLogRepository;
import com.fraud.victim.service.AnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * בקר המטרה בשרת 2 (הקורבן).
 * כולל כעת הגנה אקטיבית המבוססת על רשימת חסימה.
 */
@RestController
@RequestMapping("/api")
public class TargetController {

    private final AttackLogRepository attackLogRepository;
    private final AnalyticsService analyticsService;

    // הזרקת התלויות דרך הקונסטרקטור
    public TargetController(AttackLogRepository attackLogRepository, AnalyticsService analyticsService) {
        this.attackLogRepository = attackLogRepository;
        this.analyticsService = analyticsService;
    }

    /**
     * נקודת קצה מרכזית לסימולציית תקיפות.
     * בודקת חסימה לפני ביצוע הלוגיקה.
     */
    @RequestMapping(value = "/target", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> generalTarget(@RequestBody(required = false) String body, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();

        // בדיקה: האם הכתובת נמצאת ברשימת החסימה?
        if (analyticsService.isIpBlocked(clientIp)) {
            System.out.println("⛔ ניסיון גישה נחסם מכתובת: " + clientIp);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", "Access Denied",
                            "reason", "IP Blocked by Defense System",
                            "status", 403
                    ));
        }

        System.out.println("📥 בקשה התקבלה מ-" + clientIp + ". שומר לוג ל-DB...");

        // שמירת הלוג בבסיס הנתונים
        saveLog(request, body);

        return ResponseEntity.ok(Map.of(
                "message", "Target hit and logged!",
                "server", "Server 2 (Victim)",
                "status", "success"
        ));
    }

    /**
     * מתודת עזר ליצירת ישות הלוג ושמירתה ב-PostgreSQL
     */
    private void saveLog(HttpServletRequest request, String payload) {
        try {
            AttackLog log = new AttackLog();
            log.setClientIp(request.getRemoteAddr());
            log.setMethod(request.getMethod());
            log.setEndpoint(request.getRequestURI());
            log.setPayload(payload != null ? payload : "No payload");
            log.setTimestamp(LocalDateTime.now());
            log.setResponseStatus(200);

            attackLogRepository.save(log);
            System.out.println("✅ התקפה נרשמה בהצלחה. מזהה: " + log.getId());
        } catch (Exception e) {
            System.err.println("❌ שגיאה בשמירת הלוג: " + e.getMessage());
        }
    }
}