package com.fraud.victim.repository;

import com.fraud.victim.model.AttackLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttackLogRepository extends JpaRepository<AttackLog, Long> {
    // כאן נוכל להוסיף שאילתות לניתוח סטטיסטי בהמשך
}