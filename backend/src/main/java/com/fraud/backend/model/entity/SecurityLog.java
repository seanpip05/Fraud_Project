package com.fraud.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "security_logs")
@Data
@NoArgsConstructor
public class SecurityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "attacker_ip", nullable = false)
    private String attackerIp;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_taken", nullable = false)
    private Action actionTaken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_rule_id")
    private SystemRule triggeredRule; // Can be null if action is PASSED

    public enum Action {
        BLOCKED, PASSED
    }
}
