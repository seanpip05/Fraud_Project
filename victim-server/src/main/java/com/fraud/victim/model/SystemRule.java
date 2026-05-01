package com.fraud.victim.model;

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

    @Column(name = "time_window", nullable = false)
    private Integer timeWindow = 60;

    @Column(nullable = false)
    private String action = "BLOCK";

    @ManyToOne(fetch = FetchType.EAGER) // Using EAGER here because we cache it and avoid LazyInitializationException
    @JoinColumn(name = "attack_type_id", nullable = false)
    private AttackType attackType;
}
