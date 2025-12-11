package com.fraud.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data // עבור Getters, Setters, toString
@NoArgsConstructor // בנאי ריק
@AllArgsConstructor // בנאי עם כל השדות
public class CreateScenarioDTO {

    private String name; // שם התרחיש
    private String type; // סוג התקיפה (AttackTypeKey)

    // השדה הגמיש שתואם ל-params: { [key: string]: any } ב-TypeScript
    private Map<String, Object> params;
}