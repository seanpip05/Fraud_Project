package com.fraud.victim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * נקודת הכניסה הראשית של שרת המטרה (Server 2).
 */
@SpringBootApplication
public class VictimServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(VictimServerApplication.class, args);
    }
}