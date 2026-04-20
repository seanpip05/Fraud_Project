package com.fraud.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "simulations")
@Data
@NoArgsConstructor
public class Simulation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attack_scenario_id", nullable = false)
    private AttackScenario scenario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "executed_by_id", nullable = false)
    private User executedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    public enum Status {
        RUNNING, COMPLETED, FAILED
    }
}
