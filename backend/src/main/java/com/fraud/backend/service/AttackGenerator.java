package com.fraud.backend.service;

import com.fraud.backend.model.entity.AttackScenario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.*;

/**
 * מנוע התקיפה המעודכן - כולל מנגנון עצירה אוטומטית לפי זמן (Duration).
 */
@Service
public class AttackGenerator {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    // ניהול משימות מתוזמנות
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    // מפה לשמירת המשימות הפעילות וניהול זמן הסיום שלהן
    private final Map<Long, ScheduledFuture<?>> activeTasks = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @Value("${victim.url:http://localhost:8081}")
    private String victimUrl;

    public void startAttack(AttackScenario scenario) {
        try {
            Map<String, Object> params = scenario.getParams();

            // שליפת RPS
            int rps = 1;
            if (params != null && params.get("rps") != null) {
                rps = Integer.parseInt(params.get("rps").toString());
            }

            // שליפת משך התקיפה בשניות (ברירת מחדל: 30 שניות)
            int durationSeconds = 30;
            if (params != null && params.get("duration") != null) {
                durationSeconds = Integer.parseInt(params.get("duration").toString());
            }

            // קביעת ה-Endpoint (ברירת מחדל: /api/target)
            String endpoint = (params != null && params.get("targetEndpoint") != null)
                    ? params.get("targetEndpoint").toString()
                    : "/api/target";

            // וידוא שה-endpoint מתחיל ב-/
            if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

            String targetUrl = victimUrl + endpoint;

            // הגדרת עיכוב משתנה בהתאם מדד ה-RPS שביקש המשתמש בממשק
            long delayMicros = 1_000_000 / Math.max(rps, 1);

            // יצירת משימת תקיפה ברקע
            ScheduledFuture<?> attackTask = scheduler.scheduleAtFixedRate(() -> {
                String attackTypeName = scenario.getAttackType() != null ? scenario.getAttackType().getName()
                        : "UNKNOWN";
                executeSingleRequest(targetUrl, attackTypeName, params);
            }, 0, delayMicros, TimeUnit.MICROSECONDS);

            activeTasks.put(scenario.getId(), attackTask);

            // תזמון עצירה אוטומטית למניעת קריסת רשת מוחלטת
            scheduler.schedule(() -> {
                stopAttack(scenario.getId());
            }, durationSeconds, TimeUnit.SECONDS);

        } catch (Exception e) {
            System.err.println("❌ Error starting attack: " + e.getMessage());
        }
    }

    /**
     * עצירה ידנית או אוטומטית של התקיפה
     */
    public void stopAttack(Long scenarioId) {
        ScheduledFuture<?> task = activeTasks.remove(scenarioId);
        if (task != null) {
            task.cancel(true);
            System.out.println("🛑 Attack Stopped for scenario ID: " + scenarioId);
        }
    }

    private void executeSingleRequest(String url, String type, Map<String, Object> params) {
        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(2));

            if ("BRUTE_FORCE".equals(type)) {
                // שליפת הפיילוד כפי שהוזן על ידי האנליסט במיכל ה-React
                String dynamicPayload = (params != null && params.get("payload") != null)
                        ? params.get("payload").toString()
                        : "";

                // מחליף את תגית הרנדום מתוך ה-UI במספר דינמי ליצירת תבניות שונות
                if (dynamicPayload.contains("{{RANDOM}}")) {
                    dynamicPayload = dynamicPayload.replace("{{RANDOM}}", String.valueOf(random.nextInt(10000)));
                }

                requestBuilder.POST(HttpRequest.BodyPublishers.ofString(dynamicPayload))
                        .header("Content-Type", "application/x-www-form-urlencoded");
            } else {
                requestBuilder.GET();
            }

            // שליחת הבקשה ובדיקת התגובה מהשרת הקורבן
            httpClient.sendAsync(requestBuilder.build(), HttpResponse.BodyHandlers.ofString())
                    .thenAccept(response -> {
                        if (response.statusCode() == 403) {
                            // הדפסה רק פעם בכמה זמן כדי לא להציף את הלוג
                            if (random.nextInt(10) == 1) {
                                System.out.println("🛡️ [VICTIM BLOCKED] Requests are still being rejected (403).");
                            }
                        }
                    });

        } catch (Exception e) {
            // התעלמות משגיאות בקצב מהיר
        }
    }
}