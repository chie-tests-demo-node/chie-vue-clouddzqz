import { apiRequest } from "../axiosv2";



/**
 * 上传根证书
 * @param data
 * @param finallyCb
 * @returns
 */
export const uploadRootCert = async (data, finallyCb) =>
  await apiRequest({ url: "/seal/addCert", dataType: 'form', data, finally: finallyCb });