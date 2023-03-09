/* eslint-disable @typescript-eslint/ban-types */
// export const FileUrl = "/api/server/importCert";
import { isPro } from "@/utils/env";
import { ElNotification } from "element-plus";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  ResponseErrorInterceptors,
  ResponseInterceptors,
  RuquestInterceptors,
  OCSPBaseURL,
} from "@/api/axios";
export const FileUrl = isPro()
  ? process.env.VUE_APP_BYZK_URL + "/server/importCert"
  : "/kexin/server/importCert";

export function UploadToBase64(file) {
  //文件转base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader);
    };
    reader.onerror = reject;
  });
}
//文件下载
//文件下载
interface AxiosHooks {
  onSetFileName?: (str: string) => string;
}
export const downloadByBlob = (blob: Blob, fileName: string) => {
  const b = new Blob([blob]);
  let link = document.createElement("a");
  const href = URL.createObjectURL(b);
  link.href = href;
  link.download = fileName;
  link.click();
  link = null;
  window.URL.revokeObjectURL(href);
};
export const getDownloadFileApi = (config: AxiosRequestConfig) => {
  const server = ResponseErrorInterceptors(
    RuquestInterceptors(
      axios.create({
        baseURL: OCSPBaseURL,
      })
    )
  );
  config.responseType = "blob";
  return server(config).then((res) => {
    return res;
  });
};
export const downloadFileByStreamCon = (
  config: AxiosRequestConfig & AxiosHooks
) => {
  return getDownloadFileApi(config).then((res) => {
    let fileName = res.headers["content-disposition"]?.split("fileName=")[1];
    if (fileName === undefined || fileName === null || fileName === "") {
      fileName = res.headers["content-disposition"]?.split("filename=")[1];
    }
    if (config.onSetFileName) {
      fileName = config.onSetFileName(fileName);
    }
    return downloadByBlob(res.data, decodeURIComponent(fileName));
  });
};

export const downloadFileByPostStream = (
  url: string,
  data?: Object,
  config?: AxiosRequestConfig & AxiosHooks
) => {
  return downloadFileByStreamCon({
    url: url,
    method: "POST",
    data,
    ...config,
  });
};
export const url = `${window.location.protocol}//${window.location.hostname}:${
  window.location.port ? window.location.port : "80"
}/app`;
import { userAuthGet } from "./security";
export const fileDown = (fileUrl: any, data: any, fileName?: any) => {
  const url = `${window.location.protocol}//${window.location.hostname}:${
    //生产环境动态获取url
    window.location.port ? window.location.port : "80"
  }/app`;
  const userInfo: any = userAuthGet();
  axios({
    method: "get",
    url: `${isPro() ? url : "/sign"}${fileUrl}`,
    params: data,
    responseType: "blob",
    headers: {
      authentication: userInfo.authentication,
    },
  }).then(async (res: any) => {
    if (!res.data) {
      return;
    }
    if (res.data.type === "application/json") {
      const text = await res.data.text();
      const jsonText = await JSON.parse(text);
      if (jsonText.code === 1000) {
        ElNotification({
          title: "提示",
          dangerouslyUseHTMLString: true,
          message: jsonText.message,
          type: "success",
        });
      } else {
        ElNotification({
          title: "提示",
          dangerouslyUseHTMLString: true,
          message: jsonText.message,
          type: "error",
        });
      }
      return;
    }
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    const name = res.headers["filesffix"];
    if (name) {
      fileName = fileName + "." + name;
    }
    if (!fileName) {
      fileName = decodeURIComponent(
        res.headers["content-disposition"].split("fileName=")[1]
      );
    }
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    ElNotification({
      title: "提示",
      dangerouslyUseHTMLString: true,
      message: "下载成功",
      type: "success",
    });
  });
};
