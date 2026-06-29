import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#7C3AED",
    },

    secondary: {
      main: "#A78BFA",
    },

    background: {
      default: "#0B0B0F",
      paper: "#17171D",
    },

    text: {
      primary: "#FFFFFF",
      secondary: "#B4B4C3",
    },

    divider: "#2A2A35",

    success: {
      main: "#22C55E",
    },

    warning: {
      main: "#F59E0B",
    },

    error: {
      main: "#EF4444",
    },

    info: {
      main: "#3B82F6",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: "Inter, Roboto, sans-serif",

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 600,
    },

    h4: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0B0B0F",
        },

        "*::-webkit-scrollbar": {
          width: "8px",
        },

        "*::-webkit-scrollbar-track": {
          background: "#17171D",
        },

        "*::-webkit-scrollbar-thumb": {
          background: "#7C3AED",
          borderRadius: "8px",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 22px",
          fontWeight: 600,
        },

        contained: {
          boxShadow: "none",

          "&:hover": {
            boxShadow: "0 0 20px rgba(124,58,237,.35)",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#17171D",
          borderRadius: 18,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#17171D",
          borderRadius: 18,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
    },
  },
});

export default theme;
