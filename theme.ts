import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark", // Dark mode base
    background: {
      default: "#121212", // Main background
      paper: "#1e1e1e", // Component background
    },
    text: {
      primary: "#ffffff", // Primary text color
      secondary: "rgba(255, 255, 255, 0.7)", // Secondary text
    },
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          color: "white",
          backgroundColor: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        },
        cell: {
          color: "white",
        },
        columnHeaders: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "white",
        },
        footerContainer: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "white",
        },
      },
    },
  },
});

export default theme;
