package com.fraud.backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_rules")
@Data
@NoArgsConstructor
public class SystemRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleName;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private Integer threshold;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attack_type_id", nullable = false)
    private AttackType attackType;
}
