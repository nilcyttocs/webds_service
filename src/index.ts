import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { MainAreaWidget, ReactWidget } from "@jupyterlab/apputils";

import { Token } from "@lumino/coreutils";

import { FocusTracker } from "@lumino/widgets";

import { commandSaveImage } from "./main_menu/utils";

import {
  addApplicationHex,
  addApplicationIHex,
  addApplicationImg,
  addPrivateConfig,
  addPublicConfig,
  addPackratFiles
} from "./packrat/utils";

import { getOSInfo, pollOSInfo } from "./pinormos/utils";

import { getPackratID, getPartNumber } from "./touchcomm/utils";

import { getJupyterFontColor, getWebDSTheme } from "./ui/utils";

export interface OSInfo {
  current: {
    version: string;
  };
  repo: {
    version: string;
    tarball: string;
    manifest: string;
  };
}

export type WebDSService = {
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
  };
  pinormos: {
    getOSInfo: () => OSInfo;
  };
  touchcomm: {
    getPackratID: () => Promise<number>;
    getPartNumber: () => Promise<string>;
  };
  ui: {
    getJupyterFontColor: () => string;
    getWebDSTheme: () => any;
  };
};

export const WebDSService = new Token<WebDSService>(
  "@webds/service:WebDSService"
);

export const focusTracker: FocusTracker<WebDSWidget> = new FocusTracker();

export class WebDSWidget<
  T extends ReactWidget = ReactWidget
> extends MainAreaWidget {
  private widgetContainer: any;
  private widgetContent: any;
  private isScrolling = false;

  constructor(options: MainAreaWidget.IOptions<T>) {
    super(options);
    focusTracker.add(this);
  }

  private _setShadows(event: any) {
    if (!this.isScrolling) {
      window.requestAnimationFrame(() => {
        if (event.target.scrollTop > 0) {
          this.widgetContainer.classList.add("off-top");
        } else {
          this.widgetContainer.classList.remove("off-top");
        }
        if (
          Math.abs(
            event.target.scrollHeight -
              event.target.clientHeight -
              event.target.scrollTop
          ) > 3
        ) {
          this.widgetContainer.classList.add("off-bottom");
        } else {
          this.widgetContainer.classList.remove("off-bottom");
        }
        this.isScrolling = false;
      });
      this.isScrolling = true;
    }
  }

  setShadows() {
    this.widgetContainer = document.getElementById(this.id + "_container");
    this.widgetContent = document.getElementById(this.id + "_content");
    if (this.widgetContainer && this.widgetContent) {
      this.widgetContent.addEventListener(
        "scroll",
        this._setShadows.bind(this)
      );
      setTimeout(() => {
        if (this.widgetContent.scrollHeight > this.widgetContent.clientHeight) {
          this.widgetContainer.classList.add("off-bottom");
        }
      }, 200);
    }
  }
}

/**
 * Initialization data for the @webds/service extension.
 */
const plugin: JupyterFrontEndPlugin<WebDSService> = {
  id: "@webds/service:plugin",
  autoStart: true,
  provides: WebDSService,
  activate: (app: JupyterFrontEnd): WebDSService => {
    console.log("JupyterLab extension @webds/service is activated!");

    const { commands } = app;
    commands.addCommand("webds_service_save_image:main_menu", commandSaveImage);

    pollOSInfo();

    return {
      greeting() {
        console.log("Hello! This is WebDS Service. How may I help you?");
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
      pinormos: {
        getOSInfo
      },
      touchcomm: {
        getPackratID,
        getPartNumber
      },
      ui: {
        getJupyterFontColor,
        getWebDSTheme
      }
    };
  }
};

export default plugin;
