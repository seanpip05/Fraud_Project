import React from "react";
import { Box, Typography } from "@mui/material";
import { useScenarioBuilder } from "../hooks/useScenarioBuilder";
import { ScenarioForm } from "../components/Scenarios/ScenarioForm";
import { ScenariosList } from "../components/Scenarios/ScenariosList";

const ScenariosPage: React.FC = () => {
  const {
    scenarios,
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSaveScenario,
  } = useScenarioBuilder();

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "primary.light", fontWeight: "bold" }}
      >
        Attack Scenarios Setup
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create and manage attack scenarios for fraud simulation testing.
      </Typography>

      <ScenarioForm
        selectedAttackType={selectedAttackType}
        scenarioName={scenarioName}
        formParams={formParams}
        isSaving={isSaving}
        setScenarioName={setScenarioName}
        setFormParams={setFormParams}
        handleTabChange={handleTabChange}
        handleSave={handleSaveScenario}
      />

      <Typography
        variant="h5"
        sx={{ mt: 5, mb: 3, color: "primary.light", fontWeight: "bold" }}
      >
        Saved Scenarios
      </Typography>
      <ScenariosList scenarios={scenarios} />
    </Box>
  );
};

export default ScenariosPage;
