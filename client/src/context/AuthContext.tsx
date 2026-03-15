import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";

// הגדרת הטיפוסים ל-Context
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// יצירת ה-Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook מותאם אישית לשימוש ב-AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// רכיב ה-Provider שיעטוף את האפליקציה
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Initialize auth state from localStorage on load
  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("jwt_token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = { isAuthenticated, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
