import { KernelAPI } from '@jupyterlab/services';

import { requestAPI } from '../handler';
import { stateDB } from '../index';
import { getPartNumber } from '../touchcomm/utils';
import { getWebDSConfigLauncher, getWebDSLauncher } from '../ui/utils';
import { focusTracker } from '../widgets/utils';
import { widgetSets } from './configuration';

export interface OSInfo {
  current: {
    version: string;
    versionNum: number;
  };
  repo: {
    version: string;
    versionNum: number;
    tarballUrl: string;
    tarballName: string;
    manifestUrl: string;
    manifestName: string;
    downloaded: boolean;
  };
}

type ProcessorType = {
  'model name': string;
  BogoMIPS: string;
  Features: string;
  'CPU implementer': string;
  'CPU architecture': string;
  'CPU variant': string;
  'CPU part': string;
  'CPU revision': string;
};

export interface CPUInfo {
  'processor 0': ProcessorType;
  'processor 1': ProcessorType;
  'processor 2': ProcessorType;
  'processor 3': ProcessorType;
  Hardware: string;
  Revision: string;
  Serial: string;
  Model: string;
}

export interface StashInfo {
  dataAvailable: boolean;
}

export interface ConnectionInfo {
  interface: string | undefined;
  i2cAddr: number | undefined;
  spiMode: number | undefined;
  partNumber: string | undefined;
}

export interface WebDSSettings {
  renderRate: number | undefined;
}

const SETTINGS_DB_NAME = '@webds/service:settings';

const dropboxLocation = '/var/spool/syna/softwareupdater';

const dropboxcEndpoint = '%2Fvar%2Fspool%2Fsyna%2Fsoftwareupdater';

const repoInfoURL =
  'http://nexus.synaptics.com:8081/repository/PinormOS/PinormOS/DSDK/Release/Info.json';

const repoTarballURL =
  'http://nexus.synaptics.com:8081/service/rest/v1/search/assets?repository=PinormOS&q="PinormOS/DSDK/Release/';

const repoTarballInternalSuffix = '/Internal/tarball"';

const repoTarballExternalSuffix = '/External/tarball"';

const testrailURL = 'http://nexus.synaptics.com:8083/TestRail/get_projects';

const pollRepoPeriod = 2 * 60 * 1000;

const pollStashPeriod = 2 * 1000;

const pollConnectionPeriod = 1 * 1000;

const streamingWidgets = [
  'webds_data_collection_widget',
  'webds_heatmap_widget',
  'webds_integration_duration_widget',
  'webds_touch_widget'
];

const osInfo: OSInfo = {
  current: {
    version: '',
    versionNum: 0
  },
  repo: {
    version: '',
    versionNum: 0,
    tarballUrl: '',
    tarballName: '',
    manifestUrl: '',
    manifestName: '',
    downloaded: false
  }
};

let partNumber: string | undefined;

let cpuInfo: CPUInfo;

let stashInfo: StashInfo;

const connectionInfo: ConnectionInfo = {
  interface: undefined,
  i2cAddr: undefined,
  spiMode: undefined,
  partNumber: undefined
};

let testrailOnline: boolean;

let webdsSettings: WebDSSettings = {
  renderRate: undefined
};

const _findObject = (array: any[], keyValue: any): any => {
  const result = array.filter(function (object) {
    return Object.keys(keyValue).every(function (key) {
      return object[key] == keyValue[key];
    });
  });
  return result[0];
};

const _findEntry = (root: any, path: string[], entry: string): boolean => {
  let array = root.children;
  for (let i = 0; i < path.length; i++) {
    const object = _findObject(array, { name: path[i] });
    if (!object) {
      return false;
    }
    array = object.children;
  }
  return _findObject(array, { name: entry }) !== undefined;
};

export const checkDropbox = async (): Promise<boolean> => {
  try {
    const dropboxDir = await requestAPI<any>(
      'filesystem?dir=' + dropboxcEndpoint
    );
    console.log(dropboxDir);
    if (
      _findEntry(dropboxDir, [], osInfo.repo.tarballName) &&
      _findEntry(dropboxDir, [], osInfo.repo.manifestName)
    ) {
      osInfo.repo.downloaded = true;
    }
    return osInfo.repo.downloaded;
  } catch (error) {
    console.error(
      `Error - GET /webds/filesystem?dir=${dropboxcEndpoint}\n${error}`
    );
    return Promise.reject('Failed to check for presence of tarball in dropbox');
  }
};

export const downloadTarball = async () => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('Content-Type', 'application/x-tgz');

  console.log(`Downloading tarball from ${osInfo.repo.tarballUrl}`);
  let request = new Request(osInfo.repo.tarballUrl, {
    method: 'GET',
    mode: 'cors',
    headers: requestHeaders,
    referrerPolicy: 'no-referrer'
  });
  let response: Response;
  try {
    response = await fetch(request);
  } catch (error) {
    console.error(`Error - GET ${osInfo.repo.tarballUrl}\n${error}`);
    return Promise.reject('Failed to download tarball');
  }
  const tarballBlob = await response.blob();
  const tarballFile = new File([tarballBlob], osInfo.repo.tarballName);
  console.log(tarballFile);

  console.log(`Downloading manifest from ${osInfo.repo.manifestUrl}`);
  request = new Request(osInfo.repo.manifestUrl, {
    method: 'GET',
    mode: 'cors',
    headers: requestHeaders,
    referrerPolicy: 'no-referrer'
  });
  try {
    response = await fetch(request);
  } catch (error) {
    console.error(`Error - GET ${osInfo.repo.manifestUrl}\n${error}`);
    return Promise.reject('Failed to download manifest');
  }
  const manifestBlob = await response.blob();
  const manifestFile = new File([manifestBlob], osInfo.repo.manifestName);
  console.log(manifestFile);

  console.log('Uploading tarball and manifest to dropbox');
  const formData = new FormData();
  formData.append('files', tarballFile);
  formData.append('files', manifestFile);
  formData.append('location', dropboxLocation);
  try {
    await requestAPI<any>('filesystem', {
      body: formData,
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/filesystem\n${error}`);
    return Promise.reject('Failed to upload tarball files to dropbox');
  }
};

const checkRepo = async () => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('Content-Type', 'application/json');

  let request = new Request(repoInfoURL, {
    method: 'GET',
    mode: 'cors',
    headers: requestHeaders,
    referrerPolicy: 'no-referrer'
  });

  let response: Response;
  try {
    response = await fetch(request);
  } catch (error) {
    console.error(`Error - GET ${repoInfoURL}\n${error}`);
    return Promise.reject('Failed to retrieve repo info');
  }

  let version: string;
  let data: any = await response.text();
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
      version = data.latest.version;
    } catch {
      return Promise.reject('Invalid data content in repo info response body');
    }
  } else {
    return Promise.reject('No data content in repo info response body');
  }

  if (version === undefined) {
    return Promise.reject('No valid version in repo info response body');
  }

  const tarballURL = repoTarballURL.concat(
    version,
    osInfo.current.version.endsWith('E')
      ? repoTarballExternalSuffix
      : repoTarballInternalSuffix
  );

  request = new Request(tarballURL, {
    method: 'GET',
    mode: 'cors',
    headers: requestHeaders,
    referrerPolicy: 'no-referrer'
  });

  try {
    response = await fetch(request);
  } catch (error) {
    console.error(`Error - GET ${tarballURL}\n${error}`);
    return Promise.reject('Failed to retrieve tarball listing');
  }

  data = await response.text();
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch {
      return Promise.reject(
        'Invalid data content in tarball listing response body'
      );
    }
    osInfo.repo.version = version;
    osInfo.repo.versionNum = Number(
      version
        .split('.')
        .map((v: string) => v.padStart(2, '0'))
        .join('')
    );
    osInfo.repo.tarballUrl = data.items[0].downloadUrl;
    osInfo.repo.tarballName = data.items[0].path.match(/[^/]*$/)[0];
    osInfo.repo.manifestUrl = data.items[1].downloadUrl;
    osInfo.repo.manifestName = data.items[1].path.match(/[^/]*$/)[0];
  } else {
    return Promise.reject('No data content in tarball repo response body');
  }
};

export const pollRepo = async () => {
  if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
    if (streamingWidgets.includes(focusTracker.currentWidget.id)) {
      setTimeout(pollRepo, pollRepoPeriod);
      return;
    }
  }

  try {
    await checkRepo();
    if (osInfo.repo.versionNum > osInfo.current.versionNum) {
      let e = document.getElementById(
        'webds-launcher-card-DSDK-Update-red-dot'
      );
      if (e) {
        e.style.display = 'block';
      }
      e = document.getElementById(
        'webds-launcher-card-DSDK-Update-fav-red-dot'
      );
      if (e) {
        e.style.display = 'block';
      }
    }
  } catch (error) {
    console.error(error);
  }

  setTimeout(pollRepo, pollRepoPeriod);
};

export const pollStash = async () => {
  if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
    if (streamingWidgets.includes(focusTracker.currentWidget.id)) {
      setTimeout(pollStash, pollStashPeriod);
      return;
    }
  }

  try {
    const data = await requestAPI<any>('data-collection');
    stashInfo.dataAvailable = data.stash.length > 0;
    let e = document.getElementById(
      'webds-launcher-card-Data-Collection-red-dot'
    );
    if (e && testrailOnline) {
      e.style.display = stashInfo.dataAvailable ? 'block' : 'none';
    }
    e = document.getElementById(
      'webds-launcher-card-Data-Collection-fav-red-dot'
    );
    if (e && testrailOnline) {
      e.style.display = stashInfo.dataAvailable ? 'block' : 'none';
    }
  } catch (error) {
    console.error(`Error - GET /webds/data-collection\n${error}`);
  }

  setTimeout(pollStash, pollStashPeriod);
};

const isNotebookActive = async () => {
  try {
    const kernelList = await KernelAPI.listRunning();
    for (let i = 0; i < kernelList.length; i++) {
      const kernel: any = kernelList[i];
      if (kernel.execution_state === 'busy') {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error retrieving kernel information\n${error}`);
    return false;
  }
};

const refreshLauncher = () => {
  const webdsLauncher = getWebDSLauncher() as any;
  if (webdsLauncher) {
    webdsLauncher.update();
  }
  const webdsConfigLauncher = getWebDSConfigLauncher() as any;
  if (webdsConfigLauncher) {
    webdsConfigLauncher.update();
  }
};

export const pollConnection = async () => {
  if (await isNotebookActive()) {
    setTimeout(pollConnection, pollConnectionPeriod);
    return;
  }

  try {
    const pn = await getPartNumber();
    if (pn !== partNumber) {
      partNumber = pn;
      refreshLauncher();
    }
  } catch (error) {
    console.error(error);
    if (partNumber !== undefined) {
      partNumber = undefined;
      refreshLauncher();
    }
    connectionInfo.interface = undefined;
    setTimeout(pollConnection, pollConnectionPeriod);
    return;
  }

  try {
    const data = await requestAPI<any>('settings/connection?query=comm');
    connectionInfo.interface = data.interface;
    connectionInfo.i2cAddr = data.i2cAddr;
    connectionInfo.spiMode = data.spiMode;
    connectionInfo.partNumber = partNumber.split('-')[0];
  } catch (error) {
    console.error(
      `Error - GET /webds/settings/connection?query=comm\n${error}`
    );
    connectionInfo.interface = undefined;
  }

  setTimeout(pollConnection, pollConnectionPeriod);
};

export const updateDSDKInfo = async () => {
  try {
    await requestAPI<any>('general');
  } catch (error) {
    console.error(`Error - GET /webds/general\n${error}`);
  }

  try {
    const data = await requestAPI<any>('about?query=os-info');
    osInfo.current.version = data['VERSION_ID'].replace(/\"/g, '');
    osInfo.current.versionNum = Number(
      osInfo.current.version
        .replace('E', '')
        .split('.')
        .map((v: string) => v.padStart(2, '0'))
        .join('')
    );
  } catch (error) {
    console.error(`Error - GET /webds/about?query=os-info\n${error}`);
  }

  try {
    cpuInfo = await requestAPI<any>('about?query=cpu-info');
  } catch (error) {
    console.error(`Error - GET /webds/about?query=cpu-info\n${error}`);
  }

  try {
    const data = await requestAPI<any>('data-collection');
    stashInfo = { dataAvailable: data.stash.length > 0 };
  } catch (error) {
    console.error(`Error - GET /webds/data-collection\n${error}`);
  }

  try {
    const request = new Request(testrailURL, {
      method: 'GET',
      mode: 'cors',
      headers: new Headers(),
      referrerPolicy: 'no-referrer'
    });
    await fetch(request);
    testrailOnline = true;
  } catch {
    testrailOnline = false;
  }

  return Promise.resolve();
};

export const getWidgetSet = (): Set<string> => {
  if (partNumber === undefined) {
    return new Set(widgetSets.invalid);
  }
  let widgetSet: Set<string> = new Set();
  for (const [keys, value] of Object.entries(widgetSets)) {
    keys.split(',').forEach(key => {
      if (partNumber!.includes(key)) {
        widgetSet = new Set([...widgetSet, ...value]);
      }
    });
  }
  return widgetSet;
};

export const getOSInfo = (): OSInfo => {
  return osInfo;
};

export const getCPUInfo = (): CPUInfo => {
  return cpuInfo;
};

export const getStashInfo = (): StashInfo => {
  return stashInfo;
};

export const getConnectionInfo = (): ConnectionInfo => {
  return connectionInfo;
};

export const isExternal = (): boolean => {
  return osInfo.current.version.endsWith('E');
};

export const isTestRailOnline = (): boolean => {
  return testrailOnline;
};

const updateWebDSSettings = async (setting: string, value: any) => {
  webdsSettings[setting as keyof WebDSSettings] = value;
  if (stateDB) {
    try {
      await stateDB.save(SETTINGS_DB_NAME, webdsSettings as any);
    } catch (error) {
      console.error(error);
    }
  }
};

export const initializeWebDSSettings = async () => {
  if (stateDB) {
    try {
      const settings = await stateDB.fetch(SETTINGS_DB_NAME);
      if (settings !== undefined) {
        webdsSettings = { ...(settings as any) };
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const getRenderRate = (): number | undefined => {
  return webdsSettings.renderRate;
};

export const setRenderRate = async (rate: number) => {
  await updateWebDSSettings('renderRate', rate);
};
