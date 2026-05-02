import React from "react";
import { Box, Typography, TextField, Button, MenuItem } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useReportsHistory } from "../hooks/useReportsHistory";
import { ReportsTable } from "../components/report/ReportsTable";

const ReportsPage: React.FC = () => {
    const {
        sessions,
        filters,
        isLoading,
        setFilters,
        applyFilters,
        exportSession,
        exportAllLogs,
        refreshLogs,
    } = useReportsHistory();

    // חישוב סטטיסטיקות מצטברות מכל הסשנים
    const totalRequests = sessions.reduce((sum, s) => sum + s.totalRequests, 0);
    const totalBlocked = sessions.reduce((sum, s) => sum + s.blockedRequests, 0);

    return (
        <Box sx={{ p: 4 }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ color: "primary.light", fontWeight: "bold" }}
            >
                Attack Reports & Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                View attack sessions detected by the Victim Server. Click on a session to expand and see individual requests.
            </Typography>

            {/* Filter Section */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                <TextField
                    label="Filter by IP"
                    variant="outlined"
                    size="small"
                    value={filters.ip}
                    onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
                    sx={{ minWidth: 180 }}
                />
                <TextField
                    label="Date From"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Contains Status"
                    variant="outlined"
                    size="small"
                    select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    sx={{ minWidth: 170 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="200">200 OK</MenuItem>
                    <MenuItem value="400">400 Bad Request</MenuItem>
                    <MenuItem value="401">401 Unauthorized</MenuItem>
                    <MenuItem value="403">403 Forbidden</MenuItem>
                    <MenuItem value="429">429 Too Many</MenuItem>
                </TextField>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    onClick={applyFilters}
                    disabled={isLoading}
                    sx={{ fontWeight: "bold" }}
                >
                    Apply Filters
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshLogs}
                    disabled={isLoading}
                    sx={{ fontWeight: "bold", ml: "auto" }}
                >
                    Refresh
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={exportAllLogs}
                    disabled={sessions.length === 0}
                    sx={{ fontWeight: "bold" }}
                >
                    Export All CSV
                </Button>
            </Box>

            {/* Summary Bar */}
            <Box
                sx={{
                    display: "flex",
                    gap: 4,
                    mb: 2,
                    flexWrap: "wrap",
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Attack Sessions: <strong style={{ color: "#90caf9" }}>{sessions.length}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total Requests: <strong style={{ color: "#90caf9" }}>{totalRequests}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Blocked Requests: <strong style={{ color: "#ef5350" }}>{totalBlocked}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Overall Block Rate:{" "}
                    <strong style={{ color: totalRequests > 0 && (totalBlocked / totalRequests) * 100 > 60 ? "#66bb6a" : "#ef5350" }}>
                        {totalRequests > 0 ? ((totalBlocked / totalRequests) * 100).toFixed(1) : 0}%
                    </strong>
                </Typography>
            </Box>

            <ReportsTable sessions={sessions} onExportSession={exportSession} />
        </Box>
    );
};

export default ReportsPage;
