const webdsTheme = (mode: string) => ({
  palette: {
    mode,
    primary: {
      light: "#5aacf6",
      main: "#007dc3",
      dark: "#005192",
      contrastText: "#fff"
    },
    colors: {
      green: "#00e676",
      grey: "#9e9e9e",
      red: "#d50000"
    },
    section:
      mode === "light"
        ? {
            main: "#f5f5f5",
            border: "#e0e0e0"
          }
        : {
            main: "#212121",
            border: "#616161"
          }
  },

  typography: {
    fontFamily: ["Arial", "Roboto", "Helvetica", "sans-serif"].join(",")
  },

  components: {
    MuiAvatar: {
      defaultProps: {
        sx: { bgcolor: "#007dc3" }
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
        color: "textPrimary",
        component: "div"
      }
    }
  }
});

export default webdsTheme;
