import { createTheme, ThemeOptions } from "@mui/material/styles";

import webdsTheme from "./mui_theme";

export const getJupyterFontColor = (): string => {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--jp-ui-font-color1")
    .trim();
};

export const getWebDSTheme = (): any => {
  let mode: string;
  if (
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--jp-layout-color0")
      .includes("white")
  ) {
    mode = "light";
  } else {
    mode = "dark";
  }
  return createTheme(webdsTheme(mode) as ThemeOptions);
};
