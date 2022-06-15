import { requestAPI } from "../handler";

import { addApplicationImg } from "../packrat/utils";

import { getPackratID } from "../touchcomm/utils";

import { focusTracker } from "../index";

const saveImageWidgets = [
  "webds_config_editor_widget",
  "webds_gear_selection_widget"
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
}

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
  const dataToSend: any = {
    packrat_id: "" + packratID
  };
  let configID: string;
  try {
    const response = await requestAPI<any>("command?query=app-info");
    configID = toHex(response.customerConfigId);
  } catch (error) {
    console.error(`Error - GET /webds/command?query=app-info\n${error}`);
    window.alert("Failed to retrieve config ID.");
    return;
  }
  try {
    const response = await requestAPI<any>("image", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    const byteArray = new Uint8Array(response.data);
    saveByteArray(`PR${packratID}_${configID}.img`, byteArray.buffer);
  } catch (error) {
    console.error(`Error - POST /webds/image\n${error}`);
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
