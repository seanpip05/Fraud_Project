package com.fraud.victim.service;

import com.fraud.victim.model.BlockedIp;
import com.fraud.victim.repository.AttackLogRepository;
import com.fraud.victim.repository.BlockedIpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AttackLogRepository attackLogRepository;
    private final BlockedIpRepository blockedIpRepository;

    private final Map<String, RequestCounter> requestTrackers = new ConcurrentHashMap<>();

    // מפה חדשה לזיהוי דפוסים: IP -> סט של פיילודים/שמות משתמש שנצפו
    private final Map<String, Set<String>> patternTrackers = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS_PER_SECOND = 10;
    private static final int MAX_UNIQUE_PATTERNS = 5; // חסימה אם מנסים יותר מ-5 ערכים שונים

    public AnalyticsService(AttackLogRepository attackLogRepository, BlockedIpRepository blockedIpRepository) {
        this.attackLogRepository = attackLogRepository;
        this.blockedIpRepository = blockedIpRepository;
    }

    /**
     * בדיקה משולבת: גם Rate Limit וגם זיהוי דפוסים (Brute Force)
     */
    public boolean processAndCheckAutoBlock(String ip, String payload) {
        if (isIpBlocked(ip)) return true;

        // 1. בדיקת Rate Limit (הצפה)
        RequestCounter counter = requestTrackers.computeIfAbsent(ip, k -> new RequestCounter());
        if (counter.incrementAndGet() > MAX_REQUESTS_PER_SECOND) {
            blockIp(ip, "Auto-block: Rate limit exceeded");
            return true;
        }

        // 2. זיהוי דפוסים (Brute Force)
        if (payload != null && !payload.isEmpty() && !payload.equals("No payload")) {
            Set<String> seenPayloads = patternTrackers.computeIfAbsent(ip, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()));
            seenPayloads.add(payload);

            if (seenPayloads.size() > MAX_UNIQUE_PATTERNS) {
                blockIp(ip, "Pattern Detection: Brute Force attempt detected (Multiple unique payloads)");
                patternTrackers.remove(ip); // ניקוי לאחר חסימה
                return true;
            }
        }

        return false;
    }

    public Map<String, Object> getQuickStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAttacks", attackLogRepository.count());
        stats.put("attacksLastMinute", attackLogRepository.countByTimestampAfter(LocalDateTime.now().minusMinutes(1)));
        stats.put("blockedIpsCount", blockedIpRepository.count());
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
}