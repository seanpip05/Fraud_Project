import React from "react";
import { Box, Typography } from "@mui/material";

// רכיב בסיס לעמודים ריקים
interface BasePageProps {
  title: string;
}

export const BasePage: React.FC<BasePageProps> = ({ title }) => (
  <Box sx={{ p: 4, textAlign: "center" }}>
    <Typography variant="h3" color="primary.main" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h6" color="text.secondary">
      Content under construction.
    </Typography>
  </Box>
);
