import { isLogin, currentUserMenu } from "@/utils/security";
import { ElMessage } from "element-plus";
import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    meta: { anonymous: true },
    component: () => import("@/views/Login/index.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/layout/BaseLayout.vue"),
    children: [
      { path: "/admin/user", name: "用户管理", component: () => import("@/views/Admin/UserMgr/UserMgr.vue"), },
      { path: "/admin/trust", name: "信任域管理", component: () => import("@/views/Admin/TrustMgr/TrustMgr.vue"), },
      { path: "/admin/cert", name: "证书管理", component: () => import("@/views/Admin/CertMgr/CertMgr.vue"), },
      { path: "/admin", redirect: "/admin/user" },
    ],
  },
  {
    path: "/operator",
    name: "Operator",
    component: () => import("@/layout/BaseLayout.vue"),
    children: [
      { path: "/operator/sealTemplate", name: "印章模板", component: () => import("@/views/Operator/SealTemplate/index.vue"), },
      { path: "/operator/sealManage", name: "印章管理", component: () => import("@/views/Operator/SealManage/index.vue"), },
      { path: "/operator/appAuthor", name: "应用授权", component: () => import("@/views/Operator/AppAuthor/index.vue"), },
      { path: "/operator", redirect: "/operator/sealTemplate" },
    ],
  },
  {
    path: "/audit",
    name: "Audit",
    component: () => import("@/layout/BaseLayout.vue"),
    children: [
      { path: "/audit/bus", name: "业务日志", component: () => import("@/views/Audit/BusLog/BusLog.vue"), },
      { path: "/audit/seal", name: "盖章日志", component: () => import("@/views/Audit/SealLog/SealLog.vue"), },
    ],
  },
  {
    path: "/user",
    name: "User",
    component: () => import("@/layout/BaseLayout.vue"),
    children: [
      { path: "/user/sealWork", name: "印章任务", component: () => import("@/views/User/SealWork/index.vue"), },
    ],
  },
  {
    path: "/cert",
    name: "Cert",
    component: () => import("@/layout/BaseLayout.vue"),
    children: [
      { path: "/cert/certManage", name: "根证书管理", component: () => import("@/views/CertManage/index.vue"), },
    ],
  },
  { path: "/", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || ""),
  routes,
});

router.beforeEach(async (to, from, next) => {

  //无需校验权限的页面
  if (to.meta.anonymous) {
    next();
    return;
  }

  //到底登录了没有
  if (!await isLogin()) {

    ElMessage.error('请先登录!');

    setTimeout(() => {
      window.location.href = '/login';
    }, 200);

    return;
  }

  let targetPath = to.path;
  if (targetPath[targetPath.length - 1] === '/') {
    targetPath = targetPath.substring(0, targetPath.length - 1);
    //能进入到这里证明网址里东西不干净
    window.location.assign(targetPath);
    return;
  }

  //验证菜单权限
  const hasPowerMenus = currentUserMenu();
  if (!hasPowerMenus.find(m => m.path === targetPath)) {
    ElMessage.error('您没有该菜单的权限!');
    next(hasPowerMenus[0].path)
    return;
  }

  //验证通过放行
  next();
});

export default router;
