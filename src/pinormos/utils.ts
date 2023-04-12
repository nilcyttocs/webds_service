import { requestAPI } from '../handler';
import { stateDB } from '../index';
import { focusTracker } from '../widgets/utils';

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

export interface WebDSSettings {
  renderRate: number | undefined;
}

const SETTINGS_DB_NAME = '@webds/service:settings';

const dropboxLocation = '/var/spool/syna/softwareupdater';

const dropboxcEndpoint = '%2Fvar%2Fspool%2Fsyna%2Fsoftwareupdater';

const repoListURL =
  'http://nexus.synaptics.com:8081/service/rest/v1/search/assets?repository=PinormOS&sort=name&direction=desc';

const testrailURL = 'http://nexus.synaptics.com:8083/TestRail/get_projects';

const pollRepoPeriod = 2 * 60 * 1000;

const pollStashPeriod = 2 * 1000;

const streamingWidgets = [
  'webds_data_collection',
  'webds_heatmap_widget',
  'webds_integration_duration',
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

let cpuInfo: CPUInfo;

let stashInfo: StashInfo;

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

const checkDropbox = async () => {
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
  } catch (error) {
    console.error(
      `Error - GET /webds/filesystem?dir=${dropboxcEndpoint}\n${error}`
    );
    return Promise.reject('Failed to check for presence of tarball in dropbox');
  }
};

const checkRepo = async () => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('Content-Type', 'application/json');

  const request = new Request(repoListURL, {
    method: 'GET',
    mode: 'cors',
    headers: requestHeaders,
    referrerPolicy: 'no-referrer'
  });

  let response: Response;
  try {
    response = await fetch(request);
  } catch (error) {
    console.error(`Error - GET ${repoListURL}\n${error}`);
    return Promise.reject('Failed to retrieve tarball repo listing');
  }

  let data: any = await response.text();
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch {
      return Promise.reject(
        'Invalid data content in tarball repo response body'
      );
    }
    let index: number;
    if (osInfo.current.version.endsWith('E')) {
      index = data.items.findIndex((item: any) => {
        return item.path.includes('External/tarball');
      });
    } else {
      index = data.items.findIndex((item: any) => {
        return item.path.includes('Internal/tarball');
      });
    }
    if (index === -1) {
      return;
    }
    const path = data.items[index].path;
    const version = path.match(/pinormos-.+?(?=-)/g)![0].split('-')[1];
    osInfo.repo.version = version;
    osInfo.repo.versionNum = Number(version.replace('.', ''));
    osInfo.repo.tarballUrl = data.items[index].downloadUrl;
    osInfo.repo.manifestUrl = data.items[index + 1].downloadUrl;
    osInfo.repo.tarballName = data.items[index].path.match(/[^/]*$/)[0];
    osInfo.repo.manifestName = data.items[index + 1].path.match(/[^/]*$/)[0];
  } else {
    return Promise.reject('No data content in tarball repo response body');
  }
};

const downloadTarball = async () => {
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

export const pollRepo = async () => {
  if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
    if (streamingWidgets.includes(focusTracker.currentWidget.id)) {
      setTimeout(pollRepo, pollRepoPeriod);
      return;
    }
  }

  try {
    await checkRepo();
  } catch (error) {
    console.error(error);
  }

  if (
    osInfo.repo.versionNum > osInfo.current.versionNum &&
    !osInfo.repo.downloaded
  ) {
    try {
      await checkDropbox();
      if (osInfo.repo.downloaded === false) {
        await downloadTarball();
      }
      osInfo.repo.downloaded = true;
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
    } catch (error) {
      console.error(error);
    }
  }

  setTimeout(pollRepo, pollRepoPeriod);
};

export const pollStash = async () => {
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
      osInfo.current.version.replace('.', '').replace('E', '')
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

export const getOSInfo = (): OSInfo => {
  return osInfo;
};

export const getCPUInfo = (): CPUInfo => {
  return cpuInfo;
};

export const getStashInfo = (): StashInfo => {
  return stashInfo;
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
