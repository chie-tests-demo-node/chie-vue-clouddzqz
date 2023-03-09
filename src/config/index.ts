const devBaseUrl = "/sign"; //测试环境
const proBaseUrl = "/app"; //正式环境

/**
 * 获取是否是测试环境
 * @returns
 */
export const isDev = () => process.env.NODE_ENV === "development";

/**
 * api请求地址
 * @returns
 */
export const getBaseUrl = () => (isDev() ? devBaseUrl : proBaseUrl);

/**
 * 接口请求超时时间
 * @returns
 */
export const getTimeOut = () => (!isDev() ? 30000 : undefined);

/**
 * 分页大小
 */
export const pageSizes = [10, 20, 50, 100];

/**
 * 默认页码限制
 */
export const dfPageSize = 10;
