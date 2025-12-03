import React from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AttackScenario } from "../../hooks/useScenarioBuilder";

interface ScenariosListProps {
  scenarios: AttackScenario[];
}

export const ScenariosList: React.FC<ScenariosListProps> = ({ scenarios }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ backgroundColor: "background.paper", boxShadow: 5 }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "primary.dark" }}>
          <TableRow>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Name
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Type
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Created By
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Last Run
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
          {scenarios.map((scenario) => (
            <TableRow
              key={scenario.id}
              sx={{
                "&:nth-of-type(odd)": { backgroundColor: "background.default" },
              }}
            >
              <TableCell component="th" scope="row">
                {scenario.name}
              </TableCell>
              <TableCell>
                <Chip
                  label={scenario.type}
                  size="small"
                  color={
                    scenario.type === "Brute Force"
                      ? "error"
                      : scenario.type === "SQL Injection"
                      ? "warning"
                      : "info"
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{scenario.createdBy}</TableCell>
              <TableCell>{scenario.lastRun}</TableCell>
              <TableCell align="center">
                <IconButton
                  color="secondary"
                  size="small"
                  title="Run Scenario Now"
                  onClick={() => alert(`Starting simulation: ${scenario.name}`)}
                >
                  <PlayArrowIcon />
                </IconButton>
                <IconButton color="primary" size="small" title="Edit Scenario">
                  <EditIcon />
                </IconButton>
                <IconButton color="error" size="small" title="Delete Scenario">
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
