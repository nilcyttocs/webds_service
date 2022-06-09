const webdsTheme = {
  palette: {
    primary: {
      light: "#5aacf6",
      main: "#007dc3",
      dark: "#005192",
      contrastText: "#fff"
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
};

export default webdsTheme;
