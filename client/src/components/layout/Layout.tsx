import React from "react";
import { Box, ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Header } from "./Header";

// הגדרת Theme כהה גלובלי
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0d47a1",
    },
    secondary: {
      main: "#4caf50",
    },
    background: {
      default: "#121212", // הרקע הראשי הכהה
      paper: "#1e1e1e", // צבע הקארדים והקופסאות
    },
    text: {
      primary: "#e0e0e0", // טקסט בהיר
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif", // פונט נקי
  },
});

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline מאפס את ה-CSS של הדפדפן לצבעי ה-Theme */}
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: darkTheme.palette.background.default,
        }}
      >
        {/* סרגל הניווט תמיד למעלה */}
        <Header />

        {/* אזור התוכן הראשי (Main Content) */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
