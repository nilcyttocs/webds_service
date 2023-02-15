import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { IStateDB } from '@jupyterlab/statedb';
import { Token } from '@lumino/coreutils';

import {
  addGuidedTuningUsage,
  addStaticConfigUsage,
  initializeStatistics
} from './analytics/utils';
import { addMenu } from './main_menu/utils';
import {
  addApplicationHex,
  addApplicationIHex,
  addApplicationImg,
  addPackratFiles,
  addPrivateConfig,
  addPublicConfig,
  getCfgFile
} from './packrat/utils';
import {
  CPUInfo,
  getCPUInfo,
  getOSInfo,
  getRenderRate,
  getStashInfo,
  initializeWebDSSettings,
  isExternal,
  isTestRailOnline,
  OSInfo,
  pollRepo,
  pollStash,
  setRenderRate,
  StashInfo,
  updateDSDKInfo
} from './pinormos/utils';
import {
  getPackratID,
  getPartNumber,
  readDynamicConfig,
  readStaticConfig,
  writeDynamicConfig,
  writeStaticConfig
} from './touchcomm/utils';
import {
  getJupyterFontColor,
  getWebDSLauncher,
  getWebDSLauncherModel,
  getWebDSTheme,
  setWebDSLauncher,
  setWebDSLauncherModel
} from './ui/utils';

export { CPUInfo, OSInfo, StashInfo } from './pinormos/utils';
export {
  TouchcommADCReport,
  TouchcommPositionData,
  TouchcommTouchReport,
  TouchcommTraceReport
} from './touchcomm/utils';
export { WebDSWidget } from './widgets/utils';

export let stateDB: IStateDB | null = null;

export type WebDSService = {
  analytics: {
    addGuidedTuningUsage: (widgetName: string) => void;
    addStaticConfigUsage: (configName: string, target: string) => void;
  };
  greeting: () => void;
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
    settings: {
      getRenderRate: () => number | undefined;
      setRenderRate: (rate: number) => void;
    };
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
  '@webds/service:WebDSService'
);

/**
 * Initialization data for the @webds/service extension.
 */
const plugin: JupyterFrontEndPlugin<WebDSService> = {
  id: '@webds/service:plugin',
  autoStart: true,
  optional: [IStateDB],
  requires: [IMainMenu],
  provides: WebDSService,
  activate: async (
    app: JupyterFrontEnd,
    mainMenu: IMainMenu,
    state: IStateDB | null
  ): Promise<WebDSService> => {
    console.log('JupyterLab extension @webds/service is activated!');

    stateDB = state;

    await updateDSDKInfo();

    if (isExternal()) {
      await addPublicConfig();
    } else {
      await addPrivateConfig();
    }

    pollRepo();
    pollStash();
    addMenu(app, mainMenu);
    if (state) {
      initializeWebDSSettings();
      initializeStatistics();
    }

    console.log('JupyterLab extension @webds/service is initialized!');

    return {
      analytics: {
        addGuidedTuningUsage,
        addStaticConfigUsage
      },
      greeting() {
        console.log('Hello! This is WebDS Service. How may I help you?');
      },
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
        isTestRailOnline,
        settings: {
          getRenderRate,
          setRenderRate
        }
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
