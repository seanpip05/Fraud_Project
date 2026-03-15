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

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.token); // קריאה ל-AuthContext לעדכון המצב עם הטוקן
        console.log("Login Successful!");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login failure", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
      </ThemeProvider>
  );
};
