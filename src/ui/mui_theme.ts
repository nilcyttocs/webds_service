import green from "@mui/material/colors/green";
import red from "@mui/material/colors/red";

const SYNA_BLUE = "#007dc3";

const webdsTheme = (mode: string) => ({
  palette: {
    mode,
    primary: {
      main: SYNA_BLUE
    },
    custom: {
      green: green["A400"],
      red: red["A700"]
    },
    section:
      mode === "light"
        ? {
            background: "#f5f5f5",
            border: "#e0e0e0"
          }
        : {
            background: "#212121",
            border: "#616161"
          }
  },

  typography: {
    fontFamily: ["Arial", "Roboto", "Helvetica", "sans-serif"].join(",")
  },

  components: {
    MuiAvatar: {
      defaultProps: {
        sx: { bgcolor: SYNA_BLUE }
      }
    },
    MuiButton: {
      defaultProps: {
        variant: "contained"
      },
      styleOverrides: {
        root: {
          minWidth: "0px",
          minHeight: "0px",
          textTransform: "none"
        }
      }
    },
    MuiFab: {
      defaultProps: {
        color: "primary",
        size: "small"
      }
    },
    MuiTypography: {
      defaultProps: {
        color: "text.primary",
        component: "div"
      },
      variants: [
        {
          props: { variant: "underline" },
          style: {
            fontSize: "0.875rem",
            fontWeight: 400,
            lineHeight: 1.43,
            textDecoration: "underline"
          }
        }
      ]
    }
  }
});

export default webdsTheme;
