import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import type { SystemRule } from "../../hooks/useRulesManagement";
import { ConfirmDialog } from "../shared/ConfirmDialog";

interface RulesTableProps {
  rules: SystemRule[];
  onToggle: (id: number) => void;
  onCreate: (rule: Omit<SystemRule, "id">) => void;
  onUpdate: (id: number, rule: Omit<SystemRule, "id">) => void;
  onDelete: (id: number) => void;
}

const getAttackChipColor = (type: string) => {
  switch (type) {
    case "Brute Force":
      return "error";
    case "SQL Injection":
      return "warning";
    case "Tampering":
      return "info";
    default:
      return "default";
  }
};

export const RulesTable: React.FC<RulesTableProps> = ({
                                                        rules,
                                                        onToggle,
                                                        onCreate,
                                                        onUpdate,
                                                        onDelete
                                                      }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<SystemRule | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    attackType: "Brute Force",
    threshold: 0,
    timeWindow: 60,
    action: "BLOCK",
    isActive: true,
  });

  const handleOpenDialog = (rule?: SystemRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        attackType: rule.attackType,
        threshold: rule.threshold,
        timeWindow: rule.timeWindow || 0,
        action: rule.action || "BLOCK",
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: "",
        attackType: "Brute Force",
        threshold: 0,
        timeWindow: 60,
        action: "BLOCK",
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = () => {
    if (editingRule) {
      onUpdate(editingRule.id, formData as Omit<SystemRule, "id">);
    } else {
      onCreate(formData as Omit<SystemRule, "id">);
    }
    handleCloseDialog();
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: "" });

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id !== null) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm({ open: false, id: null, name: "" });
  };

  return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
          >
            Add Rule
          </Button>
        </Box>

        <TableContainer
            component={Paper}
            sx={{ backgroundColor: "background.paper", boxShadow: 5 }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "primary.dark" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Rule Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Attack Type
                </TableCell>
                <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                >
                  Threshold
                </TableCell>
                <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                >
                  Action
                </TableCell>
                <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                >
                  Active
                </TableCell>
                <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                  <TableRow
                      key={rule.id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "background.default" },
                      }}
                  >
                    <TableCell component="th" scope="row">
                      {rule.name}
                      {rule.timeWindow > 0 && (
                          <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                          >
                            ({rule.timeWindow} seconds window)
                          </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                          label={rule.attackType}
                          size="small"
                          color={getAttackChipColor(rule.attackType)}
                          variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {rule.threshold > 0 ? `${rule.threshold} attempts` : "N/A"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                          label={rule.action}
                          size="small"
                          color={
                            rule.action === "BLOCK"
                                ? "error"
                                : rule.action === "ALERT"
                                    ? "warning"
                                    : "info"
                          }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                          checked={rule.isActive}
                          onChange={() => onToggle(rule.id)}
                          color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(rule)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(rule.id, rule.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
              ))}
              {rules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No rules found. Add a new rule to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for Create/Edit */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingRule ? "Edit Rule" : "Create New Rule"}</DialogTitle>
          <DialogContent dividers>
            <TextField
                autoFocus
                margin="dense"
                label="Rule Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
            />

            <TextField
                select
                margin="dense"
                label="Attack Type"
                fullWidth
                variant="outlined"
                value={formData.attackType}
                onChange={(e) => setFormData({ ...formData, attackType: e.target.value })}
                sx={{ mb: 2 }}
            >
              {["Brute Force", "SQL Injection", "Tampering", "XSS", "Logic Flaw"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
              ))}
            </TextField>

            <TextField
                margin="dense"
                label="Threshold (attempts)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                sx={{ mb: 2 }}
            />

            <TextField
                margin="dense"
                label="Time Window (seconds)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.timeWindow}
                onChange={(e) => setFormData({ ...formData, timeWindow: Number(e.target.value) })}
                sx={{ mb: 2 }}
            />

            <TextField
                select
                margin="dense"
                label="Action"
                fullWidth
                variant="outlined"
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            >
              {["BLOCK", "ALERT", "LOG_ONLY"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog for Delete */}
        <ConfirmDialog
            open={deleteConfirm.open}
            title="Delete Security Rule?"
            message={`Are you sure you want to permanently delete the rule "${deleteConfirm.name}"? This action cannot be undone.`}
            confirmLabel="Delete Rule"
            confirmColor="error"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        />
      </Box>
  );
};
