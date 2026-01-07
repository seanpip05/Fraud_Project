package com.fraud.backend.service;

import com.fraud.backend.model.entity.AttackScenario;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.*;

/**
 * מנוע התקיפה המרכזי.
 * אחראי על ייצור וניהול זרם בקשות ה-HTTP לעבר שרת המטרה.
 */
@Service
public class AttackGenerator {

    // שימוש ב-HttpClient מובנה של Java 11+ לביצועים אופטימליים
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    // ניהול משימות מתוזמנות (RPS)
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    // מפה לשמירת המשימות הרצות כדי שנוכל לעצור אותן
    private final Map<Long, ScheduledFuture<?>> activeTasks = new ConcurrentHashMap<>();

    /**
     * התחלת הרצת תרחיש תקיפה
     */
    public void startAttack(AttackScenario scenario) {
        // שליפת פרמטרים מה-JSONB
        Map<String, Object> params = scenario.getParams();
        int rps = (int) params.getOrDefault("rps", 1);
        String targetUrl = "http://localhost:8081/api/target"; // כתובת שרת 2 (זמני)

        // חישוב השהייה בין בקשות לפי ה-RPS
        long delayMicros = 1_000_000 / rps;

        ScheduledFuture<?> task = scheduler.scheduleAtFixedRate(() -> {
            executeSingleRequest(targetUrl, scenario.getType(), params);
        }, 0, delayMicros, TimeUnit.MICROSECONDS);

        activeTasks.put(scenario.getId(), task);
        System.out.println("Started attack: " + scenario.getName() + " with " + rps + " RPS");
    }

    /**
     * עצירת תרחיש רץ
     */
    public void stopAttack(Long scenarioId) {
        ScheduledFuture<?> task = activeTasks.remove(scenarioId);
        if (task != null) {
            task.cancel(true);
            System.out.println("Stopped attack ID: " + scenarioId);
        }
    }

    /**
     * ביצוע בקשת HTTP בודדת
     */
    private void executeSingleRequest(String url, String type, Map<String, Object> params) {
        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(2));

            // לוגיקה לפי סוג התקיפה
            if ("BRUTE_FORCE".equals(type)) {
                String payload = (String) params.getOrDefault("payload", "");
                requestBuilder.POST(HttpRequest.BodyPublishers.ofString(payload))
                        .header("Content-Type", "application/x-www-form-urlencoded");
            } else {
                requestBuilder.GET();
            }

            httpClient.sendAsync(requestBuilder.build(), HttpResponse.BodyHandlers.discarding())
                    .thenAccept(res -> {
                        // כאן נוכל בהמשך לאסוף נתונים על הצלחה/חסימה
                    });

        } catch (Exception e) {
            // התעלמות משגיאות בזמן תקיפה כדי לא לעצור את המנוע
        }
    }
}