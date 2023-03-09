/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../axiosv2";


// 获取登录页面的验证码
export const getVeriCodeFun = async (): Promise<any> =>
  apiRequest({ url: "/sysUser/createCaptcha", requestType: "get" });

// 登录
export const Login = async (data: any): Promise<any> =>
  apiRequest({ url: "/sysUser/login", data });

// 登出
export const Logout = async (): Promise<any> =>
  apiRequest({ url: "/sysUser/logout", requestType: "get" });
