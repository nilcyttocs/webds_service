const webdsTheme = (mode: string) => ({
  palette: {
    mode,
    primary: {
      light: "#5aacf6",
      main: "#007dc3",
      dark: "#005192",
      contrastText: "#fff"
    },
    section:
      mode === "light"
        ? {
            main: "rgba(0, 0, 0, 0.04)"
          }
        : {
            main: "rgba(255, 255, 255, 0.04)"
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
