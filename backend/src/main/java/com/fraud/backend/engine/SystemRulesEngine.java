package com.fraud.backend.engine;

import com.fraud.backend.model.entity.SystemRule;
import com.fraud.backend.repository.SystemRuleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemRulesEngine {

    private final SystemRuleRepository systemRuleRepository;

    // In-memory cache for fast evaluation during attacks
    private final Map<Long, SystemRule> activeRulesCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        reloadRules();
    }

    public void reloadRules() {
        log.info("Reloading system rules into engine cache...");
        List<SystemRule> rules = systemRuleRepository.findAll();
        activeRulesCache.clear();
        rules.stream()
                .filter(SystemRule::isActive)
                .forEach(rule -> activeRulesCache.put(rule.getId(), rule));
        log.info("Loaded {} active rules into cache.", activeRulesCache.size());
    }

    public List<SystemRule> getActiveRules() {
        return List.copyOf(activeRulesCache.values());
    }
}
