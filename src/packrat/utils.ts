import downloadBlob, { BlobFile } from './packrat'

import { requestAPI } from '../handler';

import { getPackratID } from '../general/utils';

const _addPackratFile = async (packratID: number|undefined, {startsWith = '', endsWith = '', contains = '', doesNotContain = ''} = {}): Promise<BlobFile> => {
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
    if (!blob) {
      Promise.reject('Downloaded empty blob');
    }
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

  return Promise.resolve(blob!);
};

export const addApplicationHex = async (packratID?: number): Promise<void> => {
  await _addPackratFile(packratID, {doesNotContain: 'boot', endsWith: 'hex'});
  return;
};

export const addApplicationImg = async (packratID?: number): Promise<void> => {
  await _addPackratFile(packratID, {endsWith: 'img'});
  return;
};

export const addPrivateConfig = async (packratID?: number): Promise<any> => {
  const blob = await _addPackratFile(packratID, {startsWith: 'config', contains: 'private', endsWith: 'json'});
  const config = JSON.parse(await blob.content.text());
  return config;
};

export const addPublicConfig = async (packratID?: number): Promise<any> => {
  const blob = await _addPackratFile(packratID, {startsWith: 'config', doesNotContain: 'private', endsWith: 'json'});
  const config = JSON.parse(await blob.content.text());
  return config;
};
