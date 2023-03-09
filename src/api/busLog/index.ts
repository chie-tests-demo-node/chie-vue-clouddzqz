import { apiRequest } from "../axiosv2";
/**
 * 印章日志相关枚举查询
 * 1-角色类型 2-操作菜单 3-操作类型 4-操作结果
 * @param type
 * @param finCb
 * @returns
 */
export const sealLogEnumQuery = async (type, errorCb) =>
  await apiRequest({
    url: "/operationLog/selectInfoByType",
    data: { type },
    requestType: "get",
    onError: errorCb,
  });

/*
 *
 * 印章列表查询
 * @param data
 * @param finCb
 * @returns
 */
export const sealLogFetch = async (data, finCb) =>
  await apiRequest({ url: "/operationLog/selectLog", data, finally: finCb });

/**
 * 印章日志审计
 * @param data
 * @param finCb
 * @returns
 */
export const sealLogAudit = async (data, finCb) =>
  await apiRequest({
    url: "/operationLog/validateOperationLog",
    data,
    finally: finCb,
  });
