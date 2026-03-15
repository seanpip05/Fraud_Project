import React from "react";
import { Box, Typography } from "@mui/material";
import { useScenarioBuilder } from "../hooks/useScenarioBuilder";
import { ScenarioForm } from "../components/scenarios/ScenarioForm";
import { ScenariosList } from "../components/scenarios/ScenariosList";

// מבנה נתונים חדש להסברים מפורטים (לפי סוג התקיפה)
// מכיל הסבר כללי ופירוט לכל Input
// (Removed unused DETAILED_EXPLANATIONS)

const ScenariosPage: React.FC = () => {
  const {
    scenarios,
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    isLoading,
    editingId,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSaveScenario,
    handleRunScenario,
    handleEditScenario,
    handleDeleteScenario
  } = useScenarioBuilder();

  return (
      <Box sx={{ p: 4 }}>
        <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "text.primary", fontWeight: "bold" }}
        >
          ⚔️ Attack Scenarios Setup
        </Typography>
        <Typography
            variant="body1"
            gutterBottom
            color="text.secondary"
            sx={{ mb: 3 }}
        >
          Define the threat. Configure the parameters of your simulated attack.
        </Typography>

        {/* רכיב הטופס (מציג את הכותרת והאייקון בתוכו כדי למנוע כפילות) */}
        <ScenarioForm
            selectedAttackType={selectedAttackType}
            scenarioName={scenarioName}
            formParams={formParams}
            isSaving={isSaving}
            editingId={editingId}
            setScenarioName={setScenarioName}
            setFormParams={setFormParams}
            handleTabChange={handleTabChange}
            handleSave={handleSaveScenario}
        />

        {/* כותרת לרשימה */}
        <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "text.primary", mt: 4, mb: 2, fontWeight: "bold" }}
        >
          Existing Scenarios
        </Typography>

        {/* רכיב הרשימה */}
        {isLoading ? (
            <Typography>Loading scenarios...</Typography>
        ) : (
            <ScenariosList
                scenarios={scenarios}
                onRunScenario={handleRunScenario}
                onEditScenario={handleEditScenario}
                onDeleteScenario={handleDeleteScenario}
            />
        )}
      </Box>
  );
};

export default ScenariosPage;
