import React, { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "../components/auth/LoginForm";

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
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#9e9e9e",
    },
  },
});

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // סימולציית קריאת API
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        // ב-Backend אמיתי, היינו מקבלים JWT Token כאן
        login(); // קריאה ל-AuthContext לעדכון המצב
        console.log("Login Successful!");
      } else {
        setError("Invalid credentials. Please use 'admin' / 'admin'.");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
    </ThemeProvider>
  );
};
