package com.fraud.victim.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * ישות המייצגת כתובת IP חסומה בבסיס הנתונים
 */
@Entity
@Table(name = "blocked_ips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockedIp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String ipAddress;

    private String reason;
    private LocalDateTime blockedAt;
}