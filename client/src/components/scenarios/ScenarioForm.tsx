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
  Tooltip,
  IconButton,
  Slider,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import {
  ATTACK_TYPES,
  type AttackTypeKey,
} from "../../hooks/useScenarioBuilder";

interface ScenarioFormProps {
  selectedAttackType: AttackTypeKey;
  scenarioName: string;
  formParams: { [key: string]: any };
  isSaving: boolean;
  editingId?: number | null;
  setScenarioName: (name: string) => void;
  setFormParams: (params: { [key: string]: any }) => void;
  handleTabChange: (newValue: AttackTypeKey) => void;
  handleSave: () => void;
  clearEditMode: () => void;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = (props) => {
  const {
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    editingId,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSave,
    clearEditMode,
  } = props;

  const currentAttack = ATTACK_TYPES[selectedAttackType];
  const attackKeys = Object.keys(ATTACK_TYPES) as AttackTypeKey[];

  return (
      <Card sx={{ mb: 4, backgroundColor: "background.paper", boxShadow: 5 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                  variant="h5"
                  color="primary.light"
                  fontWeight="bold"
              >
                {editingId ? "Update Scenario" : "Create New Scenario"}
              </Typography>
              <Tooltip
                  title={
                    <Box sx={{ p: 1, maxWidth: "500px" }}>
                      <Typography
                          variant="subtitle1"
                          color="primary.light"
                          sx={{ mb: 1, fontWeight: "bold" }}
                      >
                        {selectedAttackType} Attack Details
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {currentAttack.description}
                      </Typography>
                      <Typography
                          variant="subtitle2"
                          sx={{ mt: 1, mb: 0.5, textDecoration: "underline" }}
                      >
                        Input Parameters:
                      </Typography>
                      {currentAttack.fields.map((f, i) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ fontWeight: "bold", color: "secondary.light" }}
                            >
                              • {f.label}:
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ display: "block", ml: 1 }}
                            >
                              {f.helper}
                            </Typography>
                          </Box>
                      ))}
                    </Box>
                  }
                  arrow
                  placement="right"
                  slotProps={{ popper: { sx: { maxWidth: "500px" } } }}
              >
                <IconButton color="info" size="small" sx={{ ml: 1 }}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {editingId && (
                <IconButton
                    color="error"
                    size="small"
                    onClick={clearEditMode}
                    title="Cancel Edit"
                    sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
            )}
          </Box>

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
              {currentAttack.fields.map((field: any) => (
                  <Box key={field.id} sx={{ mb: 2 }}>
                    {field.type === "slider" ? (
                        <Box sx={{ px: 1 }}>
                          <Typography gutterBottom color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {field.label}: {formParams[field.id] !== undefined ? formParams[field.id] : (field.min || 1)}
                          </Typography>
                          <Slider
                              value={typeof formParams[field.id] === 'number' ? formParams[field.id] : (field.min || 1)}
                              onChange={(_event, newValue) =>
                                  setFormParams({ ...formParams, [field.id]: newValue })
                              }
                              step={field.step !== undefined ? field.step : 1}
                              marks={field.marks || true}
                              min={field.min || 1}
                              max={field.max || 100}
                              valueLabelDisplay="auto"
                              disabled={isSaving}
                              color="secondary"
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
                            {field.helper}
                          </Typography>
                        </Box>
                    ) : (
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
                    )}
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
              {isSaving ? "Saving..." : (editingId ? "Update Scenario" : "Save Scenario")}
            </Button>
          </Box>
        </CardContent>
      </Card>
  );
};
