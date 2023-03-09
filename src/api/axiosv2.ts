/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { loginOut, userAuthGet } from './../utils/security';
import { getBaseUrl, getTimeOut } from "../config";
import { assemblyGetParams, isNull } from "@/utils";
import type { AxiosResponse } from "axios";
import axios from "axios";
import qs from "qs";
import { ElMessage } from "element-plus";

/**
 * axios访问实例
 */
export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: getTimeOut(),
});

/**
 * http请求参数
 */
export interface IHttpRequestParams {
  urlPrefix?: string;
  /**
   * 请求地址
   */
  url: string;
  /**
   * 请求数据 如需上传文件，此处应为FormData
   */
  data?: any;
  /**
   * 请求方式 默认为post
   */
  requestType?: "post" | "get";
  /**
   * 数据类型 默认为json
   */
  dataType?: "form" | "json";
  /**
   * 请求异常回调
   * @param msg
   * @returns
   */
  onError?: (msg: string) => void;
  /**
   * 请求完毕回调
   * @returns
   */
  finally?: () => void;
  /**
   * 请求错误是否提示错误信息 默认为提示
   */
  tipError?: boolean;
  /**
   * 下载文件名
   */
  fileName?: string;
}

/**
 * 给请求参数赋予默认值
 * @param params
 */
const initHttpRequestParams = (params: IHttpRequestParams) => {
  if (isNull(params.requestType)) {
    params.requestType = "post";
  }
  if (isNull(params.dataType)) {
    params.dataType = "json";
  }
  if (isNull(params.tipError)) {
    params.tipError = true;
  }
};

/**
 * 生成请求头
 * @param params
 * @returns
 */
const initHttpRequestHeader = (params: IHttpRequestParams): any => {
  var header: any = {};

  if (params.requestType === "post") {
    header["Content-Type"] =
      params.dataType === "json"
        ? "application/json"
        : "application/x-www-form-urlencoded";
  }
  //如果需要添加token 请在这里填写
  var userInfo = userAuthGet();
  if (userInfo?.authentication) {
    header["authentication"] = userInfo.authentication;
  }

  return header;
};

/**
 * 当请求错误时，提示错误
 */
const tipError = (
  isTip: boolean,
  msg: string,
  callback?: (msg: string) => void
) => {
  callback?.(msg);

  if (!isTip) {
    return;
  }

  //在这里书写提示错误相关代码，如Modal.Error
  ElMessage.error(msg);
};

/**
 * 通用Http请求
 * @param params
 * @returns
 */
export const apiRequest = async (params: IHttpRequestParams) => {
  if (isNull(params)) {
    return Promise.reject("请传入请求参数");
  }

  initHttpRequestParams(params);

  var headers = initHttpRequestHeader(params);

  var url = params.url;
  if (params.urlPrefix) {
    url = `${params.urlPrefix}${url}`;
  }

  try {
    var reponse: AxiosResponse<any>;
    if (params.requestType === "post") {
      reponse = await axiosInstance.post(
        url,
        params.dataType === "json" ? params.data : params.data,
        { headers }
      );
    } else {
      reponse = await axiosInstance.get(
        `${url}${assemblyGetParams(params.data)}`,
        { headers }
      );
    }

    //登出无响应不处理
    if (params.url === "/sysUser/logout") {
      return Promise.resolve();
    }

    const { code, data, message } = reponse?.data || {};
    if (code !== 200) {
      //登录失效
      if (code === 582) {
        tipError(true, "登录失效,请重新登录");
        loginOut();
        setTimeout(() => {
          window.location.href = "/login";
        }, 200);
        return Promise.reject("登录失效,请重新登录");
      }

      //其他错误
      tipError(params.tipError!, message, params.onError);
      return Promise.reject(message);
    }

    return Promise.resolve(data);
  } catch (error) {
    tipError(params.tipError!, error.message, params.onError);
    return Promise.reject(error);
  } finally {
    params.finally?.();
  }
};

/**
 * http下载文件 根据具体需求再修改
 * @param params
 */
export const apiDownload = async (params: IHttpRequestParams) => {
  initHttpRequestParams(params);

  var headers = initHttpRequestHeader(params);

  var url = params.url;

  try {
    var reponse: AxiosResponse<any>;
    if (params.requestType === "post") {
      reponse = await axiosInstance.post(
        url,
        params.dataType === "json" ? params.data : qs.stringify(params.data),
        { headers, responseType: "blob" }
      );
    } else {
      reponse = await axiosInstance.get(
        `${url}${assemblyGetParams(params.data)}`,
        { headers, responseType: "blob" }
      );
    }

    const { status, data } = reponse || {};
    if (status !== 200) {
      if (status === 582) {
        tipError(true, "登录失效,请重新登录");
        loginOut();
        setTimeout(() => {
          window.location.href = "/login";
        }, 200);
        return Promise.reject("登录失效,请重新登录");
      }
      return Promise.reject("下载失败");
    }

    let fileUrl = window.URL.createObjectURL(data);
    let link = document.createElement("a");
    link.href = fileUrl;
    link.download = decodeURIComponent(
      reponse.headers["content-disposition"]?.split("filename=")[1]
    );
    link.click();

    return Promise.resolve();
  } catch (error) {
    tipError(params.tipError!, error.message, params.onError);
    return Promise.reject(error);
  } finally {
    params.finally?.();
  }
};

//拿到文件流
export const apiDownloadFile = async (params: IHttpRequestParams) => {
  try {
    const rsp = await axiosInstance.request({
      url: params.url,
      method: "get",
      responseType: "blob",
      params: params.data,
      headers: {
        authentication: userAuthGet().authentication,
      },
    });
    if (rsp.status != 200) {
      tipError(
        params.tipError!,
        `error http code ${rsp.status}`,
        params.onError
      );
      return Promise.reject(`error http code ${rsp.status}`);
    }
    return Promise.resolve(rsp.data);
  } catch (error) {
    tipError(params.tipError!, error.message, params.onError);
    return Promise.reject(error);
  } finally {
    params.finally?.();
  }
};
