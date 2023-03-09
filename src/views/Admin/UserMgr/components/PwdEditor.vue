<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    title="重置密码"
    width="430px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="hide"
  >
    <div v-loading="pageLoading">
      <el-form
        :model="formVal"
        label-width="110px"
        :rules="formRules"
        ref="formRef"
        @validate="onValidate"
      >
        <el-form-item label="密码" prop="password">
          <el-input show-password v-model="formVal.password" maxlength="32">
            <template #suffix>
              <div v-if="pwdAllReady">
                <div v-if="pwdHitRule === 2" style="color: rgb(215, 82, 82)">
                  弱
                </div>
                <div v-else-if="pwdHitRule === 3" style="color: orange">中</div>
                <div v-else class="green" style="color: rgb(21, 209, 34)">
                  强
                </div>
              </div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            show-password
            v-model="formVal.confirmPassword"
            maxlength="32"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="hide" :disabled="pageLoading">取消</el-button>
        <el-button type="primary" @click="finish" :disabled="pageLoading"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs } from "vue";
import { ElMessage, FormRules } from "element-plus/es";
import regex from "@/utils/regulars";
import { pwdReset } from "@/api/userMgr";
export default defineComponent({
  props: [],
  emits: ["onCompleted"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      pageLoading: false,
      formVal: {
        password: "",
        confirmPassword: "",
      },
      info: {},
      formRef: null,
      pwdAllReady: false,
      pwdHitRule: 2,
    });
    const formRules: FormRules = {
      password: [
        { required: true, message: "请输入密码" },
        { pattern: regex.noBlankSpace, message: "密码中不能包含空格" },
        { pattern: regex.noCn, message: "密码不能包含中文" },
        { min: 8, message: "密码长度不能低于8位" },
        { max: 32, message: "密码长度不能超过32位" },
        {
          validator: (rule: any, value: any, callback: any) => {
            var hitCount = 0;
            var numberReg = /\d+/;
            if (numberReg.test(value)) {
              hitCount++;
            }
            var dZm = /[A-Z]+/;
            if (dZm.test(value)) {
              hitCount++;
            }
            var xZM = /[a-z]+/;
            if (xZM.test(value)) {
              hitCount++;
            }
            var spFH = /^[a-zA-Z0-9_]{0,}$/;
            if (!spFH.test(value)) {
              hitCount++;
            }
            if (hitCount < 2) {
              callback(
                new Error("大写字母/小写字母/数字/符号 至少包含其中两种")
              );
              return;
            }
            state.pwdHitRule = hitCount;
            callback();
          },
        },
      ],
      confirmPassword: [
        { required: true, message: "请确认密码" },
        {
          validator: (rule: any, value: any, callback: any) => {
            if (value != state.formVal.password) {
              return callback(new Error("两次密码输入不一致"));
            }
            callback();
          },
        },
      ],
    };
    const funMethods = {
      resetForm: () => {
        state.formVal = {
          password: "",
          confirmPassword: "",
        };
      },
      show: (userInfo) => {
        state.info = userInfo;
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
        state.pwdAllReady = false;
        state.pwdHitRule = 2;
        funMethods.resetForm();
      },
    };
    const request = {
      finish: async () => {
        await state.formRef?.validate(async (valid: boolean) => {
          if (!valid) {
            return;
          }
          var payload = { ...state.formVal, userId: (state.info as any).id };
          state.pageLoading = true;
          await pwdReset(payload, () => (state.pageLoading = false));
          //操作完成
          ElMessage.success("操作完成");
          emit("onCompleted");
          funMethods.hide();
        });
      },
      onValidate: (prop, isValid) => {
        if (prop === "password") {
          state.pwdAllReady = isValid;
        }
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
      formRules,
    };
  },
});
</script>
<style lang='scss' scoped></style>