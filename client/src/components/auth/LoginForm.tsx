import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  isLoading = false,
  error = null,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: "linear-gradient(to bottom right, #121212, #000000)",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          minWidth: 400,
          backgroundColor: "#1e1e1e",
          borderRadius: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <SecurityIcon sx={{ fontSize: 60, color: "secondary.main", mb: 2 }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary.light"
            gutterBottom
          >
            Fraud Detection System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secure Login Portal
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LoginIcon />
              )
            }
            disabled={isLoading || !username || !password}
            sx={{
              py: 1.5,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {isLoading ? "Authenticating..." : "Login"}
          </Button>
        </form>

        {/* Demo Credentials Hint */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Demo Credentials: admin / admin
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
