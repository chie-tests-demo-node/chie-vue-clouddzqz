/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../axiosv2";

/**
 * 添加信任域
 * @param data
 * @param finallyCb
 * @returns
 */
export const trustAdd = async (data, finallyCb) =>
  await apiRequest({ url: "/ca/add", data, finally: finallyCb });

/**
 * 查询信任域列表
 * @param data
 * @param finallyCb
 * @returns
 */
export const trustFetch = async (data, finallyCb) =>
  await apiRequest({ url: "/ca/page", data, finally: finallyCb });

/**
 * 信任域信息修改
 * @param data
 * @param finallyCb
 * @returns
 */
export const trustEdit = async (data, finallyCb) =>
  await apiRequest({ url: "/ca/edit", data, finally: finallyCb });

/**
 * 信任域详情
 * @param data
 * @param finallyCb
 * @returns
 */
export const trustInfo = async (data, finallyCb) =>
  await apiRequest({
    url: "/ca/detail",
    data,
    requestType: "get",
    finally: finallyCb,
  });

/**
 * 删除信任域
 * @param data
 * @param finallyCb
 * @returns
 */
export const trustDelete = async (data, finallyCb) =>
  await apiRequest({
    url: "/ca/delete",
    data,
    requestType: "get",
    finally: finallyCb,
  });
