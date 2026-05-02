import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface SnackbarMessage {
    message: string;
    severity: AlertColor; // 'success' | 'error' | 'warning' | 'info'
}

interface SnackbarContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = (): SnackbarContextType => {
    const context = useContext(SnackbarContext);
    if (!context) throw new Error('useSnackbar must be used within SnackbarProvider');
    return context;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [snack, setSnack] = useState<SnackbarMessage>({ message: '', severity: 'info' });

    const show = useCallback((message: string, severity: AlertColor) => {
        setSnack({ message, severity });
        setOpen(true);
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpen(false);
    };

    const value: SnackbarContextType = {
        showSuccess: useCallback((msg: string) => show(msg, 'success'), [show]),
        showError: useCallback((msg: string) => show(msg, 'error'), [show]),
        showWarning: useCallback((msg: string) => show(msg, 'warning'), [show]),
        showInfo: useCallback((msg: string) => show(msg, 'info'), [show]),
    };

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={snack.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
