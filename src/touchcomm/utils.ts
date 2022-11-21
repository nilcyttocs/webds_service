import { requestAPI } from "../handler";

import { addStaticConfigUsage } from "../analytics/utils";

export type TouchcommReport = {
  image: number[][];
  hybridx: number[];
  hybridy: number[];
};

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

export type ConfigEntry = {
  name: string;
  value: any;
};

export const readDynamicConfig = async (): Promise<any> => {
  const dataToSend = {
    command: "getDynamicConfig"
  };
  try {
    const config = await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    return config;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to read dynamic config from device");
  }
};

export const writeDynamicConfig = async (entries: ConfigEntry[]) => {
  let config: any;
  try {
    config = await readDynamicConfig();
  } catch (error) {
    return Promise.reject(error);
  }
  entries.forEach((item) => {
    if (item.name in config) {
      config[item.name] = item.value;
    } else {
      return Promise.reject(
        `${item.name} config entry not found in dynamic config`
      );
    }
  });
  let dataToSend = {
    command: "setDynamicConfig",
    payload: [config]
  };
  try {
    await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to write dynamic config to device");
  }
};

export const readStaticConfig = async (): Promise<any> => {
  const dataToSend = {
    command: "getStaticConfig"
  };
  try {
    const config = await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    return config;
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to read static config from device");
  }
};

export const writeStaticConfig = async (
  entries: ConfigEntry[],
  commit: boolean
) => {
  let config: any;
  try {
    config = await readStaticConfig();
  } catch (error) {
    return Promise.reject(error);
  }
  entries.forEach((item) => {
    if (item.name in config) {
      config[item.name] = item.value;
    } else {
      return Promise.reject(
        `${item.name} config entry not found in static config`
      );
    }
  });
  let dataToSend: any = {
    command: "setStaticConfig",
    payload: [config]
  };
  try {
    await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    return Promise.reject("Failed to write static config to device");
  }
  if (commit) {
    dataToSend = {
      command: "commitConfig"
    };
    try {
      await requestAPI<any>("command", {
        body: JSON.stringify(dataToSend),
        method: "POST"
      });
    } catch (error) {
      console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
      return Promise.reject("Failed to write config to flash");
    }
  }
  entries.forEach((item) => {
    addStaticConfigUsage(item.name, commit ? "toFlash" : "toRAM");
  });
};
