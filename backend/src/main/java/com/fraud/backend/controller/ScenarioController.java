package com.fraud.backend.controller;

import com.fraud.backend.model.dto.CreateScenarioDTO;
import com.fraud.backend.model.entity.AttackScenario;
import com.fraud.backend.model.entity.User;
import com.fraud.backend.repository.AttackScenarioRepository;
import com.fraud.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    private final AttackScenarioRepository scenarioRepository;
    private final UserRepository userRepository;

    public ScenarioController(AttackScenarioRepository scenarioRepository, UserRepository userRepository) {
        this.scenarioRepository = scenarioRepository;
        this.userRepository = userRepository;
    }

    // 1. POST /api/scenarios: יצירת תרחיש חדש
    // דורש JWT תקין ב-Header
    @PostMapping
    public ResponseEntity<AttackScenario> createScenario(
            @RequestBody CreateScenarioDTO dto,
            Authentication authentication // Spring Security מכניס לכאן את פרטי המשתמש המאומת
    ) {
        // 1. שליפת המשתמש המאומת מה-DB
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        User currentUser = userOptional.get();

        // 2. יצירת Entity חדש
        AttackScenario scenario = new AttackScenario();
        scenario.setName(dto.getName());
        scenario.setType(dto.getType());
        scenario.setParams(dto.getParams()); // ה-JSONB נשמר כאן
        scenario.setCreatedBy(currentUser);
        scenario.setCreatedAt(LocalDateTime.now());

        // 3. שמירה ל-DB
        AttackScenario savedScenario = scenarioRepository.save(scenario);

        return ResponseEntity.ok(savedScenario);
    }

    // 2. GET /api/scenarios: קבלת רשימת התרחישים
    // דורש JWT תקין ב-Header
    @GetMapping
    public ResponseEntity<List<AttackScenario>> getAllScenarios() {
        // מחזיר את כל התרחישים הקיימים
        List<AttackScenario> scenarios = scenarioRepository.findAll();
        return ResponseEntity.ok(scenarios);
    }
}