// src/components/Dashboard/DashboardView.tsx

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SecurityIcon from "@mui/icons-material/Security";
import GppBadIcon from "@mui/icons-material/GppBad";
// ייבוא הטיפוסים מה-Hook שלנו
import { GraphDataPoint } from "../../hooks/useDashboardSimulation";

// הגדרת המאפיינים שהרכיב מצפה לקבל
interface DashboardViewProps {
  data: GraphDataPoint[];
  isProtected: boolean;
  setIsProtected: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  isProtected,
  setIsProtected,
}) => {
  return (
    <Box sx={{ p: 4, backgroundColor: "#f5f5f5", height: "100vh" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#333", fontWeight: "bold" }}
      >
        Fraud Simulation Dashboard
      </Typography>

      {/* כרטיס סטטוס מערכת */}
      <Card
        sx={{
          mb: 4,
          borderLeft: isProtected ? "6px solid #2e7d32" : "6px solid #d32f2f",
          boxShadow: 3,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              System Status
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              {isProtected ? (
                <SecurityIcon color="success" sx={{ fontSize: 40 }} />
              ) : (
                <GppBadIcon color="error" sx={{ fontSize: 40 }} />
              )}
              <Typography
                variant="h4"
                color={isProtected ? "success.main" : "error.main"}
                fontWeight="bold"
              >
                {isProtected ? "PROTECTED" : "VULNERABLE"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Rate Limit Protection
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isProtected}
                  onChange={() => setIsProtected(!isProtected)}
                  color="success"
                />
              }
              label={
                <Typography fontWeight="bold">
                  {isProtected ? "Active" : "Disabled"}
                </Typography>
              }
            />
          </Box>
        </CardContent>
      </Card>

      {/* גרף זמן אמת */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Live Traffic Analysis
          </Typography>
          <div style={{ height: 350, width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#d32f2f"
                  name="Total Requests (Attack)"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="#2e7d32"
                  name="Blocked Requests (Defense)"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};
