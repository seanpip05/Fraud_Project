package com.fraud.backend.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class SystemRuleDTO {
    private Long id;
    private String name;

    @JsonProperty("isActive")
    private boolean isActive;

    private Integer threshold;
    private Integer timeWindow;
    private String action;
    private String attackType;
}
