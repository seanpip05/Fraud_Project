package com.fraud.backend.repository;

import com.fraud.backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * שיטה מותאמת אישית לחיפוש משתמש לפי שם משתמש.
     * חיונית ל-Spring Security / JWT.
     * Spring Data JPA מממש את השיטה הזו אוטומטית לפי השם.
     */
    Optional<User> findByUsername(String username);

}