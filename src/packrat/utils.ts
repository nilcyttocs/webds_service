import downloadBlob, { BlobFile } from './packrat'

import { requestAPI } from '../handler';

import { getPackratID } from '../general/utils';

const PACKRAT_DIR = '%2Fhome%2Fpi%2Fjupyter%2Fworkspace%2FPackrat';

const _findObject = (array: any[], keyValue: any): any => {
  const result = array.filter(function(object) {
    return Object.keys(keyValue).every(function(key) {
      return object[key] == keyValue[key]
    })
  })
  return result[0];
};

const _findEntry = (root: any, path: string[], entry: string): boolean => {
  let array = root.children;
  for (let i = 0; i < path.length; i++) {
    const object = _findObject(array, {'name': path[i]});
    if (!object) {
      return false;
    }
    array = object.children;
  }
  return _findObject(array, {'name': entry}) !== undefined;
};

const _addPackratFile = async (packratID: number|undefined, fileName: string|undefined, {startsWith = '', endsWith = '', contains = '', doesNotContain = ''} = {}): Promise<void> => {
  const formData = new FormData();

  if (!packratID) {
    packratID = await getPackratID();
    if (!packratID) {
      return Promise.reject('Failed to get Packrat ID');
    }
  }

  fileName || (fileName = 'PR' + packratID + '.' + endsWith);
  console.log(fileName);

  try {
    const packratDir = await requestAPI<any>('filesystem?dir=' + PACKRAT_DIR);
    console.log(packratDir);
    if (_findEntry(packratDir, [packratID!.toString()], fileName)) {
      console.log('Found Packrat/' + packratID + '/' + fileName);
      return Promise.resolve();
    }
    if (_findEntry(packratDir, ['Cache', packratID!.toString()], fileName)) {
      console.log('Found Packrat/Cache/' + packratID + '/' + fileName);
      return Promise.resolve();
    }
  } catch (error) {
    console.error(`Error - GET /webds/filesystem?dir=${PACKRAT_DIR}\n${error}`);
  }

  let blob: BlobFile|undefined;
  try {
    blob = await downloadBlob(packratID, {startsWith, endsWith, contains, doesNotContain});
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

  return Promise.resolve();
};

export const addApplicationHex = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, undefined, {doesNotContain: 'boot', endsWith: 'hex'});
};

export const addApplicationImg = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, undefined, {endsWith: 'img'});
};

export const addPrivateConfig = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, 'config_private.json', {startsWith: 'config', contains: 'private', endsWith: 'json'});
};

export const addPublicConfig = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, 'config.json', {startsWith: 'config', doesNotContain: 'private', endsWith: 'json'});
};
