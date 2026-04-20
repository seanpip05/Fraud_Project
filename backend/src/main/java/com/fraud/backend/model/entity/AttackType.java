package com.fraud.backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attack_types")
@Data
@NoArgsConstructor
public class AttackType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Brute Force", "SQL Injection"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity; // HIGH, MEDIUM, LOW

    public enum Severity {
        CRITICAL, HIGH, MEDIUM, LOW
    }
}
