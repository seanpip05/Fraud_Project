import React from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { SystemRule } from "../../hooks/useRulesManagement";

// הגדרת המאפיינים שהרכיב מקבל (מה-Hook)
interface RulesTableProps {
  rules: SystemRule[];
  onToggle: (id: number) => void;
}

const getAttackChipColor = (type: SystemRule["attackType"]) => {
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

export const RulesTable: React.FC<RulesTableProps> = ({ rules, onToggle }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 3, backgroundColor: "background.paper", boxShadow: 5 }}
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
                {/* המתג שמפעיל את הפונקציה מה-Hook */}
                <Switch
                  checked={rule.isActive}
                  onChange={() => onToggle(rule.id)}
                  color="secondary"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
