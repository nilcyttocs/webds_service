import { JupyterFrontEnd } from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';

import {
  clearStatistics,
  statistics,
  uploadStatistics
} from '../analytics/utils';
import { requestAPI } from '../handler';
import { stateDB } from '../index';
import { addApplicationImg } from '../packrat/utils';
import { isExternal } from '../pinormos/utils';
import { getPackratID } from '../touchcomm/utils';
import { focusTracker } from '../widgets/utils';

namespace Attributes {
  export const title = 'WebDS';
  export const rank = 80;
}

const showAnalyticsMenu = false;

const saveImageWidgets = [
  'webds_config_editor_widget',
  'webds_gear_selection_widget',
  'webds_guided_config_widget',
  'webds_hybrid_analog_widget',
  'webds_integration_duration_widget',
  'webds_sensor_mapping_widget',
  'webds_tutor_initial_setup_widget'
];

const toHex = (str: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};

const saveByteArray = (fileName: string, input: any) => {
  let blob = new Blob([input], { type: 'application/octet-stream' });
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  let output = fileName;
  link.download = output;
  link.click();
};

const saveApplicationImage = async () => {
  try {
    await addApplicationImg();
  } catch (error) {
    console.error(error);
    window.alert(
      'Failed to retrieve application image from packrat server. Please check in file browser in left sidebar and ensure availability of base image file in /Packrat/ directory (e.g. /Packrat/1234567/PR1234567.img for PR1234567).'
    );
    return;
  }
  let packratID: number;
  try {
    packratID = await getPackratID();
  } catch (error) {
    console.error(error);
    window.alert('Failed to retrieve packrat ID.');
    return;
  }
  let configID: string;
  const dataToSend: any = {
    command: 'getAppInfo'
  };
  try {
    const response = await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    configID = toHex(response.customerConfigId);
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    window.alert('Failed to retrieve config ID.');
    return;
  }
  try {
    const response = await requestAPI<any>(
      `packrat/${packratID}/PR${packratID}.img?type=updated`
    );
    const byteArray = new Uint8Array(response.data);
    saveByteArray(`PR${packratID}_${configID}.img`, byteArray.buffer);
  } catch (error) {
    console.error(
      `Error - GET /webds/packrat/${packratID}/PR${packratID}.img?type=updated\n${error}`
    );
    window.alert('Failed to generate new application image.');
  }
};

export const addMenu = (app: JupyterFrontEnd, mainMenu: IMainMenu) => {
  const webdsMenu = new Menu({ commands: app.commands });
  webdsMenu.title.label = Attributes.title;

  const commandSaveImage = {
    label: 'Save Image',
    caption: 'Save Image',
    isEnabled: () => {
      if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
        return saveImageWidgets.includes(focusTracker.currentWidget.id);
      } else {
        return false;
      }
    },
    execute: (args: any) => {
      saveApplicationImage();
    }
  };
  app.commands.addCommand('webds_service_save_image:open', commandSaveImage);

  const configSubMenu = new Menu({ commands: app.commands });
  configSubMenu.title.label = 'Configuration';
  configSubMenu.addItem({
    command: 'webds_service_save_image:open'
  });

  webdsMenu.addItem({
    type: 'submenu',
    submenu: configSubMenu
  });

  if (!isExternal()) {
    const commandSyslog = {
      label: 'Syslog',
      caption: 'Syslog',
      execute: async () => {
        try {
          const widget: MainAreaWidget = await app.commands.execute(
            'docmanager:open',
            {
              path: 'Synaptics/_links/Syslog',
              factory: 'Editor',
              options: { mode: 'split-right' }
            }
          );
          widget.id = 'webds_service_syslog';
          widget.title.closable = true;
          if (!widget.isAttached) app.shell.add(widget, 'main');
          app.shell.activateById(widget.id);
        } catch (error) {
          console.error(error);
          window.alert('Failed to open syslog.');
        }
      }
    };
    app.commands.addCommand('webds_service_syslog:open', commandSyslog);

    const commandI2CLog = {
      label: 'I2C Log',
      caption: 'I2C Log',
      execute: async () => {
        try {
          const widget: MainAreaWidget = await app.commands.execute(
            'docmanager:open',
            {
              path: 'Synaptics/_links/I2C_Log',
              factory: 'Editor',
              options: { mode: 'split-right' }
            }
          );
          widget.id = 'webds_service_i2c_log';
          widget.title.closable = true;
          if (!widget.isAttached) app.shell.add(widget, 'main');
          app.shell.activateById(widget.id);
        } catch (error) {
          console.error(error);
          window.alert('Failed to open I2C log.');
        }
      }
    };
    app.commands.addCommand('webds_service_i2c_log:open', commandI2CLog);

    const commandSPILog = {
      label: 'SPI Log',
      caption: 'SPI Log',
      execute: async () => {
        try {
          const widget: MainAreaWidget = await app.commands.execute(
            'docmanager:open',
            {
              path: 'Synaptics/_links/SPI_Log',
              factory: 'Editor',
              options: { mode: 'split-right' }
            }
          );
          widget.id = 'webds_service_spi_log';
          widget.title.closable = true;
          if (!widget.isAttached) app.shell.add(widget, 'main');
          app.shell.activateById(widget.id);
        } catch (error) {
          console.error(error);
          window.alert('Failed to open SPI log.');
        }
      }
    };
    app.commands.addCommand('webds_service_spi_log:open', commandSPILog);

    const logsSubMenu = new Menu({ commands: app.commands });
    logsSubMenu.title.label = 'Logs';
    logsSubMenu.addItem({
      command: 'webds_service_syslog:open'
    });
    logsSubMenu.addItem({
      command: 'webds_service_i2c_log:open'
    });
    logsSubMenu.addItem({
      command: 'webds_service_spi_log:open'
    });

    webdsMenu.addItem({
      type: 'separator'
    });
    webdsMenu.addItem({
      type: 'submenu',
      submenu: logsSubMenu
    });

    const commandClearAnalyticsStats = {
      label: 'Clear Stats',
      caption: 'Clear Stats',
      execute: () => {
        clearStatistics();
      }
    };
    app.commands.addCommand(
      'webds_service_analytics_stats:clear',
      commandClearAnalyticsStats
    );

    const commandPrintAnalyticsStats = {
      label: 'Print Stats',
      caption: 'Print Stats',
      execute: async () => {
        if (stateDB && statistics.initialized) {
          try {
            console.log(await stateDB.fetch(statistics.dbName));
          } catch (error) {
            console.error(error);
            window.alert('Failed to read stats.');
          }
        }
      }
    };
    app.commands.addCommand(
      'webds_service_analytics_stats:print',
      commandPrintAnalyticsStats
    );

    const commandUploadAnalyticsStats = {
      label: 'Upload Stats',
      caption: 'Upload Stats',
      execute: async () => {
        if (stateDB && statistics.initialized) {
          try {
            await uploadStatistics();
          } catch (error) {
            console.error(error);
            window.alert('Failed to upload stats.');
          }
        }
      }
    };
    app.commands.addCommand(
      'webds_service_analytics_stats:upload',
      commandUploadAnalyticsStats
    );

    const analyticsSubMenu = new Menu({ commands: app.commands });
    analyticsSubMenu.title.label = 'Analytics';
    analyticsSubMenu.addItem({
      command: 'webds_service_analytics_stats:clear'
    });
    analyticsSubMenu.addItem({
      command: 'webds_service_analytics_stats:print'
    });
    analyticsSubMenu.addItem({
      command: 'webds_service_analytics_stats:upload'
    });

    if (showAnalyticsMenu) {
      webdsMenu.addItem({
        type: 'separator'
      });
      webdsMenu.addItem({
        type: 'submenu',
        submenu: analyticsSubMenu
      });
    }
  }

  mainMenu.addMenu(webdsMenu, { rank: Attributes.rank });
};
