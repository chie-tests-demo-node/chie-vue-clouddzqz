<template>
  <div class="baseLayout">
    <div class="baseHeader">
      <div class="logo">
        <img src="../assets/swxa-logo-m.png" />
      </div>
      <div class="headerRight">
        <div>
          <div class="msgInfo">
            <div class="msgTitle">租户标识：</div>
            <div class="msgInfo">{{ id }}</div>
          </div>
          <div class="msgInfo">
            <div class="msgTitle">登录角色：</div>
            <div class="msgInfo">{{ roleName }}</div>
          </div>
          <div v-if="!isNull(quota)" class="alert msgInfo">
            <div class="msgTitle">剩余配额：</div>
            <div class="msgInfo">{{ quota }}</div>
          </div>
          <div v-if="!isNull(outTime)" class="alert msgInfo">
            <div class="msgTitle">盖章到期：</div>
            <div class="msgInfo">{{ outTime }}</div>
          </div>
        </div>
        <div class="loginOut" @click="outLogin">
          <i class="iconfont icon-tuichu"></i>
          <!-- <i class="iconfont icon-logout"></i> -->
        </div>
      </div>
    </div>
    <div class="baseContent">
      <div class="leftMenu">
        <el-menu :default-active="currentPath()">
          <el-menu-item v-for="item in getMenus()" :key="item.path" :index="item.path" @click="toMenu(item.path)">
            {{ item.name }}
          </el-menu-item>
        </el-menu>
      </div>
      <div class="rightContent">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script lang="ts" >
import { Logout } from "@/api/login";
import { queryCurrentUser } from "@/api/userMgr";
import { isNull } from "@/utils";
import { currentUserMenu, loginOut, userAuthGet } from "@/utils/security";
import { ElMessage } from "element-plus";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
import "./BaseLayout.scss";

export default defineComponent({
  setup() {
    const router = useRouter();
    const _ui = userAuthGet();

    const state = reactive({
      outTime: "",
      quota: "",
      id: _ui.tenantId,
      roleName: _ui.roleName,
      roleType: _ui.roleType,
    });

    const funMethods = {
      currentPath: () => {
        return router.currentRoute.value.fullPath;
      },
      getMenus: () => {
        return currentUserMenu();
      },
      toMenu: (path: string) => {
        router.push(path);
      },
      isNull,
    };

    const request = {
      outLogin: async () => {
        // 调登录接口
        await Logout();
        //前端的session移除
        loginOut();

        ElMessage.success("退出成功!");

        setTimeout(() => {
          window.location.href = "/login";
        }, 200);
      },
    };

    onMounted(async () => {
      const userInfo = await queryCurrentUser(() => {
        ElMessage.error("获取当前用户详情失败");
      });
      // debugger;
      state.outTime = userInfo.endTime;
      state.quota = userInfo.QuotaNumber;
    });

    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
    };
  },
});
</script>


