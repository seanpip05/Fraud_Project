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
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import type { SimulationReport } from "../../hooks/useReportsHistory";

// הגדרת המאפיינים שהרכיב מקבל (מה-Hook)
interface ReportsTableProps {
  reports: SimulationReport[];
  onViewLogs: (id: number, name: string) => void;
}

const getRiskScoreColor = (score: number) => {
  if (score < 30) return "success";
  if (score < 70) return "warning";
  return "error";
};

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  onViewLogs,
}) => {
  if (reports.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "background.paper",
          boxShadow: 5,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No simulation reports found based on current filters.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 3, backgroundColor: "background.paper", boxShadow: 5 }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "primary.dark" }}>
          <TableRow>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              ID
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Scenario
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Run Date
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Duration
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Blocked Rate
            </TableCell>
            <TableCell
              align="center"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Risk Score
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
          {reports.map((report) => (
            <TableRow
              key={report.id}
              sx={{
                "&:nth-of-type(odd)": { backgroundColor: "background.default" },
              }}
            >
              <TableCell>{report.id}</TableCell>
              <TableCell>
                <Tooltip title={`Attack Type: ${report.attackType}`} arrow>
                  <Typography variant="body2" fontWeight="bold">
                    {report.scenarioName}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>{report.runDate}</TableCell>
              <TableCell>{report.duration}</TableCell>
              <TableCell align="center">
                <Chip
                  label={`${report.blockedRate.toFixed(1)}%`}
                  color={
                    report.blockedRate > 90
                      ? "success"
                      : report.blockedRate > 50
                      ? "warning"
                      : "error"
                  }
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={report.riskScore}
                  color={getRiskScoreColor(report.riskScore)}
                  size="medium"
                  sx={{ fontWeight: "bold" }}
                />
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onViewLogs(report.id, report.scenarioName)}
                  sx={{
                    mr: 1,
                    color: "text.primary",
                    borderColor: "primary.light",
                  }}
                >
                  View Logs
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{ color: "text.primary", borderColor: "primary.light" }}
                >
                  Export
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
