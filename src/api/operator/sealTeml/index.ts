/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "@/api/axiosv2";

// 获取印章模板列表
export const querySealTemlList = async (data: any, finallyFun: any): Promise<any> => apiRequest({ url: "/seal/get/sealTemplateList", data, finally: finallyFun });

// 新增印章模板列表
export const addSealTeml = async (data: any, finallyFun: any): Promise<any> => apiRequest({ url: "/seal/add/SealTemplate", data, finally: finallyFun });

// 删除印章模板
export const deleteSealTeml = async (data: any): Promise<any> => apiRequest({ url: "/seal/del/SealTemplate", data });

// 编辑时查详情回显
export const sealTemlDetail = async (data: any): Promise<any> => apiRequest({ url: "/seal/get/SealTemplateById", data });

// 修改印章模板
export const editSealTeml = async (data: any, finallyFun: any): Promise<any> => apiRequest({ url: "/seal/update/SealTemplate", data, finally: finallyFun });
