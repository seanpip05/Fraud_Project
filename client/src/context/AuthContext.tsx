import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

// הגדרת הטיפוסים ל-Context
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
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
  // מצב ההתחברות: מתחיל כ-false
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // פונקציית כניסה: מעבירה ל-true (בלי בדיקות כרגע)
  const login = () => {
    console.log("LOGIN: Simulating successful login.");
    setIsAuthenticated(true);
  };

  // פונקציית יציאה: מעבירה ל-false
  const logout = () => {
    console.log("LOGOUT: User logged out.");
    setIsAuthenticated(false);
  };

  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
