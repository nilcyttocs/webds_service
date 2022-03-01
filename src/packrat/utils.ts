import downloadBlob, { BlobFile } from './packrat'

import { requestAPI } from '../handler';

import { getPackratID } from '../general/utils';

const _addPackratFile = async (packratID: number|undefined, {startsWith = '', endsWith = '', contains = '', doesNotContain = ''} = {}): Promise<void> => {
  const formData = new FormData();

  if (!packratID) {
    packratID = await getPackratID();
    if (!packratID) {
      Promise.reject('Failed to get Packrat ID');
    }
  }

  let blob: BlobFile|undefined;
  try {
    blob = await downloadBlob(packratID, {startsWith, endsWith, contains, doesNotContain});
    formData.append('blob', blob!.content, blob!.name);
  } catch (error) {
    console.error(error);
    Promise.reject('Failed to download blob from Packrat server');
  }

  try {
    await requestAPI<any>('packrat/' + packratID, {
      body: formData,
      method: 'POST'
    });
  } catch (error) {
    console.error(`Error - POST /webds/packrat/${packratID}\n${error}`);
    Promise.reject('Failed to upload blob to Packrat cache');
  }

  return Promise.resolve();
};

export const addApplicationHex = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, {doesNotContain: 'boot', endsWith: 'hex'});
};

export const addApplicationImg = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, {endsWith: 'img'});
};

export const addPrivateConfig = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, {startsWith: 'config', contains: 'private', endsWith: 'json'});
};

export const addPublicConfig = async (packratID?: number): Promise<void> => {
  return await _addPackratFile(packratID, {startsWith: 'config', doesNotContain: 'private', endsWith: 'json'});
};
