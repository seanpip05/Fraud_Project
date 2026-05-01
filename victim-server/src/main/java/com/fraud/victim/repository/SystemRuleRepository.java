package com.fraud.victim.repository;

import com.fraud.victim.model.SystemRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemRuleRepository extends JpaRepository<SystemRule, Long> {
}
