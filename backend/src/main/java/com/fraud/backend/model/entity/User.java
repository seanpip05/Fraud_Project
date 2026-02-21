package com.fraud.backend.model.entity;

import jakarta.persistence.*;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

// הגדרת הטבלה ב-PostgreSQL
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false, unique = true)
    private String username;

    @Setter
    @Column(nullable = false)
    private String password; // זה יהיה ה-Hash של הסיסמה

    // הגדרת תפקיד (Role) באמצעות Enum
    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // ADMIN או OPERATOR

    // --- Enum להגדרת תפקידים ---
    public enum Role {
        ADMIN, // יכול לנהל חוקים ולהתחיל סימולציות
        OPERATOR // יכול להריץ סימולציות ולצפות בדשבורד
    }

    // --- קונסטרוקטורים, Getters ו-Setters (חיוניים ל-JPA) ---

    public User() {}

    public User(String username, String password, Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // --- מימוש ממשק UserDetails (חיוני ל-JWT) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ממיר את ה-Enum שלנו למבנה ש-Spring Security מכיר
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // שאר המתודות נשארות כברירת מחדל True לעת עתה
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}