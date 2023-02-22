import { requestAPI } from '../handler';
import { getPackratID } from '../touchcomm/utils';
import downloadBlob, { BlobFile } from './packrat';

const PACKRAT_DIR = '%2Fhome%2Fdsdkuser%2Fjupyter%2Fworkspace%2FPackrat';

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

const _addPackratFile = async (
  packratID: number | undefined,
  fileName: string | undefined,
  { startsWith = '', endsWith = '', contains = '', doesNotContain = '' } = {}
): Promise<string> => {
  const formData = new FormData();

  if (!packratID) {
    packratID = await getPackratID();
    if (!packratID) {
      return Promise.reject('Failed to get Packrat ID');
    }
  }

  if ((startsWith === 'sb' || startsWith === 'fw') && endsWith === 'ihex.hex') {
    fileName || (fileName = 'PR' + packratID + '.' + 'sb' + '.' + endsWith);
  } else {
    fileName || (fileName = 'PR' + packratID + '.' + endsWith);
  }
  console.log(fileName);

  try {
    const packratDir = await requestAPI<any>('filesystem?dir=' + PACKRAT_DIR);
    console.log(packratDir);
    if (_findEntry(packratDir, [packratID!.toString()], fileName)) {
      console.log('Found Packrat/' + packratID + '/' + fileName);
      return Promise.resolve('Packrat/' + packratID + '/' + fileName);
    }
    if (_findEntry(packratDir, ['Cache', packratID!.toString()], fileName)) {
      console.log('Found Packrat/Cache/' + packratID + '/' + fileName);
      return Promise.resolve('Packrat/Cache/' + packratID + '/' + fileName);
    }
  } catch (error) {
    console.error(`Error - GET /webds/filesystem?dir=${PACKRAT_DIR}\n${error}`);
  }

  let blob: BlobFile | undefined;
  try {
    blob = await downloadBlob(
      packratID,
      {
        startsWith,
        endsWith,
        contains,
        doesNotContain
      },
      false
    );
    if (!blob) {
      return Promise.reject('Downloaded empty blob');
    }
    formData.append('blob', blob!.content, fileName);
  } catch (error) {
    console.error(error);
    return Promise.reject('Failed to download blob from Packrat server');
  }

  try {
    await requestAPI<any>('packrat/' + packratID, {
      body: formData,
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/packrat/${packratID}\n${error}`);
    return Promise.reject('Failed to upload blob to Packrat cache');
  }
  return Promise.resolve('Packrat/Cache/' + packratID + '/' + fileName);
};

export const addApplicationHex = (packratID?: number): Promise<string> => {
  return _addPackratFile(packratID, undefined, {
    doesNotContain: 'boot',
    endsWith: 'hex'
  });
};

export const addApplicationIHex = async (
  packratID?: number
): Promise<string> => {
  try {
    const smartBridge = await _addPackratFile(packratID, undefined, {
      startsWith: 'sb',
      endsWith: 'ihex.hex'
    });
    return smartBridge;
  } catch {}

  try {
    const smartBridge = await _addPackratFile(packratID, undefined, {
      startsWith: 'fw',
      endsWith: 'ihex.hex'
    });
    return smartBridge;
  } catch {}

  try {
    const multi = await _addPackratFile(packratID, undefined, {
      startsWith: 's',
      endsWith: 'ihex.hex'
    });
    return multi;
  } catch {}

  return _addPackratFile(packratID, undefined, {
    startsWith: 'td',
    endsWith: 'ihex.hex'
  });
};

export const addApplicationImg = (packratID?: number): Promise<string> => {
  return _addPackratFile(packratID, undefined, { endsWith: 'img' });
};

export const addPrivateConfig = (packratID?: number): Promise<string> => {
  return _addPackratFile(packratID, 'config_private.json', {
    startsWith: 'config',
    contains: 'private',
    endsWith: 'json'
  });
};

export const addPublicConfig = (packratID?: number): Promise<string> => {
  return _addPackratFile(packratID, 'config.json', {
    startsWith: 'config',
    doesNotContain: 'private',
    endsWith: 'json'
  });
};

export const addPackratFiles = (
  files: string[],
  packratID?: number
): Promise<any[]> => {
  const addedFiles: any[] = [];
  files.map(file => {
    try {
      switch (file) {
        case 'hex':
          addedFiles.push(addApplicationHex(packratID));
          break;
        case 'ihex':
          addedFiles.push(addApplicationIHex(packratID));
          break;
        case 'img':
          addedFiles.push(addApplicationImg(packratID));
          break;
        case 'config_private':
          addedFiles.push(addPrivateConfig(packratID));
          break;
        case 'config_public':
          addedFiles.push(addPublicConfig(packratID));
          break;
        default:
          addedFiles.push('invalid');
          break;
      }
    } catch (error) {
      console.error(error);
    }
  });
  return Promise.all(addedFiles);
};

const _getPackratFile = async (
  packratID: number | undefined,
  { startsWith = '', endsWith = '', contains = '', doesNotContain = '' } = {}
): Promise<string> => {
  if (!packratID) {
    packratID = await getPackratID();
    if (!packratID) {
      return Promise.reject('Failed to get Packrat ID');
    }
  }

  let blobAsString: string | undefined;
  try {
    blobAsString = await downloadBlob(
      packratID,
      {
        startsWith,
        endsWith,
        contains,
        doesNotContain
      },
      true
    );
    if (!blobAsString) {
      return Promise.reject('Downloaded empty blob');
    }
    return Promise.resolve(blobAsString);
  } catch (error) {
    console.error(error);
    return Promise.reject('Failed to download blob from Packrat server');
  }
};

export const getCfgFile = (packratID?: number): Promise<string> => {
  return _getPackratFile(packratID, {
    doesNotContain: 'full',
    endsWith: 'cfg'
  });
};
