/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "@/api/axiosv2";

// 获取印章管理列表
export const querySealManageList = async (
  data: any,
  finallyFun: any
): Promise<any> =>
  apiRequest({ url: "/seal/get/SealList", data, finally: finallyFun });

// 新增印章
export const addSealManage = async (data: any, finallyFun: any): Promise<any> =>
  apiRequest({ url: "/seal/add/Seal", data, finally: finallyFun });

// 注销印章启用停用印章 0 停用 1启用 2注销
export const exitSealManage = async (data: any): Promise<any> =>
  apiRequest({ url: "/seal/cancel/Seal", data });

// 根据id查询印章详情
export const sealManageDetail = async (data: any): Promise<any> =>
  apiRequest({ url: "/seal/get/SealById", data });

// 修改印章
export const editSealManage = async (
  data: any,
  finallyFun: any
): Promise<any> =>
  apiRequest({ url: "/seal/update/Seal", data, finally: finallyFun });

// 生成测试印章
export const makeSealImg = async (data: any): Promise<any> =>
  apiRequest({ url: "/seal/make/SealBeanImg", data });

// 根据租户id查询证书列表
export const getCertList = async (data: any, finallyFn: any): Promise<any> =>
  apiRequest({ url: "/seal/get/CertList", data, finally: finallyFn });

// 获取印章类型列表
export const getSealOptionList = async (finallyFn): Promise<any> =>
  apiRequest({
    url: "/seal/get/SealNameList",
    requestType: "get",
    finally: finallyFn,
  });
