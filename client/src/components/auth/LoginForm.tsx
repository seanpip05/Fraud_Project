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
        position: "fixed",
        inset: 0 /* shorthand for top/left/right/bottom: 0 */,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          minWidth: { xs: 320, sm: 420 },
          maxWidth: 500,
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[6],
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <SecurityIcon sx={{ fontSize: 64, color: "secondary.main", mb: 2 }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "text.primary", mb: 1 }}
          >
            Fraud Detection System
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
            autoComplete="username"
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
            autoComplete="current-password"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "#9e9e9e" }}
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
            size="large"
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <LoginIcon />
              )
            }
            disabled={isLoading || !username || !password}
            sx={{ py: 1.5, fontWeight: "bold", textTransform: "none" }}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        {/* Demo Credentials Hint */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Demo: admin / admin
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
