import React from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import {
  ATTACK_TYPES,
  type AttackTypeKey,
} from "../../hooks/useScenarioBuilder";

interface ScenarioFormProps {
  selectedAttackType: AttackTypeKey;
  scenarioName: string;
  formParams: { [key: string]: any };
  isSaving: boolean;
  setScenarioName: (name: string) => void;
  setFormParams: (params: { [key: string]: any }) => void;
  handleTabChange: (newValue: AttackTypeKey) => void;
  handleSave: () => void;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = (props) => {
  const {
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSave,
  } = props;

  const currentAttack = ATTACK_TYPES[selectedAttackType];
  const attackKeys = Object.keys(ATTACK_TYPES) as AttackTypeKey[];

  return (
    <Card sx={{ mb: 4, backgroundColor: "background.paper", boxShadow: 5 }}>
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
          color="primary.light"
          fontWeight="bold"
        >
          Create New Scenario
        </Typography>

        <Tabs
          value={selectedAttackType}
          // ה-onChange מעביר את האירוע, אנחנו שולפים רק את הערך הרלוונטי
          onChange={(_, newValue) => handleTabChange(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          {attackKeys.map((key) => (
            <Tab
              key={key}
              label={key}
              value={key}
              sx={{ textTransform: "none", fontWeight: "bold" }}
            />
          ))}
        </Tabs>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {currentAttack.description}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                fullWidth
                label="Scenario Name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                required
                variant="outlined"
                disabled={isSaving}
                sx={{ input: { color: "text.primary" } }}
              />
            </Box>

            {/* שדות קלט דינמיים לפי סוג ההתקפה */}
            {currentAttack.fields.map((field) => (
              <Box key={field.id}>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type}
                  helperText={field.helper}
                  value={formParams[field.id] || ""}
                  onChange={(e) =>
                    setFormParams({ ...formParams, [field.id]: e.target.value })
                  }
                  variant="outlined"
                  disabled={isSaving}
                  sx={{ input: { color: "text.primary" } }}
                />
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={
              isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={isSaving}
            sx={{ mt: 3, p: 1.5, fontWeight: "bold" }}
          >
            {isSaving ? "Saving..." : "Save Scenario"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
