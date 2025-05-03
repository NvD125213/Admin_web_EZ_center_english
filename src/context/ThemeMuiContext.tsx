"use client";
import React from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { useTheme } from "./ThemeContext";
import { createTheme } from "@mui/material/styles";

export const getMuiTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            background: {
              default: "rgb(16, 24, 40)",
              paper: "#1e1e1e",
            },
            text: {
              primary: "#ffffff",
              secondary: "#b0b0b0",
            },
          }
        : {
            background: {
              default: "#ffffff",
              paper: "#f9f9f9",
            },
            text: {
              primary: "#000000",
              secondary: "#4f4f4f",
            },
          }),
    },
  });

const MuiThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const muiTheme = getMuiTheme(theme);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default MuiThemeWrapper;
