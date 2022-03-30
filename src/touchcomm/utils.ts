import { requestAPI } from '../handler';

const getIdentify = async (): Promise<any> => {
  try {
    return await requestAPI<any>('command?query=identify');
  } catch (error) {
    console.error(`Error - GET /webds/command?query=identify\n${error}`);
    return Promise.reject('Failed to get Identify report');
  }
}

export const getPackratID = async (): Promise<number> => {
  try {
    const identify = await getIdentify();
    console.log('Packrat ID = ' + identify.buildID);
    return identify.buildID;
  } catch (error) {
    console.error(error);
    return Promise.reject('Failed to get Packrat ID');
  }
};

export const getPartNumber = async (): Promise<string> => {
  try {
    const identify = await getIdentify();
    const partNumber = (identify.partNumber.split('-'))[0].toUpperCase();
    console.log(`Part Number = ${partNumber}`);
    return partNumber;
  } catch (error) {
    console.error(error);
    return Promise.reject('Failed to get part number');
  }
};
