import { requestAPI } from "../handler";

import { addApplicationImg } from "../packrat/utils";

import { getPackratID } from "../touchcomm/utils";

import { focusTracker } from "../index";

const saveImageWidgets = [
  "webds_config_editor_widget",
  "webds_gear_selection_widget",
  "webds_sensor_mapping_widget"
];

const toHex = (str: string): string => {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
};

const saveByteArray = (fileName: string, input: any) => {
  let blob = new Blob([input], { type: "application/octet-stream" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  let output = fileName;
  link.download = output;
  link.click();
};

const saveApplicationImage = async () => {
  try {
    await addApplicationImg();
  } catch (error) {
    console.error(error);
    window.alert(
      "Failed to retrieve application image from packrat server. Please check in file browser in left sidebar and ensure availability of base image file in /Packrat/ directory (e.g. /Packrat/1234567/PR1234567.img for PR1234567)."
    );
    return;
  }
  let packratID: number;
  try {
    packratID = await getPackratID();
  } catch (error) {
    console.error(error);
    window.alert("Failed to retrieve packrat ID.");
    return;
  }
  let configID: string;
  const dataToSend: any = {
    command: "getAppInfo"
  };
  try {
    const response = await requestAPI<any>("command", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    configID = toHex(response.customerConfigId);
  } catch (error) {
    console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
    window.alert("Failed to retrieve config ID.");
    return;
  }
  try {
    const response = await requestAPI<any>(
      `packrat/${packratID}/PR${packratID}.img?type=updated`
    );
    const byteArray = new Uint8Array(response.data);
    saveByteArray(`PR${packratID}_${configID}.img`, byteArray.buffer);
  } catch (error) {
    console.error(
      `Error - GET /webds/packrat/${packratID}/PR${packratID}.img?type=updated\n${error}`
    );
    window.alert("Failed to generate new application image.");
  }
};

export const commandSaveImage = {
  label: "Save Image",
  caption: "Save Image",
  isEnabled: () => {
    if (focusTracker.currentWidget && focusTracker.currentWidget.isVisible) {
      return saveImageWidgets.includes(focusTracker.currentWidget.id);
    } else {
      return false;
    }
  },
  execute: (args: any) => {
    saveApplicationImage();
  }
};
