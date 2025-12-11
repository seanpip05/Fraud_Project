package com.fraud.backend.config;

import com.fraud.backend.model.entity.User;
import com.fraud.backend.model.entity.User.Role;
import com.fraud.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AppConfig {

    // (זה דורש את התלות Spring Security ב-pom.xml)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    // זה רץ ברגע שהאפליקציה עולה
    @Bean
    CommandLineRunner createDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // בודק אם משתמש "admin" כבר קיים
            if (userRepository.findByUsername("admin").isEmpty()) {
                System.out.println("--- DB LOG: Creating default admin user ---");
                User admin = new User(
                        "admin",
                        passwordEncoder.encode("secretpassword"),
                        Role.ADMIN
                );
                userRepository.save(admin);
                System.out.println("--- DB LOG: Default admin user created successfully! ---");
            }
        };
    }
}