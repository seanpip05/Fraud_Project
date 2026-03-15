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
  onRunScenario: (id: number) => void;
  onEditScenario: (scenario: AttackScenario) => void;
  onDeleteScenario: (id: number) => void;
}

export const ScenariosList: React.FC<ScenariosListProps> = ({
                                                              scenarios,
                                                              onRunScenario,
                                                              onEditScenario,
                                                              onDeleteScenario
                                                            }) => {
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
                          scenario.type === "BRUTE_FORCE"
                              ? "error"
                              : scenario.type === "SQL_INJECTION"
                                  ? "warning"
                                  : "info"
                        }
                        variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{scenario.createdBy?.username || "Admin"}</TableCell>
                  <TableCell>
                    {scenario.lastRun ? new Date(scenario.lastRun).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                        color="secondary"
                        size="small"
                        title="Run Scenario Now"
                        onClick={() => onRunScenario(scenario.id)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                        color="primary"
                        size="small"
                        title="Edit Scenario"
                        onClick={() => onEditScenario(scenario)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="small"
                        title="Delete Scenario"
                        onClick={() => onDeleteScenario(scenario.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
            {scenarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No scenarios found. Create one above!
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
