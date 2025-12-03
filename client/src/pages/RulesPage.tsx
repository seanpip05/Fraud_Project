import React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useRulesManagement } from "../hooks/useRulesManagement";
import { RulesTable } from "../components/rules/RulesTable";

const RulesPage: React.FC = () => {
  const { rules, isLoading, hasChanges, handleToggle, saveChanges } =
    useRulesManagement();

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "primary.light", fontWeight: "bold" }}
      >
        System Rules Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure and manage security rules for different attack types.
      </Typography>

      <RulesTable rules={rules} onToggle={handleToggle} />

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={saveChanges}
          disabled={!hasChanges || isLoading}
          sx={{ p: 1.5, fontWeight: "bold" }}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default RulesPage;
