import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SnackbarProvider } from "./context/SnackbarContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <SnackbarProvider>
                <App />
            </SnackbarProvider>
        </AuthProvider>
    </StrictMode>
);
