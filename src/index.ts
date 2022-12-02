import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { IMainMenu } from "@jupyterlab/mainmenu";

import { IStateDB } from "@jupyterlab/statedb";

import { Token } from "@lumino/coreutils";

import {
  addGuidedTuningUsage,
  addStaticConfigUsage,
  initializeStatistics
} from "./analytics/utils";

import { addMenu } from "./main_menu/utils";

import {
  addApplicationHex,
  addApplicationIHex,
  addApplicationImg,
  addPrivateConfig,
  addPublicConfig,
  addPackratFiles,
  getCfgFile
} from "./packrat/utils";

import {
  CPUInfo,
  getCPUInfo,
  getOSInfo,
  getStashInfo,
  isExternal,
  isTestRailOnline,
  OSInfo,
  pollRepo,
  pollStash,
  StashInfo,
  updateDSDKInfo
} from "./pinormos/utils";

import {
  getPackratID,
  getPartNumber,
  readDynamicConfig,
  readStaticConfig,
  writeDynamicConfig,
  writeStaticConfig
} from "./touchcomm/utils";

import {
  getJupyterFontColor,
  getWebDSLauncher,
  getWebDSLauncherModel,
  getWebDSTheme,
  setWebDSLauncher,
  setWebDSLauncherModel
} from "./ui/utils";

export { CPUInfo, OSInfo, StashInfo } from "./pinormos/utils";

export {
  TouchcommADCReport,
  TouchcommPositionData,
  TouchcommTouchReport,
  TouchcommTraceReport
} from "./touchcomm/utils";

export { WebDSWidget } from "./widgets/utils";

export let stateDB: IStateDB | null = null;

export type WebDSService = {
  analytics: {
    addGuidedTuningUsage: (widgetName: string) => void;
    addStaticConfigUsage: (configName: string, target: string) => void;
  };
  greeting: () => void;
  initialized: Promise<null>;
  packrat: {
    cache: {
      addApplicationHex: (packratID?: number | undefined) => Promise<string>;
      addApplicationIHex: (packratID?: number | undefined) => Promise<string>;
      addApplicationImg: (packratID?: number | undefined) => Promise<string>;
      addPrivateConfig: (packratID?: number | undefined) => Promise<string>;
      addPublicConfig: (packratID?: number | undefined) => Promise<string>;
      addPackratFiles: (
        files: string[],
        packratID?: number | undefined
      ) => Promise<string[]>;
    };
    fetch: {
      getCfgFile: (packratID?: number | undefined) => Promise<string>;
    };
  };
  pinormos: {
    getCPUInfo: () => CPUInfo;
    getOSInfo: () => OSInfo;
    getStashInfo: () => StashInfo;
    isExternal: () => boolean;
    isTestRailOnline: () => boolean;
  };
  touchcomm: {
    getPackratID: () => Promise<number>;
    getPartNumber: () => Promise<string>;
    readDynamicConfig: () => Promise<any>;
    readStaticConfig: () => Promise<any>;
    writeDynamicConfig: (entries: any) => void;
    writeStaticConfig: (entries: any, commit: boolean) => void;
  };
  ui: {
    getJupyterFontColor: () => string;
    getWebDSLauncher: () => any;
    getWebDSLauncherModel: () => any;
    getWebDSTheme: (inverted?: any) => any;
    setWebDSLauncher: (launcher: any) => void;
    setWebDSLauncherModel: (launcherModel: any) => void;
  };
};

export const WebDSService = new Token<WebDSService>(
  "@webds/service:WebDSService"
);

/**
 * Initialization data for the @webds/service extension.
 */
const plugin: JupyterFrontEndPlugin<WebDSService> = {
  id: "@webds/service:plugin",
  autoStart: true,
  optional: [IStateDB],
  requires: [IMainMenu],
  provides: WebDSService,
  activate: (
    app: JupyterFrontEnd,
    mainMenu: IMainMenu,
    state: IStateDB | null
  ): WebDSService => {
    console.log("JupyterLab extension @webds/service is activated!");

    const dsdkInfoPromise = new Promise<null>(function (resolve, reject) {
      updateDSDKInfo().then(() => {
        resolve(null);
      });
    });

    dsdkInfoPromise.then(() => {
      pollRepo();
      pollStash();
      addMenu(app, mainMenu);
    });

    if (state) {
      dsdkInfoPromise.then(() => {
        stateDB = state;
        initializeStatistics();
      });
    }

    const initializedPromise = dsdkInfoPromise;

    return {
      analytics: {
        addGuidedTuningUsage,
        addStaticConfigUsage
      },
      greeting() {
        console.log("Hello! This is WebDS Service. How may I help you?");
      },
      initialized: initializedPromise,
      packrat: {
        cache: {
          addApplicationHex,
          addApplicationIHex,
          addApplicationImg,
          addPrivateConfig,
          addPublicConfig,
          addPackratFiles
        },
        fetch: {
          getCfgFile
        }
      },
      pinormos: {
        getCPUInfo,
        getOSInfo,
        getStashInfo,
        isExternal,
        isTestRailOnline
      },
      touchcomm: {
        getPackratID,
        getPartNumber,
        readDynamicConfig,
        readStaticConfig,
        writeDynamicConfig,
        writeStaticConfig
      },
      ui: {
        getJupyterFontColor,
        getWebDSLauncher,
        getWebDSLauncherModel,
        getWebDSTheme,
        setWebDSLauncher,
        setWebDSLauncherModel
      }
    };
  }
};

export default plugin;
