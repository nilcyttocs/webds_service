import { OSInfo } from "../index";

import { requestAPI } from "../handler";

const repoListURL =
  "http://bora:8082/service/rest/v1/search/assets?sort=name&direction=desc&repository=PinormOS";

const osInfo: OSInfo = {
  current: {
    version: ""
  },
  repo: {
    version: "",
    tarball: "",
    manifest: ""
  }
};

const checkRepo = async (osInfo: OSInfo) => {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");

  const request = new Request(repoListURL, {
    method: "GET",
    mode: "cors",
    headers: requestHeaders,
    referrerPolicy: "no-referrer"
  });

  let response: Response;
  try {
    response = await fetch(request);
  } catch (error) {
    console.error(`Error - GET ${repoListURL}\n${error}`);
    return Promise.reject("Failed to retrieve tarball repo listing");
  }

  let data: any = await response.text();
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
      const index = data.items.findIndex((item: any) => {
        return item.path.includes("Internal/tarball");
      });
      const path = data.items[index].path;
      const version = path.match(/pinormos-.+?(?=-)/g)![0].split("-")[1];
      osInfo.repo.version = version;
      osInfo.repo.tarball = data.items[index].downloadUrl;
      osInfo.repo.manifest = data.items[index + 1].downloadUrl;
    } catch {
      return Promise.reject(
        "Invalid data content in tarball repo response body"
      );
    }
  } else {
    console.log("No data content in response body");
    return Promise.reject("No data content in tarball repo response body");
  }
};

export const pollOSInfo = async () => {
  try {
    const data = await requestAPI<any>("about?query=os-info");
    osInfo.current.version = data["VERSION_ID"].replace(/\"/g, "");
  } catch (error) {
    console.error(`Error - GET /webds/about?query=os-info\n${error}`);
  }
  try {
    await checkRepo(osInfo);
  } catch (error) {
    console.error(error);
  }
  setTimeout(pollOSInfo, 1000);
};

export const getOSInfo = (): OSInfo => {
  return osInfo;
};
