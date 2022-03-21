import { createTheme, ThemeOptions } from "@mui/material/styles";

import webdsTheme from './mui_theme';

const theme = webdsTheme as ThemeOptions;

export const getJupyterFontColor = (): string => {
  return window.getComputedStyle(document.documentElement).getPropertyValue('--jp-ui-font-color1').trim();
};

export const getWebDSTheme = (): any => {
  if (window.getComputedStyle(document.documentElement).getPropertyValue('--jp-layout-color0').includes('white')) {
    theme.palette!.mode = 'light';
  } else {
    theme.palette!.mode = 'dark';
  }
  return createTheme(theme);
};
