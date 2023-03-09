import { apiDownload, apiRequest } from "../axiosv2";
/**
 * 查询所有的证书类型
 * @returns
 */
export const certTypeQuery = async (errorCb?, finCb?) => apiRequest({ url: "/cert/condition/certType", requestType: "get", onError: errorCb, finally: finCb, });

/**
 * 查询证书状态
 * @returns
 */
export const certStatusTypeQuery = async (errorCb?, finCb?) => apiRequest({ url: "/cert/condition/certState", requestType: "get", onError: errorCb, finally: finCb, });

/**
 * 证书申请类型查询
 * @returns
 */
export const certApplyTypeQuery = async (errorCb?, finCb?) => apiRequest({ url: "/cert/condition/applyMode", requestType: "get", onError: errorCb, finally: finCb, });

/**
 * 证书密钥算法类型查询
 * @returns
 */
export const certAlgTypeQuery = async (errorCb?, finCb?) => apiRequest({ url: "/cert/condition/keyAlgorithm", requestType: "get", onError: errorCb, finally: finCb, });

/**
 * 证书详情查询
 * @param data
 * @param finallyCb
 * @returns
 */
export const certInfoQuery = async (data, finallyCb) => apiRequest({ url: "/cert/detail", requestType: "get", data, finally: finallyCb, });

/**
 * 证书注销
 * @param data
 * @param finallyCb
 * @returns
 */
export const certLogout = async (data, finallyCb) => apiRequest({ url: "/cert/cancel", requestType: "get", data, finally: finallyCb, });

/**
 * 证书列表查询
 * @param data
 * @param finallyCb
 * @returns
 */
export const certFetch = async (data, finallyCb) => apiRequest({ url: "/cert/page", data, finally: finallyCb });

/**
 * 证书编辑
 * @param data
 * @param finallyCb
 * @returns
 */
export const certEdit = async (data, finallyCb) => apiRequest({ url: "/cert/offline/edit", data, finally: finallyCb, });

/**
 * 离线证书申请
 * @param data
 * @param finallyCb
 * @returns
 */
export const certApplyOutLine = async (data, finallyCb) => apiRequest({ url: "/cert/offline/add", data, finally: finallyCb, });

/**
 * 在线证书申请
 * @param data
 * @param finallyCb
 * @returns
 */
export const certApplyOnline = async (data, finallyCb) => apiRequest({ url: "/cert/online/add", data, finally: finallyCb, });

/**
 * 证书导入
 * @param data
 * @param finallyCb
 * @returns
 */
export const certImport = async (data, finallyCb) => apiRequest({ url: "/cert/cer/import", data, finally: finallyCb, });

/**
 * 导入PFX证书
 * @param data
 * @param finallyCb
 * @returns
 */
export const pfxImport = async (data, finallyCb) => apiRequest({ url: "/cert/pfx/import", data, finally: finallyCb, });

/**
 * PFX信息查询
 * @param data
 * @param finallyCb
 * @returns
 */
export const pfxInfo = async (data, finallyCb, onError?) => apiRequest({ url: "/cert/pfx/parse", data, finally: finallyCb, onError });


/**
 * 导出P10
 * @param data 
 * @param finallyCb 
 * @returns 
 */
export const exportP10 = async (data, finallyCb) => apiDownload({ url: '/cert/csr/export', requestType: 'get', data, finally: finallyCb })
