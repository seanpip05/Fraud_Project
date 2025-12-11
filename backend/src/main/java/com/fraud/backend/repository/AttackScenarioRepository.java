package com.fraud.backend.repository;

import com.fraud.backend.model.entity.AttackScenario;
import com.fraud.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttackScenarioRepository extends JpaRepository<AttackScenario, Long> {

    // שיטה לשלוף את כל התרחישים של משתמש ספציפי (אופציונלי)
    // שימושי בדשבורד כדי להראות רק את מה שהאדמין יצר.
    List<AttackScenario> findAllByCreatedBy(User user);
}