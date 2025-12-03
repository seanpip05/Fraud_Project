import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useReportsHistory } from "../hooks/useReportsHistory";
import { ReportsTable } from "../components/report/ReportsTable";

const ReportsPage: React.FC = () => {
  const {
    reports,
    filters,
    isLoading,
    setFilters,
    applyFilters,
    handleViewLogs,
  } = useReportsHistory();

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "primary.light", fontWeight: "bold" }}
      >
        Simulation History & Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and analyze past simulation results and security reports.
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
          label="Search by Scenario Name"
          variant="outlined"
          size="small"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          sx={{ minWidth: 250 }}
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
      </Box>

      <ReportsTable reports={reports} onViewLogs={handleViewLogs} />
    </Box>
  );
};

export default ReportsPage;
