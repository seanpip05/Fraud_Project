package com.fraud.backend.service;

import com.fraud.backend.model.entity.AttackScenario;
import com.fraud.backend.repository.AttackScenarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * שירות לניהול מחזור החיים של סימולציה.
 * מקשר בין מסד הנתונים למנוע התקיפה.
 */
@Service
public class SimulationService {

    private final AttackScenarioRepository scenarioRepository;
    private final AttackGenerator attackGenerator;

    public SimulationService(AttackScenarioRepository scenarioRepository, AttackGenerator attackGenerator) {
        this.scenarioRepository = scenarioRepository;
        this.attackGenerator = attackGenerator;
    }

    /**
     * הרצת סימולציה לפי מזהה
     */
    @Transactional
    public void runSimulation(Long scenarioId) {
        AttackScenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));

        // עדכון זמן הרצה אחרון
        scenario.setLastRun(LocalDateTime.now());
        scenarioRepository.save(scenario);

        // הפעלת המנוע
        attackGenerator.startAttack(scenario);
    }

    /**
     * עצירת סימולציה
     */
    public void stopSimulation(Long scenarioId) {
        attackGenerator.stopAttack(scenarioId);
    }
}