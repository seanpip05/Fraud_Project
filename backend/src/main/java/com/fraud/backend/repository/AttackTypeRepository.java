package com.fraud.backend.repository;

import com.fraud.backend.model.entity.AttackType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttackTypeRepository extends JpaRepository<AttackType, Long> {
    Optional<AttackType> findByName(String name);
}
