/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../axiosv2";

// 文件转换
export const FileChange = async (data, onError): Promise<any> =>
  apiRequest({
    url: "/task/fileConversion",
    requestType: "post",
    dataType: "form",
    data,
    onError,
  });

// 印章列表
export const SeakList = async (data): Promise<any> =>
  apiRequest({ url: "/task/getSealList", requestType: "get", data });

// 下载临时文件
export const DownFile = async (data): Promise<any> =>
  apiRequest({
    url: "/file/downloadTempFile",
    requestType: "get",
    data,
  });
//添加任务
export const AddWork = async (data, err): Promise<any> =>
  apiRequest({
    url: "/task/signSeal",
    requestType: "post",
    data,
    onError: err,
  });

// 标签列表
// export const editTag = async (data: any): Promise<any> =>
//   apiRequest({ url: "/tags/update", data });

// 任务列表
export const WorkList = async (data): Promise<any> =>
  apiRequest({
    url: "/task/getTaskList",
    requestType: "get",
    data,
  });
//下载任务完成文件
export const DownSuccess = async (data): Promise<any> =>
  apiRequest({
    url: "/task/downloadTaskFile",
    requestType: "get",
    data,
  });
