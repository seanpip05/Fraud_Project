package com.fraud.victim.service;

import com.fraud.victim.model.BlockedIp;
import com.fraud.victim.model.SystemRule;
import com.fraud.victim.repository.AttackLogRepository;
import com.fraud.victim.repository.BlockedIpRepository;
import com.fraud.victim.repository.SystemRuleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AttackLogRepository attackLogRepository;
    private final BlockedIpRepository blockedIpRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private final Map<String, RequestCounter> requestTrackers = new ConcurrentHashMap<>();
    private final Map<String, PayloadTracker> patternTrackers = new ConcurrentHashMap<>();

    @Value("${backend.url:http://localhost:8080}")
    private String backendUrl;

    // רשימת החוקים שנטענת בזיכרון השרת כל 5 שניות משרת ה-SOC
    private List<RuleDTO> activeRules = new ArrayList<>();

    public AnalyticsService(AttackLogRepository attackLogRepository,
                            BlockedIpRepository blockedIpRepository) {
        this.attackLogRepository = attackLogRepository;
        this.blockedIpRepository = blockedIpRepository;
    }

    @PostConstruct
    public void init() {
        refreshRules();
    }

    /**
     * פונקציה מתוזמנת ששולפת את החוקים הפעילים ממסד הנתונים של ה-SOC באמצעות API.
     * במקום לפנות ל-DB בכל בקשה בנפרד, החוקים מתרעננים בזיכרון כל 5 שניות.
     */
    @Scheduled(fixedRate = 5000)
    public void refreshRules() {
        try {
            String url = backendUrl + "/api/rules";
            RuleDTO[] rulesArray = restTemplate.getForObject(url, RuleDTO[].class);
            if (rulesArray != null) {
                List<RuleDTO> allRules = Arrays.asList(rulesArray);
                activeRules = allRules.stream()
                        .filter(RuleDTO::isActive)
                        .collect(Collectors.toList());

                System.out.println("🔄 Rules Refresh: Fetched " + allRules.size() + " total rules from SOC Backend, "
                        + activeRules.size() + " are currently ACTIVE.");
            }
        } catch (Exception e) {
            System.err.println("❌ Error fetching rules from SOC API (Backend): " + e.getMessage());
        }
    }

    /**
     * פונקציית העל לחישוב ציון סיכון דינמי.
     * כעת משתמשת בחוקים החיים שנלקחו משרת ה-SOC ומחזירה גם סיבה לחסימה לצורך HTTP
     * Code מדויק.
     */
    public RiskEvaluationResult evaluateRiskAndBlock(String ip, String payload, String endpoint) {
        if (isIpBlocked(ip)) {
            return new RiskEvaluationResult(100, "MANUAL_BLOCK_OR_PREVIOUS"); // סירוב הרשאה מידי
        }

        int score = 5; // ציון "רעש" כברירת מחדל
        long now = System.currentTimeMillis();

        int rps = 1;
        RequestCounter counter = requestTrackers.computeIfAbsent(ip, k -> new RequestCounter());
        rps = counter.incrementAndGet();

        PayloadTracker pTracker = null;
        if (payload != null && !payload.isEmpty() && !payload.equals("No payload")) {
            pTracker = patternTrackers.computeIfAbsent(ip, k -> new PayloadTracker());
            pTracker.addPayload(payload, now);
        }

        if (activeRules.isEmpty()) {
            // System.out.println("⚠️ DEBUG: No active rules in memory!");
        }

        String primaryReason = "NONE";
        // System.out.println("🔍 Evaluating request from " + ip + " | RPS: " + rps + " | Rules: " + activeRules.size());

        for (RuleDTO rule : activeRules) {
            String attackType = rule.getAttackType();
            boolean ruleViolated = false;

            // בדיקת התקפות SQLi או XSS
            if (attackType.equals("SQL Injection") || attackType.equals("XSS") || attackType.equals("Tampering")) {
                if (payload != null) {
                    String pUpper = payload.toUpperCase();
                    if (pUpper.contains("OR 1=1") || pUpper.contains("DROP ") || pUpper.contains("<SCRIPT>")) {
                        ruleViolated = true;
                    }
                }
            }

            // בדיקת Brute Force (ספירת פיילודים ייחודיים בחלון זמן מסוים)
            if (attackType.equals("Brute Force") && pTracker != null) {
                int uniqueCount = pTracker.getUniquePayloadsInWindow(rule.getTimeWindow() * 1000L, now);
                if (uniqueCount >= rule.getThreshold()) {
                    ruleViolated = true;
                }
            }

            // בדיקת Logic Flaw / Flood (ספירת בקשות לשנייה)
            if (attackType.equals("Logic Flaw") || attackType.equals("Flood")) {
                if (rps >= rule.getThreshold()) {
                    ruleViolated = true;
                }
            }

            if (ruleViolated) {
                System.out.println("🚨 RULE TRIGGERED: " + rule.getRuleName() + " (Threshold: " + rule.getThreshold() + ")");
                if ("BLOCK".equalsIgnoreCase(rule.getAction())) {
                    score = 100;
                    primaryReason = attackType.toUpperCase().replace(" ", "_");
                    break;
                } else if ("ALERT".equalsIgnoreCase(rule.getAction())) {
                    score += 40;
                    if (primaryReason.equals("NONE")) {
                        primaryReason = attackType.toUpperCase().replace(" ", "_") + "_ALERT";
                    }
                }
            }
        }

        if (score > 5) {
            System.out.println("📊 FINAL CALCULATION -> IP: " + ip + " | Score: " + score + " | Reason: " + primaryReason);
        }

        int finalScore = Math.min(100, score);

        // אכיפה
        if (finalScore >= 100) {
            blockIp(ip, "Risk Engine: Defense System rules triggered immediate block. Reason: " + primaryReason);
            patternTrackers.remove(ip);
            requestTrackers.remove(ip);
        }

        return new RiskEvaluationResult(finalScore, primaryReason);
    }

    public Map<String, Object> getQuickStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAttacks", attackLogRepository.count());
        stats.put("attacksLastMinute", attackLogRepository.countByTimestampAfter(LocalDateTime.now().minusMinutes(1)));
        stats.put("blockedIpsCount", blockedIpRepository.count());
        stats.put("currentRiskScore",
                attackLogRepository.getLastRiskScore());
        return stats;
    }

    public void blockIp(String ip, String reason) {
        if (!blockedIpRepository.existsByIpAddress(ip)) {
            BlockedIp blocked = BlockedIp.builder()
                    .ipAddress(ip)
                    .reason(reason)
                    .blockedAt(LocalDateTime.now())
                    .build();
            blockedIpRepository.save(blocked);
            System.out.println("🛡️ " + reason + " for IP: " + ip);
        }
    }

    @Transactional
    public void unblockIp(String ip) {
        blockedIpRepository.deleteByIpAddress(ip);
        requestTrackers.remove(ip);
        patternTrackers.remove(ip);
    }

    public boolean isIpBlocked(String ip) {
        return blockedIpRepository.existsByIpAddress(ip);
    }

    public Set<String> getBlacklist() {
        return blockedIpRepository.findAll().stream()
                .map(BlockedIp::getIpAddress)
                .collect(Collectors.toSet());
    }

    private static class RequestCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private long lastResetTime = System.currentTimeMillis();

        public int incrementAndGet() {
            long now = System.currentTimeMillis();
            if (now - lastResetTime > 1000) {
                count.set(0);
                lastResetTime = now;
            }
            return count.incrementAndGet();
        }
    }

    private static class PayloadTracker {
        // שומרים את הפיילוד ואת הזמן שהוא הגיע
        private final Map<String, Long> payloadTimestamps = new ConcurrentHashMap<>();

        public void addPayload(String payload, long timestamp) {
            payloadTimestamps.put(payload, timestamp);
        }

        public int getUniquePayloadsInWindow(long timeWindowMs, long currentTime) {
            // ניקוי פיילודים ישנים כדי לא להעמיס על הזיכרון
            payloadTimestamps.entrySet().removeIf(entry -> currentTime - entry.getValue() > timeWindowMs);
            return payloadTimestamps.size();
        }
    }

    public static class RiskEvaluationResult {
        private final int score;
        private final String reason;

        public RiskEvaluationResult(int score, String reason) {
            this.score = score;
            this.reason = reason;
        }

        public int getScore() {
            return score;
        }

        public String getReason() {
            return reason;
        }
    }

    public static class RuleDTO {
        private String name;

        @JsonProperty("isActive")
        private boolean isActive;

        private Integer threshold;
        private Integer timeWindow;
        private String action;
        private String attackType;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isActive() {
            return isActive;
        }

        public void setActive(boolean active) {
            isActive = active;
        }

        public Integer getThreshold() {
            return threshold;
        }

        public void setThreshold(Integer threshold) {
            this.threshold = threshold;
        }

        public Integer getTimeWindow() {
            return timeWindow;
        }

        public void setTimeWindow(Integer timeWindow) {
            this.timeWindow = timeWindow;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getAttackType() {
            return attackType;
        }

        public void setAttackType(String attackType) {
            this.attackType = attackType;
        }

        public String getRuleName() {
            return name;
        } // Helper for compatibility
    }
}