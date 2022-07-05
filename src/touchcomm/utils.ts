import { requestAPI } from "../handler";

const getIdentify = async (): Promise<any> => {
  const dataToSend: any = {
    command: "identify"
  };
  try {
    const response = await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    return response;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to get Identify report");
  }
};

export const getPackratID = async (): Promise<number> => {
  try {
    const identify = await getIdentify();
    console.log("Packrat ID = " + identify.buildID);
    return identify.buildID;
  } catch (error) {
    console.error(error);
    return Promise.reject("Failed to get Packrat ID");
  }
};

export const getPartNumber = async (): Promise<string> => {
  try {
    const identify = await getIdentify();
    const partNumber = identify.partNumber.toUpperCase().replace(/\0/g, "");
    console.log(`Part Number = ${partNumber}`);
    return partNumber;
  } catch (error) {
    console.error(error);
    return Promise.reject("Failed to get part number");
  }
};
