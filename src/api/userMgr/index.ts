import { apiRequest } from "@/api/axiosv2";
import { isDev } from "@/config";

const getBaseUrl = () => {
  return isDev() ? "" : "";
};

/**
 * 查询用户列表
 * @param data
 * @param finCb
 * @returns
 */
export const userFetch = async (data, finCb) =>
  apiRequest({
    urlPrefix: getBaseUrl(),
    url: "/sysUser/selectUserInfo",
    data,
    finally: finCb,
  });


/**
 * 用户状态变更
 * @param data
 * @param finCb
 * @returns
 */
export const userStatusChange = async (data, finCb) => apiRequest({ url: '/sysUser/updateOrDeleteUserState', data, finally: finCb });


/**
 * 用户新增或者修改
 * @param data
 * @param finCb
 * @returns
 */
export const userEdit = async (data, finCb) => apiRequest({ url: '/sysUser/addOrUpdateCommonUser', data, finally: finCb });


/**
 * 重置密码
 * @param data
 * @param finCb
 * @returns
 */
export const pwdReset = async (data, finCb) => apiRequest({ url: '/sysUser/resetPwd', data, finally: finCb });


/**
 * 查询当前登录用户信息
 * @returns
 */
export const queryCurrentUser = async (errorCb?, finCb?) => apiRequest({ url: '/sysUser/homePageFresh', requestType: 'get', onError: errorCb, finally: finCb });
