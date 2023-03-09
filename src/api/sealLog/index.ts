import { apiRequest } from "../axiosv2";

/**
 * 查询调用方式枚举
 * @returns
 */
export const callModeTypeQuery = async (errorCb?) =>
  apiRequest({
    url: "/sealLog/condition/callMode",
    requestType: "get",
    onError: errorCb,
  });

/**
 * 操作结果枚举查询
 * @returns
 */
export const opResultTypeQuery = async (errorCb?) =>
  apiRequest({
    url: "/sealLog/condition/opResult",
    requestType: "get",
    onError: errorCb,
  });

/**
 * 审计状态枚举查询
 * @returns
 */
export const auditStateTypeQuery = async (errorCb?) =>
  apiRequest({
    url: "/sealLog/condition/auditState",
    requestType: "get",
    onError: errorCb,
  });

/**
 * 印章日志查询
 * @param data
 * @param finallyCb
 * @returns
 */
export const sealLogFetch = async (data, finallyCb) =>
  apiRequest({ url: "/sealLog/page", data, finally: finallyCb });

/**
 * 审计盖章日志
 * @param data
 * @param finallyCb
 * @returns
 */
export const auditSealLog = async (data, finallyCb) =>
  apiRequest({ url: "/sealLog/validation", data, finally: finallyCb });
