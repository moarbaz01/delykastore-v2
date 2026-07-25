import { createTheme } from "@mui/material/styles";
import tailwindConfig from "./tailwind.config";

const colors = tailwindConfig.theme.extend.colors;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary, // #ff962d
    },
    background: {
      default: colors.navy,
      paper: colors.secondary, // use secondary (#252F45) instead of card-bg for better contrast
    },
    text: {
      primary: "#ffffff",
      secondary: "#9ca3af", // gray-400
    },
    divider: colors.darkBlue, // #2d3e50
  },
  typography: {
    fontFamily: "inherit",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.secondary,
          borderRadius: "12px",
          border: `1px solid ${colors.darkBlue}`,
          backgroundImage: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.darkBlue}`,
          padding: "16px 24px",
          color: colors.primary,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${colors.darkBlue}`,
          padding: "16px 24px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.navy, // use navy for better contrast against secondary backgrounds
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.darkBlue,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.secondary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#9ca3af",
          "&.Mui-focused": {
            color: colors.primary,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#9ca3af",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.secondary,
          border: `1px solid ${colors.darkBlue}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: colors.primary,
          color: "#ffffff",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#9333ea", // darker purple
          },
          "&:disabled": {
            backgroundColor: colors.secondary,
            color: "#64748b",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.darkBlue}`,
          borderRight: `1px solid ${colors.darkBlue}`,
          whiteSpace: "nowrap",
          "&:last-child": {
            borderRight: "none",
          },
        },
        head: {
          color: "#f8fafc",
          fontWeight: "bold",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        },
        body: {
          color: "#e2e8f0",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.02) !important",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: colors.secondary,
          borderRadius: "12px",
          border: `1px solid ${colors.darkBlue}`,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          color: "white",
          backgroundColor: "transparent",
          border: `1px solid ${colors.darkBlue}`,
        },
        cell: {
          color: "white",
        },
        columnHeaders: {
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          color: "white",
        },
        footerContainer: {
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          color: "white",
        },
      },
    },
  },
});

export default theme;
