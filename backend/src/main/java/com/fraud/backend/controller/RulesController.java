package com.fraud.backend.controller;

import com.fraud.backend.dto.SystemRuleDTO;
import com.fraud.backend.engine.SystemRulesEngine;
import com.fraud.backend.model.entity.AttackType;
import com.fraud.backend.model.entity.SystemRule;
import com.fraud.backend.repository.AttackTypeRepository;
import com.fraud.backend.repository.SystemRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class RulesController {

    private final SystemRuleRepository systemRuleRepository;
    private final AttackTypeRepository attackTypeRepository;
    private final SystemRulesEngine systemRulesEngine;

    @GetMapping
    public ResponseEntity<List<SystemRuleDTO>> getAllRules() {
        List<SystemRuleDTO> rules = systemRuleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rules);
    }

    @PostMapping
    public ResponseEntity<SystemRuleDTO> createRule(@RequestBody SystemRuleDTO dto) {
        AttackType attackType = attackTypeRepository.findByName(dto.getAttackType())
                .orElseGet(() -> {
                    AttackType newType = new AttackType();
                    newType.setName(dto.getAttackType());
                    newType.setSeverity(AttackType.Severity.MEDIUM);
                    return attackTypeRepository.save(newType);
                });

        SystemRule rule = new SystemRule();
        rule.setRuleName(dto.getName());
        rule.setActive(dto.isActive());
        rule.setThreshold(dto.getThreshold());
        rule.setTimeWindow(dto.getTimeWindow());
        rule.setAction(dto.getAction());
        rule.setAttackType(attackType);

        SystemRule saved = systemRuleRepository.save(rule);
        systemRulesEngine.reloadRules();

        return ResponseEntity.ok(convertToDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemRuleDTO> updateRule(@PathVariable Long id, @RequestBody SystemRuleDTO dto) {
        SystemRule rule = systemRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found: " + id));

        rule.setRuleName(dto.getName());
        rule.setActive(dto.isActive());
        rule.setThreshold(dto.getThreshold());
        rule.setTimeWindow(dto.getTimeWindow());
        rule.setAction(dto.getAction());

        if (dto.getAttackType() != null && !dto.getAttackType().equals(rule.getAttackType().getName())) {
            AttackType attackType = attackTypeRepository.findByName(dto.getAttackType())
                    .orElseThrow(() -> new RuntimeException("AttackType not found: " + dto.getAttackType()));
            rule.setAttackType(attackType);
        }

        SystemRule updated = systemRuleRepository.save(rule);
        systemRulesEngine.reloadRules();

        return ResponseEntity.ok(convertToDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        systemRuleRepository.deleteById(id);
        systemRulesEngine.reloadRules();
        return ResponseEntity.noContent().build();
    }

    private SystemRuleDTO convertToDTO(SystemRule rule) {
        SystemRuleDTO dto = new SystemRuleDTO();
        dto.setId(rule.getId());
        dto.setName(rule.getRuleName());
        dto.setActive(rule.isActive());
        dto.setThreshold(rule.getThreshold());
        dto.setTimeWindow(rule.getTimeWindow());
        dto.setAction(rule.getAction());
        dto.setAttackType(rule.getAttackType().getName());
        return dto;
    }
}
