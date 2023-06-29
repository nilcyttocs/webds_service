import { addStaticConfigUsage } from '../analytics/utils';
import { requestAPI } from '../handler';

export type TouchcommADCReport = [
  string,
  {
    image: number[][];
    hybridx: number[];
    hybridy: number[];
    buttons?: number[];
  }
];

export type TouchcommPositionData = {
  objectIndex: number;
  classification: number;
  xMeas: number;
  yMeas: number;
  z: number;
  xWidth: number;
  yWidth: number;
};

export type TouchcommTouchReport = [
  string,
  {
    buttonState?: any[];
    pos?: TouchcommPositionData[];
  }
];

export type TouchcommTraceReport = { xTrace: number[][]; yTrace: number[][] };

const getIdentify = async (): Promise<any> => {
  const dataToSend: any = {
    command: 'identify'
  };
  try {
    const response = await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    return response;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to get Identify report');
  }
};

export const getPackratID = async (): Promise<number> => {
  try {
    const identify = await getIdentify();
    return identify.buildID;
  } catch (error) {
    console.error(error);
    return Promise.reject('Failed to get Packrat ID');
  }
};

export const getPartNumber = async (): Promise<string> => {
  try {
    const identify = await getIdentify();
    let partNumber = identify.partNumber
      .toUpperCase()
      .replace(/\0/g, '')
      .replace(/ /g, '-');
    const pnParts = partNumber.split(':');
    if (pnParts.length === 2) {
      partNumber = pnParts[0] + '-';
      let utf8 = decodeURI(encodeURIComponent(pnParts[1]));
      for (let i = 0; i < utf8.length; i++) {
        if (i >= 2) {
          break;
        }
        if (i !== 0) {
          partNumber = partNumber + '.';
        }
        partNumber = partNumber + utf8.charCodeAt(i).toString();
      }
    }
    partNumber = partNumber.replace(/([0-9])([A-Z])([A-Z])/g, '$1$2-$3');
    return partNumber;
  } catch (error) {
    console.error(error);
    return Promise.reject('Failed to get part number');
  }
};

export const readDynamicConfig = async (): Promise<any> => {
  const dataToSend = {
    command: 'getDynamicConfig'
  };
  try {
    const config = await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    return config;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to read dynamic config from device');
  }
};

export const writeDynamicConfig = async (entries: any) => {
  let config: any;
  try {
    config = await readDynamicConfig();
  } catch (error) {
    return Promise.reject(error);
  }
  Object.keys(entries).forEach(item => {
    if (!(item in config)) {
      return Promise.reject(`${item} config entry not found in dynamic config`);
    }
  });
  config = { ...config, ...entries };
  const dataToSend = {
    command: 'setDynamicConfig',
    payload: [config]
  };
  try {
    await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to write dynamic config to device');
  }
};

export const readStaticConfig = async (): Promise<any> => {
  const dataToSend = {
    command: 'getStaticConfig'
  };
  try {
    const config = await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
    return config;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to read static config from device');
  }
};

export const writeStaticConfig = async (entries: any, commit: boolean) => {
  let config: any;
  try {
    config = await readStaticConfig();
  } catch (error) {
    return Promise.reject(error);
  }
  Object.keys(entries).forEach(item => {
    if (!(item in config)) {
      return Promise.reject(`${item} config entry not found in static config`);
    }
  });
  config = { ...config, ...entries };
  let dataToSend: any = {
    command: 'setStaticConfig',
    payload: [config]
  };
  try {
    await requestAPI<any>('command', {
      body: JSON.stringify(dataToSend),
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject('Failed to write static config to device');
  }
  if (commit) {
    dataToSend = {
      command: 'commitConfig'
    };
    try {
      await requestAPI<any>('command', {
        body: JSON.stringify(dataToSend),
        method: 'POST'
      });
    } catch (error) {
      console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
      return Promise.reject('Failed to write config to flash');
    }
  }
  Object.keys(entries).forEach(item => {
    addStaticConfigUsage(item, commit ? 'toFlash' : 'toRAM');
  });
};
