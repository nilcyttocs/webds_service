import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { Token } from '@lumino/coreutils'

import { getPackratID } from './general/utils';

import {
  addApplicationHex,
  addApplicationImg,
  addPrivateConfig,
  addPublicConfig
} from './packrat/utils';

export type WebDSService = {
  greeting: () => void
  general: {
    getPackratID: () => Promise<number|undefined>
  }
  packrat: {
    cache: {
      addApplicationHex: (packratID?: number|undefined) => Promise<void>
      addApplicationImg: (packratID?: number|undefined) => Promise<void>
      addPrivateConfig: (packratID?: number|undefined) => Promise<any>
      addPublicConfig: (packratID?: number|undefined) => Promise<any>

    }
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
      general: {
        getPackratID
      },
      packrat: {
        cache: {
          addApplicationHex,
          addApplicationImg,
          addPrivateConfig,
          addPublicConfig
        }
      }
    };
  }
};

export default plugin;
