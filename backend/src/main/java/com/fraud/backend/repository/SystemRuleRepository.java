package com.fraud.backend.repository;

import com.fraud.backend.model.entity.SystemRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemRuleRepository extends JpaRepository<SystemRule, Long> {
    Optional<SystemRule> findByRuleName(String ruleName);
}
