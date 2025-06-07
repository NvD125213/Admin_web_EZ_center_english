import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { Stack, Typography } from "@mui/material";
import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
}) => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      color="text.secondary"
      mt={4}
      gap={2}
      sx={{ opacity: 0.6 }}>
      <FilterAltOffIcon fontSize="large" />
      <Typography variant="h6">{title ?? "No data found"}</Typography>
      <Typography variant="body2">
        {description ?? "Please check your filters and try again."}
      </Typography>
    </Stack>
  );
};

export default EmptyState;
