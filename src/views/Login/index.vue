<template>
  <div class="login">
    <div class="login-small">
      <div class="title">密码服务平台CCSP (租户管理端)</div>
      <img class="img-style" src="../../assets/login/swxa-logo-m.png" />
      <div class="form-login">
        <div
          style="
            margin-left: 74px;
            margin-top: 30px;
            font-weight: bold;
            font-size: 30px;
          "
        >
          口令登录
        </div>
        <el-form
          :model="form"
          label-width="120px"
          :rules="rules"
          ref="formRef"
          hide-required-asterisk
        >
          <el-form-item prop="tenantId">
            <template #label>
              <el-icon size="20">
                <i class="iconfont icon-yonghu"></i>
              </el-icon>
            </template>
            <el-input
              v-model="form.tenantId"
              placeholder="租户标识"
              clearable
            />
          </el-form-item>
          <el-form-item prop="username">
            <template #label>
              <el-icon size="20">
                <i class="iconfont icon-yonghu"></i>
              </el-icon>
            </template>
            <el-input v-model="form.username" placeholder="账号" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <template #label>
              <el-icon size="20">
                <i class="iconfont icon-lock-full"></i>
              </el-icon>
            </template>
            <el-input show-password type="password" v-model="form.password" placeholder="密码" clearable
              @keyup.enter="login(formRef)" />
          </el-form-item>
          <el-form-item prop="verityCode">
            <template #label>
              <el-icon size="20">
                <i class="iconfont icon-mianxing-dunpai"></i>
              </el-icon>
            </template>
            <el-input type="text" v-model="form.verityCode" placeholder="验证码" style="width: 130px" clearable
              @keyup.enter="login(formRef)" />
            <div class="input-vercode" @click="getCode">
              <div v-if="!imgUrl"></div>
              <el-image
                style="width: 80px; height: 30px"
                v-else
                :src="imgUrl"
              />
            </div>
          </el-form-item>
        </el-form>
        <el-button class="login-button" type="primary" @click="login(formRef)"
          >登录</el-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, toRefs, onMounted } from "vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router";
import { getVeriCodeFun, Login } from "@/api/login/index";
import { currentUserMenu, userAuthSet } from "@/utils/security";
import { addPNGBase64Prefix } from "@/utils";
import regex from "@/utils/regulars";
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Home",
  setup() {
    const router = useRouter();
    const formRef = ref<FormInstance>();
    const state = reactive({
      imgUrl: "",
      codeKey: "",
      form: {
        tenantId: "",
        username: "",
        password: "",
        verityCode: "",
        codeKey: "",
      },
    });

    const rules = reactive<FormRules>({
      tenantId: [{ required: true, message: "请输入租户标识" }],
      username: [{ required: true, message: "请输入账号" }],
      password: [
        { required: true, message: "请输入密码" },
        // { min: 6, message: "密码长度不能低于6位" },
        // { pattern: regex.noCn, message: "密码不能包含中文" },
      ],
      verityCode: [{ required: true, message: "请输入验证码" }],
    });

    const funMethods = {
      async getCode() {
        // TODO 调获取验证码的接口
        const verCodeData = await getVeriCodeFun();
        state.form.codeKey = verCodeData.codeKey;
        state.imgUrl = addPNGBase64Prefix(verCodeData.imageInfo);
      },

      async login(formEl: FormInstance | undefined) {
        await formEl?.validate(async (valid, fields) => {
          if (valid) {
            // 调登录的接口
            const loginData = await Login(state.form);

            //登录成功设置auth信息
            userAuthSet(loginData);

            //提示登陆成功
            ElMessage.success("登录成功");

            //跳转到对应首页
            // router.push(currentUserMenu()[0].path);
            setTimeout(() => {
              window.location.href = currentUserMenu()[0].path;
            }, 200);
          }
        });
      },
    };

    onMounted(() => {
      funMethods.getCode();
    });
    return { formRef, rules, ...toRefs(state), ...funMethods };
  },
};
</script>



<style lang="scss" scoped>
.el-form-item__label:before {
  content: "-";
  color: var(--el-color-danger);
  margin-right: 4px;
}

.login {
  display: flex;
  /* min-width: 100%; */
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-size: 100% 100%;
  background-image: url("../../assets/login/login-bg.png");

  .el-form-item {
    display: flex;
    --font-size: 14px;
    margin-bottom: 18px;
    align-items: baseline;
  }

  .login-small {
    height: 800px;
    min-height: 800px;
    max-height: 800px;
    overflow-y: hidden;
    width: 1100px;
    min-width: 1100px;
    max-width: 1100px;
    background-size: 100% 100%;
    background-image: url("../../assets/login/login-bg-s.png");
    position: relative;
  }

  .title {
    color: #fff;
    margin-top: 60px;
    text-align: center;
    font-size: 30px;
    font-weight: bold;
  }

  .img-style {
    margin-left: 240px;
    margin-top: 88px;
  }

  .form-login {
    height: 32px;
    position: absolute;
    right: 18%;
    top: 160px;
    text-align: center;
  }

  .login-button {
    height: 45px;
    width: 275px;
    margin-top: 42px;
    margin-left: 94px;
    background-color: #0f72ef;
    border-radius: 6px;
    opacity: 1;
  }

  .el-form {
    margin-top: 60px;
  }

  .el-form-item__label {
    padding-top: 5px;
  }

  .el-input__wrapper {
    width: 246px;
  }

  .input-vercode {
    height: 30px;
    width: 130px;
    margin-left: 6px;
    border: 1px solid #00cc99;
    background-color: #808080;
    border-radius: 4px;
    color: #fff;

    &:hover {
      cursor: default;
    }

    .el-input__wrapper {
      background-color: #d7d7d7;
    }
  }
}
</style>
