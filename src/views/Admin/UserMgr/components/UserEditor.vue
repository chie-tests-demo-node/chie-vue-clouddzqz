<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    :title="editModel ? '修改用户' : '新增用户'"
    width="430px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="hide"
  >
    <div class="userEditor" v-loading="pageLoading">
      <el-form
        :model="formVal"
        label-width="110px"
        :rules="formRules"
        ref="formRef"
        @validate="onValidate"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formVal.username" maxlength="20" />
        </el-form-item>
        <el-form-item label="盖章到期时间" prop="endTime">
          <el-date-picker
            style="width: 100%"
            v-model="formVal.endTime"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <div v-if="!editModel?.id">
          <el-form-item label="密码" prop="password">
            <el-input show-password v-model="formVal.password" maxlength="32">
              <template #suffix>
                <div v-if="pwdAllReady" class="pwdTip">
                  <div v-if="pwdHitRule === 2" class="red">弱</div>
                  <div v-else-if="pwdHitRule === 3" class="orange">中</div>
                  <div v-else class="green">强</div>
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
        </div>
        <el-form-item label="授权范围" prop="authorizeType">
          <el-radio-group v-model="formVal.authorizeType">
            <el-radio label="0">全部</el-radio>
            <el-radio label="1" @click="showAuthEditor">区间</el-radio>
          </el-radio-group>
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
  <AuthEditor ref="authEditorRef" @onCompleted="onAuthCompleted" />
</template>

<script lang='ts'>
import { userEdit } from "@/api/userMgr";
import AuthEditor from "@/components/AuthEditor/AuthEditor.vue";
import { isNull, momentFormat } from "@/utils";
import { FormRules } from "element-plus/es";
import { ElMessage } from "element-plus";
import { defineComponent, reactive, toRefs } from "vue";
import "./UserEditor.scss";
import regex from "@/utils/regulars";
export default defineComponent({
  components: { AuthEditor },
  props: [],
  emits: ["onCompleted"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      formVal: {
        username: "",
        endTime: "",
        password: "",
        confirmPassword: "",
        authorizeType: "0",
      },
      formRef: null,
      authEditorRef: null,
      editModel: null,
      sealIdList: [],
      pageLoading: false,
      pwdAllReady: false,
      pwdHitRule: 2,
    });
    const formRules: FormRules = {
      username: [{ required: true, message: "请输入用户名" }],
      endTime: [{ required: true, message: "请选择盖章到期时间" }],
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
      authorizeType: [{ required: true, message: "请选择授权范围" }],
    };
    const funMethods = {
      show: (initVal) => {
        state.editModel = initVal;
        if (!isNull(initVal)) {
          state.formVal = { ...initVal, authorizeType: initVal.sqqjdm };
          state.sealIdList = initVal.sealIdList;
        }
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
        state.formVal = {
          username: "",
          endTime: "",
          password: "",
          confirmPassword: "",
          authorizeType: "0",
        };
        state.pwdAllReady = false;
        state.pwdHitRule = 2;
        state.sealIdList = [];
      },
      finish: async () => {
        await state.formRef?.validate(async (valid: boolean) => {
          if (!valid) {
            return;
          }
          state.pageLoading = true;
          var payload: any = { ...state.formVal };
          payload.endTime = momentFormat(payload.endTime, "YYYY-MM-DD");
          payload.sealIdList = JSON.stringify(state.sealIdList);
          if (!isNull(state.editModel)) {
            payload.userId = state.editModel.id;
          }
          await userEdit(payload, () => (state.pageLoading = false));
          ElMessage.success("操作成功");
          funMethods.hide();
          emit("onCompleted", payload.userId ? "edit" : "add");
        });
      },
      disabledDate: (time: Date) => {
        return time.getTime() < Date.now();
      },
      showAuthEditor: (e) => {
        if (e.target.tagName !== "INPUT") {
          return;
        }
        state.authEditorRef?.show(state.sealIdList);
      },
      onAuthCompleted: (val) => {
        state.sealIdList = val;
      },
      onValidate: (prop, isValid) => {
        if (prop === "password") {
          state.pwdAllReady = isValid;
        }
      },
    };
    return {
      ...toRefs(state),
      formRules,
      ...funMethods,
    };
  },
});
</script>