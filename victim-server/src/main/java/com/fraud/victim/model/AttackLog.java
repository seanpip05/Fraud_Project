package com.fraud.victim.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * ישות המייצגת רישום של התקפה שנקלטה בשרת המטרה.
 * שימוש ב-Lombok לחסכון ב-Boilerplate ובנייה גמישה.
 */
@Entity
@Table(name = "attack_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttackLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientIp;
    private String method;
    private String endpoint;
    private String payload;
    private LocalDateTime timestamp;

    // סטטוס התגובה (למשל 200 אם הצליח, 403 אם נחסם על ידי חוק הגנה)
    private int responseStatus;
}