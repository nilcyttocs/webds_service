import { createTheme, ThemeOptions } from '@mui/material/styles';

import webdsTheme from './mui_theme';

export const getJupyterFontColor = (): string => {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--jp-ui-font-color1')
    .trim();
};

export const getJupyterThemeMode = (): string => {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--jp-layout-color0')
    .includes('white')
    ? 'light'
    : 'dark';
};

export const getWebDSTheme = ({ inverted = false } = {}): any => {
  let mode: string;
  if (
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--jp-layout-color0')
      .includes('white')
  ) {
    mode = inverted ? 'dark' : 'light';
  } else {
    mode = inverted ? 'light' : 'dark';
  }
  return createTheme(webdsTheme(mode) as ThemeOptions);
};

let webdsLauncher: any;

export const getWebDSLauncher = (): any => {
  return webdsLauncher;
};

export const setWebDSLauncher = (launcher: any) => {
  webdsLauncher = launcher;
};

let webdsLauncherModel: any;

export const getWebDSLauncherModel = (): any => {
  return webdsLauncherModel;
};

export const setWebDSLauncherModel = (launcherModel: any) => {
  webdsLauncherModel = launcherModel;
};

let webdsConfigLauncher: any;

export const getWebDSConfigLauncher = (): any => {
  return webdsConfigLauncher;
};

export const setWebDSConfigLauncher = (launcher: any) => {
  webdsConfigLauncher = launcher;
};

let webdsDocLauncher: any;

export const getWebDSDocLauncher = (): any => {
  return webdsDocLauncher;
};

export const setWebDSDocLauncher = (launcher: any) => {
  webdsDocLauncher = launcher;
};
