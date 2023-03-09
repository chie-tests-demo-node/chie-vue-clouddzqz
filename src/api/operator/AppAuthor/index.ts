/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiDownload, apiRequest } from "@/api/axiosv2";

// 获取应用授权列表(大列表)
export const querySealBigList = async (
  data: any,
  finallyFun: any
): Promise<any> =>
  apiRequest({ url: "/auth/get/AuthList", data, finally: finallyFun });

//新增应用授权(全部)
export const addAppAuthorAllFun = async (
  data: any,
  finalyCb: any
): Promise<any> =>
  apiRequest({ url: "/auth/add/authAll", data, finally: finalyCb });

// 获取区间印章列表(区间)
export const querySealList = async (data: any, finalyCb: any): Promise<any> =>
  apiRequest({ url: "/auth/get/SealType", data, finally: finalyCb });

// 新增应用授权(区间)
export const addAppAuthorOtherFun = async (
  data: any,
  finalyCb: any
): Promise<any> =>
  apiRequest({ url: "/auth/add/auth", data, finally: finalyCb });

// 删除应用授权
export const deleteAppAuthor = async (data: any): Promise<any> =>
  apiRequest({ url: "/auth/del/Auth", data });

// 编辑查询详情
export const queryIdList = async (data: any): Promise<any> =>
  apiRequest({ url: "/auth/get/AuthById", data });

// 修改应用授权
export const editAppAuthor = async (data: any, finalyCb?: any): Promise<any> =>
  apiRequest({ url: "/auth/update/Auth", data, finally: finalyCb });


// 下载应用授权
export const downloadFile = async (data: any, finalyCb?: any): Promise<any> =>
  apiDownload({ url: "/auth/down/FileAuthor", data, finally: finalyCb });