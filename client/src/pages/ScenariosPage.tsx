import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useScenarioBuilder } from "../hooks/useScenarioBuilder";
import { ScenarioForm } from "../components/scenarios/ScenarioForm";
import { ScenariosList } from "../components/scenarios/ScenariosList";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";

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
        handleDeleteScenario,
        clearEditMode
    } = useScenarioBuilder();

    // State for delete confirmation dialog
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false, id: null, name: ""
    });

    const handleDeleteClick = (id: number) => {
        const scenario = scenarios.find(s => s.id === id);
        setDeleteConfirm({ open: true, id, name: scenario?.name || `Scenario #${id}` });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.id !== null) {
            handleDeleteScenario(deleteConfirm.id);
        }
        setDeleteConfirm({ open: false, id: null, name: "" });
    };

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
                clearEditMode={clearEditMode}
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
                    onDeleteScenario={handleDeleteClick}
                />
            )}

            {/* Confirm Dialog for Scenario Deletion */}
            <ConfirmDialog
                open={deleteConfirm.open}
                title="Delete Attack Scenario?"
                message={`Are you sure you want to permanently delete the scenario "${deleteConfirm.name}"? All associated configuration will be lost.`}
                confirmLabel="Delete Scenario"
                confirmColor="error"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ open: false, id: null, name: "" })}
            />
        </Box>
    );
};

export default ScenariosPage;
