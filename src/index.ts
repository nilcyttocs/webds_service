import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { Token } from '@lumino/coreutils'

import { getPackratID } from './touchcomm/utils';

import {
  getJupyterFontColor,
  getWebDSTheme
} from './ui/utils';

import {
  addApplicationHex,
  addApplicationIHex,
  addApplicationImg,
  addPrivateConfig,
  addPublicConfig,
  addPackratFiles
} from './packrat/utils';

export type WebDSService = {
  greeting: () => void
  packrat: {
    cache: {
      addApplicationHex: (packratID?: number|undefined) => Promise<string>
      addApplicationIHex: (packratID?: number|undefined) => Promise<string>
      addApplicationImg: (packratID?: number|undefined) => Promise<string>
      addPrivateConfig: (packratID?: number|undefined) => Promise<string>
      addPublicConfig: (packratID?: number|undefined) => Promise<string>
      addPackratFiles: (files: string[], packratID?: number|undefined) => Promise<string[]>
    }
  },
  touchcomm: {
    getPackratID: () => Promise<number|undefined>
  },
  ui: {
    getJupyterFontColor: () => string
    getWebDSTheme: () => any
  }
};

export const WebDSService = new Token<WebDSService>('@webds/service:WebDSService');

/**
 * Initialization data for the @webds/service extension.
 */
const plugin: JupyterFrontEndPlugin<WebDSService> = {
  id: '@webds/service:plugin',
  autoStart: true,
  provides: WebDSService,
  activate: (app: JupyterFrontEnd): WebDSService => {
    console.log('JupyterLab extension @webds/service is activated!');

    return {
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
        }
      },
      touchcomm: {
        getPackratID
      },
      ui: {
        getJupyterFontColor,
        getWebDSTheme
      }
    };
  }
};

export default plugin;
