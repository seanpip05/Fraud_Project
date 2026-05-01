package com.fraud.victim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


/**
 * נקודת הכניסה הראשית של שרת המטרה (Server 2).
 */
@SpringBootApplication
@EnableScheduling
public class VictimServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(VictimServerApplication.class, args);
    }
}