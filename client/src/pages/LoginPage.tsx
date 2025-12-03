import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import LoginIcon from "@mui/icons-material/Login";

// רכיב הדמה של מסך הכניסה
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // סימולציית קריאת API
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        // ב-Backend אמיתי, היינו מקבלים JWT Token כאן
        alert("Login Successful! (Simulated)");
        // ב-React Router אמיתי: navigate to dashboard
      } else {
        setError("Invalid credentials. Please use 'admin' / 'admin'.");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    // הרקע הכללי של המסך
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: "linear-gradient(to bottom right, #121212, #000000)",
      }}
    >
      {/* ה-Card המרכזי של הכניסה */}
      <Paper
        elevation={10}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#1e1e1e",
          borderRadius: 3,
          borderTop: "5px solid #4caf50", // קו ירוק נקי
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <SecurityIcon sx={{ fontSize: 60, color: "#4caf50" }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: "white", fontWeight: "bold" }}
          >
            FraudSim Pro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access to System Defense and Attack Simulation
          </Typography>
        </Box>

        <form onSubmit={handleLogin}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputLabelProps={{ style: { color: "text.secondary" } }}
            InputProps={{ style: { color: "text.primary" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#4caf50" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputLabelProps={{ style: { color: "text.secondary" } }}
            InputProps={{ style: { color: "text.primary" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#4caf50" },
                "&.Mui-focused fieldset": { borderColor: "#4caf50" },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            endIcon={<LoginIcon />}
            disabled={isLoading}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#388e3c" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
