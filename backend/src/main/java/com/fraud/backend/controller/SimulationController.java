package com.fraud.backend.controller;

import com.fraud.backend.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * בקר לשליטה בביצוע הסימולציות.
 */
@RestController
@RequestMapping("/api/simulations")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * הפעלת סימולציה
     */
    @PostMapping("/run/{id}")
    public ResponseEntity<?> run(@PathVariable Long id) {
        try {
            simulationService.runSimulation(id);
            return ResponseEntity.ok(Map.of("message", "Simulation started successfully", "id", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * עצירת סימולציה
     */
    @PostMapping("/stop/{id}")
    public ResponseEntity<?> stop(@PathVariable Long id) {
        simulationService.stopSimulation(id);
        return ResponseEntity.ok(Map.of("message", "Simulation stopped successfully", "id", id));
    }
}
