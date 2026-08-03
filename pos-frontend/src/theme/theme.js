
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // GLOBAL PALETTE
  palette: {
    primary: {
      main: "#4F46E5",
      dark: "#4338CA",
      light: "#EEF2FF",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#64748B",
    },

    background: {
      default: "#F7F7F5",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },

    divider: "#E2E8F0",

    success: {
      main: "#16A34A",
    },

    warning: {
      main: "#F59E0B",
    },

    error: {
      main: "#DC2626",
    },

    info: {
      main: "#0EA5E9",
    },
  },

  // ============================================================
  // GLOBAL TYPOGRAPHY
  // ============================================================
  typography: {
    fontFamily: [
      "Inter",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),

    // Page titles
    h4: {
      fontSize: "24px",
      lineHeight: 1.3,
      fontWeight: 700,
      color: "#0F172A",
    },

    // Section titles
    h5: {
      fontSize: "20px",
      lineHeight: 1.35,
      fontWeight: 700,
      color: "#0F172A",
    },

    // Card / section headings
    h6: {
      fontSize: "16px",
      lineHeight: 1.4,
      fontWeight: 700,
      color: "#0F172A",
    },

    body1: {
      fontSize: "14px",
      lineHeight: 1.6,
      color: "#0F172A",
    },

    body2: {
      fontSize: "13px",
      lineHeight: 1.5,
      color: "#64748B",
    },

    subtitle1: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#0F172A",
    },

    subtitle2: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#64748B",
    },

    button: {
      fontSize: "14px",
      fontWeight: 600,
      textTransform: "none",
    },

    caption: {
      fontSize: "12px",
      lineHeight: 1.4,
      color: "#64748B",
    },
  },

  // ============================================================
  // GLOBAL SHAPE
  // ============================================================
  shape: {
    borderRadius: 10,
  },

  // ============================================================
  // COMPONENTS
  // ============================================================
  components: {
    // ------------------------------------------------------------
    // BUTTONS
    // ------------------------------------------------------------
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          transition: "all 0.2s ease",

          "&:hover": {
            boxShadow: "none",
          },

          "&.Mui-disabled": {
            opacity: 0.55,
          },
        },

        containedPrimary: {
          backgroundColor: "#4F46E5",

          "&:hover": {
            backgroundColor: "#4338CA",
          },
        },

        outlinedPrimary: {
          borderColor: "#E2E8F0",
          color: "#4F46E5",
          backgroundColor: "#FFFFFF",

          "&:hover": {
            borderColor: "#4F46E5",
            backgroundColor: "#EEF2FF",
          },
        },

        textPrimary: {
          color: "#4F46E5",

          "&:hover": {
            backgroundColor: "#EEF2FF",
          },
        },
      },
    },

    // ------------------------------------------------------------
    // ICON BUTTONS
    // ------------------------------------------------------------
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease",

          "&:hover": {
            backgroundColor: "#EEF2FF",
          },
        },
      },
    },

    // ------------------------------------------------------------
    // TEXT FIELDS / INPUTS
    // ------------------------------------------------------------
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 8,
          backgroundColor: "#FFFFFF",
          fontSize: "14px",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E2E8F0",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#CBD5E1",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4F46E5",
            borderWidth: 1,
          },
        },

        input: {
          padding: "9px 12px",
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "13px",
          color: "#64748B",

          "&.Mui-focused": {
            color: "#4F46E5",
          },
        },
      },
    },

    // ------------------------------------------------------------
    // PAPER
    // ------------------------------------------------------------
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "none",
          backgroundColor: "#FFFFFF",
        },
      },
    },

    // ------------------------------------------------------------
    // CARD
    // ------------------------------------------------------------
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "none",
          backgroundColor: "#FFFFFF",
        },
      },
    },

    // ------------------------------------------------------------
    // TABLE
    // ------------------------------------------------------------
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E2E8F0",
          fontSize: "13px",
          color: "#0F172A",
          padding: "12px 16px",
        },

        head: {
          backgroundColor: "#F8FAFC",
          color: "#64748B",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#FAFAFF",
          },
        },
      },
    },

    // ------------------------------------------------------------
    // CHIPS
    // ------------------------------------------------------------
    MuiChip: {
      styleOverrides: {
        root: {
          height: 28,
          borderRadius: 7,
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },

    // ------------------------------------------------------------
    // TOOLTIP
    // ------------------------------------------------------------
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "12px",
          borderRadius: 6,
        },
      },
    },

    // ------------------------------------------------------------
    // DIALOG
    // ------------------------------------------------------------
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "20px 24px 12px",
          fontSize: "18px",
          fontWeight: 700,
          color: "#0F172A",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "12px 24px 20px",
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "12px 24px 20px",
          gap: 8,
        },
      },
    },

    // ------------------------------------------------------------
    // AUTOCOMPLETE
    // ------------------------------------------------------------
    MuiAutocomplete: {
      styleOverrides: {
        option: {
          fontSize: "14px",
          padding: "9px 12px",
        },

        inputRoot: {
          minHeight: 40,
        },
      },
    },

    // ------------------------------------------------------------
    // SELECT
    // ------------------------------------------------------------
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "14px",
        },
      },
    },

    // ------------------------------------------------------------
    // DIVIDER
    // ------------------------------------------------------------
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E2E8F0",
        },
      },
    },

    // ------------------------------------------------------------
    // PAGINATION
    // ------------------------------------------------------------
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          fontSize: "13px",

          "&.Mui-selected": {
            backgroundColor: "#4F46E5",
            color: "#FFFFFF",

            "&:hover": {
              backgroundColor: "#4338CA",
            },
          },
        },
      },
    },
  },
});

export default theme;
