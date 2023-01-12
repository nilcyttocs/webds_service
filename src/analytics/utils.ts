import { stateDB } from '../index';
import { getCPUInfo, getOSInfo } from '../pinormos/utils';
import { focusTracker } from '../widgets/utils';

const STATISTICS_DB_NAME = '@webds/service:statistics';

type Statistics = {
  dbName: string;
  data: any;
  version: string;
  initialized: boolean;
};

export const statistics: Statistics = {
  dbName: STATISTICS_DB_NAME,
  data: {},
  version: '',
  initialized: false
};

export const addExtensionUsage = async (extensionName: string) => {
  if (stateDB && statistics.initialized) {
    statistics.data[statistics.version].extensions[extensionName] =
      statistics.data[statistics.version].extensions[extensionName] + 1 || 1;
    try {
      //await stateDB.save(statistics.dbName, statistics.data as any);
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};

export const addGuidedTuningUsage = async (widgetName: string) => {
  if (stateDB && statistics.initialized) {
    statistics.data[statistics.version].guidedTuning[widgetName] =
      statistics.data[statistics.version].guidedTuning[widgetName] + 1 || 1;
    try {
      //await stateDB.save(statistics.dbName, statistics.data as any);
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};

export const addStaticConfigUsage = async (
  configName: string,
  target: string
) => {
  if (stateDB && statistics.initialized) {
    statistics.data[statistics.version].staticConfig[target][configName] =
      statistics.data[statistics.version].staticConfig[target][configName] ||
      {};
    statistics.data[statistics.version].staticConfig[target][configName].total =
      statistics.data[statistics.version].staticConfig[target][configName]
        .total + 1 || 1;
    if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
      const label = focusTracker.currentWidget.title.label;
      statistics.data[statistics.version].staticConfig[target][configName][
        label
      ] =
        statistics.data[statistics.version].staticConfig[target][configName][
          label
        ] + 1 || 1;
    }
    try {
      //await stateDB.save(statistics.dbName, statistics.data as any);
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};

export const clearStatistics = async () => {
  if (stateDB && statistics.initialized) {
    statistics.data[statistics.version] = {
      extensions: {},
      guidedTuning: {},
      staticConfig: {
        toFlash: {},
        toRAM: {}
      }
    };
    try {
      //await stateDB.save(statistics.dbName, statistics.data as any);
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};

export const initializeStatistics = async () => {
  if (stateDB) {
    let data = await stateDB.fetch(statistics.dbName);
    if (data === undefined) {
      data = {};
    }
    statistics.data = data;
    statistics.version = getOSInfo().current.version;
    statistics.data.serial = getCPUInfo().Serial;
    statistics.data[statistics.version] =
      statistics.data[statistics.version] || {};
    statistics.data[statistics.version].extensions =
      statistics.data[statistics.version].extensions || {};
    statistics.data[statistics.version].guidedTuning =
      statistics.data[statistics.version].guidedTuning || {};
    statistics.data[statistics.version].staticConfig =
      statistics.data[statistics.version].staticConfig || {};
    statistics.data[statistics.version].staticConfig.toFlash =
      statistics.data[statistics.version].staticConfig.toFlash || {};
    statistics.data[statistics.version].staticConfig.toRAM =
      statistics.data[statistics.version].staticConfig.toRAM || {};
    try {
      //await stateDB.save(statistics.dbName, statistics.data as any);
      statistics.initialized = true;
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};
