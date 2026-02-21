package com.fraud.victim.repository;

import com.fraud.victim.model.AttackLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttackLogRepository extends JpaRepository<AttackLog, Long> {

    // ספירת כמות הלוגים בפרק זמן מסוים (למשל בדקה האחרונה)
    long countByTimestampAfter(LocalDateTime timestamp);

    // שליפת ה-IPs הכי פעילים (לזיהוי תוקפים מרכזיים)
    @Query("SELECT a.clientIp, COUNT(a) as total FROM AttackLog a GROUP BY a.clientIp ORDER BY total DESC")
    List<Object[]> findTopAttackingIps();
}