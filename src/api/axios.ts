import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ElMessageBox, ElNotification } from "element-plus";
import { isPro } from "@/utils/env";
import router from "@/router/index";
let showMsg: any = true;
// 设置请求拦截器
export function RuquestInterceptors(service: AxiosInstance): AxiosInstance {
  service.interceptors.request.use(
    (config: any) => {
      config.headers["token"] = sessionStorage.getItem("token") || "";
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  return service;
}
//设置请求成功拦截器
export function ResponseInterceptors(service: AxiosInstance): AxiosInstance {
  service.interceptors.response.use((response) => {
    if (response.status === 200 || response.status === 201) {
      //省去判断res===0
      if (response.data.code === "0") {
        return Promise.resolve(response.data);
      } else {
        if (response.data.code === 401) {
          if (showMsg) {
            showMsg = false;
            ElMessageBox.confirm(
              response.data.message ||
                response.data.msg ||
                "登录已过期,请重新登录",
              "提示",
              {
                confirmButtonText: "确定",
                showCancelButton: false,
                showClose: false,
                type: "warning",
              }
            ).then(() => {
              setTimeout(() => {
                showMsg = true;
              }, 3000);
              router.push("/login");
            });
          }
          return Promise.reject(response);
        } else {
          ElNotification({
            title: "提示",
            dangerouslyUseHTMLString: true,
            message: response.data.msg || response.data.message,
            type: "error",
          });
          return Promise.reject(response.data);
        }
      }
    } else {
      ElNotification({
        title: "提示",
        dangerouslyUseHTMLString: true,
        message: response.data.msg || response.data.message,
        type: "error",
      });
      return Promise.reject(response);
    }
  });
  return service;
}
//设置请求失败的拦截器
export function ResponseErrorInterceptors(
  service: AxiosInstance
): AxiosInstance {
  service.interceptors.response.use(
    (response) => response,
    (error) => {
      const { status } = error.response;
      const { data } = error.response;
      if (status) {
        switch (status) {
          case 401:
            if (router.currentRoute.value.path != "/login") {
              router.replace("/login");
            }
            break;
          case 500:
            ElNotification({
              title: "提示",
              dangerouslyUseHTMLString: true,
              message: "服务器错误",
              type: "error",
              duration: 0,
            });
            break;
          default:
            ElNotification({
              title: "提示",
              dangerouslyUseHTMLString: true,
              message: data.msg,
              type: "error",
              duration: 0,
            });
        }
        return Promise.reject(error.response);
      }
    }
  );
  return service;
}

// 设置拦截器
export function userInterceptors(service: AxiosInstance): AxiosInstance {
  ResponseInterceptors(ResponseErrorInterceptors(RuquestInterceptors(service)));
  return service;
}

const url = `${window.location.protocol}//${window.location.hostname}:${
  window.location.port ? window.location.port : "80"
}`;

// const url = window.location.host;
export const OCSPBaseURL = isPro() ? url : "";
//后端服务
export const ClaService: AxiosInstance = userInterceptors(
  axios.create({
    baseURL: OCSPBaseURL,
    timeout: 15000,
  })
);
