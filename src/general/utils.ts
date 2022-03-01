import { requestAPI } from '../handler';

export const getPackratID = async (): Promise<number|undefined> => {
  try {
    const identify = await requestAPI<any>('command?query=identify');
    console.log('Packrat ID = ' + identify.buildID);
    return identify.buildID;
  } catch (error) {
    console.error(`Error - GET /webds/command?query=identify\n${error}`);
    return undefined;
  }
};
