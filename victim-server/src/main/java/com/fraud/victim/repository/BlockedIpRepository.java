package com.fraud.victim.repository;

import com.fraud.victim.model.BlockedIp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BlockedIpRepository extends JpaRepository<BlockedIp, Long> {
    // בדיקה האם IP קיים בטבלה
    boolean existsByIpAddress(String ipAddress);

    // מחיקה לפי כתובת IP (לצורך Unblock)
    void deleteByIpAddress(String ipAddress);

    Optional<BlockedIp> findByIpAddress(String ipAddress);
}