import { createTheme } from "@mui/material/styles";

const theme = createTheme({

  palette: {

    primary: {
      main: "#2563eb",
      dark: "#1d4ed8",
      light: "#60a5fa",
    },

    secondary: {
      main: "#0f172a",
    },

    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },

    success: {
      main: "#16a34a",
    },

    warning: {
      main: "#f59e0b",
    },

    error: {
      main: "#dc2626",
    },

    info: {
      main: "#0ea5e9",
    },

    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    }

  },

  typography: {

    fontFamily: [
      "Inter",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    }

  },

  shape: {
    borderRadius: 14,
  },

  components: {

    MuiButton: {

      styleOverrides: {

        root: {

          borderRadius: 12,

          padding: "10px 22px",

          boxShadow: "none",

          transition: ".25s",

          "&:hover": {

            boxShadow:
              "0 12px 30px rgba(37,99,235,.20)",

          }

        }

      }

    },

    MuiPaper: {

      styleOverrides: {

        root: {

          borderRadius: 18,

          boxShadow:
            "0 10px 35px rgba(15,23,42,.06)",

        }

      }

    },

    MuiCard: {

      styleOverrides: {

        root: {

          borderRadius: 18,

          boxShadow:
            "0 10px 35px rgba(15,23,42,.06)",

        }

      }

    },

    MuiOutlinedInput: {

      styleOverrides: {

        root: {

          borderRadius: 14,

          background: "#fff",

        }

      }

    }

  }

});

export default theme;