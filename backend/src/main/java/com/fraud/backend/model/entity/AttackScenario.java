package com.fraud.backend.model.entity;

import com.vladmihalcea.hibernate.type.json.JsonType; // שימוש ב-Class שהורדנו
import jakarta.persistence.*;
import org.hibernate.annotations.Type; // נשאר מ-Hibernate, אבל ממוקם נכון

import java.time.LocalDateTime;
import java.util.Map;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attack_scenarios")
@Data
@NoArgsConstructor
public class AttackScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // Brute Force, SQL Injection, וכו'

    // הקשר ליוזר שיצר את התרחיש (ForeignKey)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // ה-JSONB: שמירת הפרמטרים הגמישים (התיקון כאן)
    // ----------------------------------------------
    // נשתמש ב-Type שמצביע ישירות ל-Class JsonType
    @Type(value = JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> params;

    @Column(name = "last_run")
    private LocalDateTime lastRun;
}