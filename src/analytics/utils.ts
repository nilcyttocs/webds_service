import { stateDB } from '../index';
import { getCPUInfo, getOSInfo } from '../pinormos/utils';
import { focusTracker } from '../widgets/utils';

const STATISTICS_DB_NAME = '@webds/service:statistics';

const usageDataBaseURL = 'http://nexus.synaptics.com:8085/usage';

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
    statistics.data.data[statistics.version].extensions[extensionName] =
      statistics.data.data[statistics.version].extensions[extensionName] + 1 ||
      1;
    try {
      await stateDB.save(statistics.dbName, statistics.data as any);
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};

export const addGuidedTuningUsage = async (widgetName: string) => {
  if (stateDB && statistics.initialized) {
    statistics.data.data[statistics.version].guidedTuning[widgetName] =
      statistics.data.data[statistics.version].guidedTuning[widgetName] + 1 ||
      1;
    try {
      await stateDB.save(statistics.dbName, statistics.data as any);
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
    statistics.data.data[statistics.version].staticConfig[target][configName] =
      statistics.data.data[statistics.version].staticConfig[target][
        configName
      ] || {};
    statistics.data.data[statistics.version].staticConfig[target][
      configName
    ].total =
      statistics.data.data[statistics.version].staticConfig[target][configName]
        .total + 1 || 1;
    if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
      const label = focusTracker.currentWidget.title.label;
      statistics.data.data[statistics.version].staticConfig[target][configName][
        label
      ] =
        statistics.data.data[statistics.version].staticConfig[target][
          configName
        ][label] + 1 || 1;
    }
    try {
      await stateDB.save(statistics.dbName, statistics.data as any);
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};

export const uploadStatistics = async () => {
  if (stateDB && statistics.initialized) {
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Content-Type', 'application/json');

    const request = new Request(usageDataBaseURL, {
      method: 'POST',
      mode: 'cors',
      headers: requestHeaders,
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(statistics.data)
    });

    try {
      const response = await fetch(request);
      console.log(response);
    } catch (error) {
      console.error(`Error - POST ${usageDataBaseURL}\n${error}`);
      return Promise.reject('Failed to upload statistics');
    }
  } else {
    Promise.reject('Statistics database unavailable');
  }
};

const resetStatistics = (data: any) => {
  statistics.version = getOSInfo().current.version;
  statistics.data = data;
  statistics.data.uuid = statistics.data.uuid || getCPUInfo().Serial;
  statistics.data.data = statistics.data.data || {};
  statistics.data.data[statistics.version] =
    statistics.data.data[statistics.version] || {};
  statistics.data.data[statistics.version].extensions =
    statistics.data.data[statistics.version].extensions || {};
  statistics.data.data[statistics.version].guidedTuning =
    statistics.data.data[statistics.version].guidedTuning || {};
  statistics.data.data[statistics.version].staticConfig =
    statistics.data.data[statistics.version].staticConfig || {};
  statistics.data.data[statistics.version].staticConfig.toFlash =
    statistics.data.data[statistics.version].staticConfig.toFlash || {};
  statistics.data.data[statistics.version].staticConfig.toRAM =
    statistics.data.data[statistics.version].staticConfig.toRAM || {};
};

export const clearStatistics = async () => {
  if (stateDB && statistics.initialized) {
    resetStatistics({});
    try {
      await stateDB.save(statistics.dbName, statistics.data as any);
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
    resetStatistics(data);
    try {
      await stateDB.save(statistics.dbName, statistics.data as any);
      statistics.initialized = true;
    } catch (error) {
      console.error(`Failed to save to ${statistics.dbName}\n${error}`);
    }
  }
};
