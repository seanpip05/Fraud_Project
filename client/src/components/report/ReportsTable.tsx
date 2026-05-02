import React, { useState } from "react";
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
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import type { AttackSession } from "../../hooks/useReportsHistory";

interface ReportsTableProps {
  sessions: AttackSession[];
  onExportSession: (sessionId: string) => void;
}

const getRiskScoreColor = (score: number): "success" | "warning" | "error" => {
  if (score < 30) return "success";
  if (score < 70) return "warning";
  return "error";
};

const getStatusChip = (status: number) => {
  const map: Record<number, { color: "success" | "warning" | "error" | "info" | "default"; label: string }> = {
    200: { color: "success", label: "200 OK" },
    401: { color: "warning", label: "401 Unauth" },
    400: { color: "error", label: "400 Bad Req" },
    403: { color: "error", label: "403 Forbidden" },
    429: { color: "warning", label: "429 Too Many" },
  };
  const info = map[status] || { color: "default" as const, label: String(status) };
  return <Chip label={info.label} color={info.color} size="small" sx={{ fontWeight: "bold" }} />;
};

const formatTimestamp = (ts: string) => {
  try {
    return new Date(ts).toLocaleString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return ts; }
};

const formatDuration = (start: string, end: string) => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 1000) return "< 1 sec";
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs} sec`;
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins} min ${remainingSecs} sec`;
};

// שורה ראשית של סשן (מתקפה שלמה) עם אפשרות פתיחה
const SessionRow: React.FC<{
  session: AttackSession;
  onExport: (id: string) => void;
}> = ({ session, onExport }) => {
  const [open, setOpen] = useState(false);

  return (
      <>
        {/* שורת הסיכום הראשית */}
        <TableRow
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
              backgroundColor: open ? "rgba(25, 118, 210, 0.04)" : "inherit",
            }}
            onClick={() => setOpen(!open)}
        >
          <TableCell>
            <IconButton size="small" sx={{ color: "primary.light" }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="bold" sx={{ color: "primary.light" }}>
              {session.sessionId}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>
              {session.clientIp}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
              {session.endpoint}
            </Typography>
          </TableCell>
          <TableCell>{formatTimestamp(session.startTime)}</TableCell>
          <TableCell>{formatDuration(session.startTime, session.endTime)}</TableCell>
          <TableCell align="center">
            <Typography variant="body2" fontWeight="bold">
              {session.totalRequests}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Chip
                label={`${session.blockedRate.toFixed(0)}%`}
                color={session.blockedRate > 80 ? "success" : session.blockedRate > 40 ? "warning" : "error"}
                size="small"
                sx={{ fontWeight: "bold" }}
            />
          </TableCell>
          <TableCell align="center">
            <Chip
                label={session.maxRiskScore}
                color={getRiskScoreColor(session.maxRiskScore)}
                size="medium"
                sx={{ fontWeight: "bold", minWidth: 45 }}
            />
          </TableCell>
          <TableCell align="center">
            {/* Status breakdown badges */}
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
              {Object.entries(session.statusBreakdown).map(([code, count]) => (
                  <Tooltip key={code} title={`${count} responses with status ${code}`} arrow>
                    <Chip
                        label={`${code}: ${count}`}
                        size="small"
                        variant="outlined"
                        color={
                          Number(code) === 200 ? "success" :
                              Number(code) === 429 ? "warning" :
                                  Number(code) >= 400 ? "error" : "default"
                        }
                        sx={{ fontSize: "0.7rem" }}
                    />
                  </Tooltip>
              ))}
            </Box>
          </TableCell>
          <TableCell align="center" onClick={(e) => e.stopPropagation()}>
            <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => onExport(session.sessionId)}
                sx={{ color: "primary.light", borderColor: "primary.light", fontSize: "0.75rem" }}
            >
              Export
            </Button>
          </TableCell>
        </TableRow>

        {/* טבלת הלוגים הפנימית (מתרחבת) */}
        <TableRow>
          <TableCell
              colSpan={11}
              sx={{ py: 0, borderBottom: open ? undefined : "none" }}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ m: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
                  Individual Attack Logs ({session.logs.length} entries)
                </Typography>
                <Table size="small" sx={{ backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 1 }}>
                  <TableHead>
                    <TableRow sx={{ "& th": { fontWeight: "bold", fontSize: "0.75rem", color: "text.secondary" } }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Risk Score</TableCell>
                      <TableCell>Payload</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {session.logs.map((log) => (
                        <TableRow key={log.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" } }}>
                          <TableCell sx={{ fontSize: "0.8rem" }}>{log.id}</TableCell>
                          <TableCell>
                            <Chip
                                label={log.method}
                                size="small"
                                variant="outlined"
                                color={log.method === "POST" ? "warning" : "info"}
                                sx={{ fontSize: "0.7rem" }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem" }}>{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell align="center">{getStatusChip(log.responseStatus)}</TableCell>
                          <TableCell align="center">
                            <Chip
                                label={log.riskScore}
                                color={getRiskScoreColor(log.riskScore)}
                                size="small"
                                sx={{ fontWeight: "bold" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title={log.payload || "No payload"} arrow placement="left">
                              <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 250,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontFamily: "monospace",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                  }}
                              >
                                {log.payload || "—"}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
  );
};

export const ReportsTable: React.FC<ReportsTableProps> = ({ sessions, onExportSession }) => {
  if (sessions.length === 0) {
    return (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "background.paper", boxShadow: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No attack sessions found based on current filters.
          </Typography>
        </Paper>
    );
  }

  return (
      <TableContainer component={Paper} sx={{ mt: 3, backgroundColor: "background.paper", boxShadow: 5 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { backgroundColor: "#1a237e", color: "white", fontWeight: "bold" } }}>
              <TableCell sx={{ width: 50 }} /> {/* Expand arrow */}
              <TableCell>Session ID</TableCell>
              <TableCell>Attacker IP</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell align="center">Requests</TableCell>
              <TableCell align="center">Blocked Rate</TableCell>
              <TableCell align="center">Max Risk</TableCell>
              <TableCell align="center">Status Breakdown</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
                <SessionRow key={session.sessionId} session={session} onExport={onExportSession} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
};
