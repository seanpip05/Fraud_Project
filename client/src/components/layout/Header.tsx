import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import SecurityIcon from "@mui/icons-material/Security";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RuleIcon from "@mui/icons-material/Rule";
import HistoryIcon from "@mui/icons-material/History";
import CasinoIcon from "@mui/icons-material/Casino";

// הגדרת צבעים כהים ומקצועיים לאווירת אבטחת מידע
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0d47a1", // כחול כהה
    },
    secondary: {
      main: "#4caf50", // ירוק אבטחה
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

const navItems = [
  { name: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { name: "Rules", path: "/rules", icon: <RuleIcon /> },
  { name: "Scenarios", path: "/scenarios", icon: <CasinoIcon /> },
  { name: "Reports", path: "/reports", icon: <HistoryIcon /> },
];

export const Header: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: darkTheme.palette.background.paper,
          borderBottom: "1px solid #333",
        }}
      >
        <Toolbar>
          {/* לוגו המערכת */}
          <SecurityIcon
            sx={{ mr: 1, color: darkTheme.palette.secondary.main }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            FraudSim Pro
          </Typography>

          {/* כפתורי הניווט */}
          <Box sx={{ display: "flex" }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                color="inherit"
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  "&:hover": {
                    backgroundColor: darkTheme.palette.primary.dark,
                  },
                }}
              >
                {item.icon}
                <Box sx={{ ml: 0.5, textTransform: "none" }}>{item.name}</Box>
              </Button>
            ))}
          </Box>

          {/* כפתור יציאה/כניסה */}
          <Button
            color="inherit"
            sx={{
              ml: 2,
              border: `1px solid ${darkTheme.palette.secondary.main}`,
            }}
          >
            Login / Logout
          </Button>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};
