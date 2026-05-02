import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: "error" | "warning" | "primary" | "success";
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * חלון אישור מעוצב (MUI Dialog) לפעולות הרסניות.
 * מחליף את window.confirm() הישן והמכוער.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                open,
                                                                title,
                                                                message,
                                                                confirmLabel = "Confirm",
                                                                cancelLabel = "Cancel",
                                                                confirmColor = "error",
                                                                onConfirm,
                                                                onCancel,
                                                            }) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    minWidth: 400,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    fontWeight: "bold",
                    pb: 1,
                }}
            >
                <WarningAmberIcon color="warning" />
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    sx={{ borderRadius: 2, fontWeight: "bold" }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={confirmColor}
                    sx={{ borderRadius: 2, fontWeight: "bold" }}
                    autoFocus
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
