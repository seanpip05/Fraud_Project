import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "../components/auth/LoginForm";

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
    <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
  );
};
