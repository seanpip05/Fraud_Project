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

        if (analyticsService.isIpBlocked(clientIp)) {
            System.out.println("⛔ גישה נחסמה מכתובת: " + clientIp + " (Endpoint: /target)");
            return createBlockedResponse();
        }

        System.out.println("📥 בקשה התקבלה מ-" + clientIp + " בנתיב /api/target");
        saveLog(request, body, 200);

        return ResponseEntity.ok(Map.of(
                "message", "Target hit and logged!",
                "server", "Server 2 (Victim)",
                "status", "success"
        ));
    }

    /**
     * מטרה מציאותית: התחברות (מיועד ל-Brute Force)
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginTarget(@RequestBody(required = false) Map<String, String> creds, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();

        if (analyticsService.isIpBlocked(clientIp)) {
            System.out.println("⛔ גישה נחסמה מכתובת: " + clientIp + " (Endpoint: /login)");
            return createBlockedResponse();
        }

        System.out.println("🔐 הגיע ניסיון התחברות ל-/api/login מ-" + clientIp);

        // כאן כל ניסיון (מלבד משתמש אדמין עם סיסמת אדמין) שגוי
        boolean isSuccess = creds != null && "admin".equals(creds.get("username")) && "admin".equals(creds.get("password"));
        int status = isSuccess ? 200 : 401;

        saveLog(request, creds != null ? creds.toString() : "No payload", status);

        if (isSuccess) {
            return ResponseEntity.ok(Map.of("message", "Login successful"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    /**
     * מטרה מציאותית: חיפוש מוצרים (מיועד ל-SQL Injection)
     */
    @GetMapping("/products")
    public ResponseEntity<?> productsTarget(@RequestParam(required = false) String query, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();

        if (analyticsService.isIpBlocked(clientIp)) {
            System.out.println("⛔ גישה נחסמה מכתובת: " + clientIp + " (Endpoint: /products)");
            return createBlockedResponse();
        }

        System.out.println("📦 בקשה לחיפוש מוצרים הגיעה ל-/api/products מ-" + clientIp);
        saveLog(request, "Query: " + query, 200);

        return ResponseEntity.ok(Map.of(
                "message", "Products list fetched",
                "results", 15,
                "query", query != null ? query : ""
        ));
    }

    /**
     * מטרה מציאותית: תשלום/צ'קאאוט (מיועד ל-Parameter Tampering או Logic Flaw)
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutTarget(@RequestBody(required = false) String payload, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();

        if (analyticsService.isIpBlocked(clientIp)) {
            System.out.println("⛔ גישה נחסמה מכתובת: " + clientIp + " (Endpoint: /checkout)");
            return createBlockedResponse();
        }

        System.out.println("💳 בקשת תשלום הגיעה ל-/api/checkout מ-" + clientIp);
        saveLog(request, payload, 200);

        return ResponseEntity.ok(Map.of(
                "message", "Checkout process started",
                "transactionId", "TXN-" + System.currentTimeMillis()
        ));
    }

    private ResponseEntity<Map<String, Object>> createBlockedResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", "Access Denied",
                        "reason", "IP Blocked by Defense System",
                        "status", 403
                ));
    }

    /**
     * מתודת עזר ליצירת ישות הלוג ושמירתה ב-PostgreSQL
     */
    private void saveLog(HttpServletRequest request, String payload, int status) {
        try {
            AttackLog log = new AttackLog();
            log.setClientIp(request.getRemoteAddr());
            log.setMethod(request.getMethod());
            log.setEndpoint(request.getRequestURI());
            log.setPayload(payload != null ? payload : "No payload");
            log.setTimestamp(LocalDateTime.now());
            log.setResponseStatus(status);
            attackLogRepository.save(log);
            System.out.println("✅ התקפה נרשמה בהצלחה. מזהה: " + log.getId());
        } catch (Exception e) {
            System.err.println("❌ שגיאה בשמירת הלוג: " + e.getMessage());
        }
    }
}