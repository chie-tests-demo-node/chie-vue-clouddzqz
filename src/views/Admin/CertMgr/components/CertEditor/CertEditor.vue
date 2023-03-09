<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    :title="info?.id ? '修改证书' : '证书申请'"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="hide"
  >
    <div v-loading="loading">
      <el-form
        :model="formVal"
        ref="formRef"
        label-width="100px"
        :rules="formRule"
      >
        <el-form-item v-if="!info?.id" label="申请方式" prop="applyMode">
          <el-radio-group v-model="formVal.applyMode">
            <el-radio :label="'1'">在线</el-radio>
            <el-radio :label="'2'">离线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="使用者名称" prop="commonName">
          <el-input maxlength="50" v-model="formVal.commonName" />
        </el-form-item>
        <el-form-item label="证书类型" prop="certType">
          <el-radio-group v-model="formVal.certType">
            <el-radio :label="'2'">机构证书</el-radio>
            <el-radio :label="'1'">个人证书</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密钥算法" prop="keyAlgorithm">
          <el-radio-group v-model="formVal.keyAlgorithm">
            <el-radio :label="'SM3withSM2'">SM2</el-radio>
            <el-radio :label="'SHA256withRSA'">RSA</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="有效期至" prop="expire">
          <el-date-picker
            v-model="formVal.expire"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <div v-if="formVal.certType == 2">
          <el-form-item label="组织名称" prop="orgName">
            <el-input maxlength="50" v-model="formVal.orgName" />
          </el-form-item>
          <el-form-item label="组织代码" prop="orgUnit">
            <el-input maxlength="20" v-model="formVal.orgUnit" />
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="身份证号" prop="idCard">
            <el-input maxlength="20" v-model="formVal.idCard" />
          </el-form-item>
        </div>
        <el-form-item label="联系地址" prop="address">
          <el-input maxlength="50" v-model="formVal.address" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input maxlength="20" v-model="formVal.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input maxlength="100" v-model="formVal.email" />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div style="text-align: center">
        <el-button @click="hide" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="onFinish" :disabled="loading"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts'>
import { FormRules } from "element-plus/es";
import { defineComponent, reactive, toRefs } from "vue";
import { isNull, momentFormat } from "@/utils";
import { ElMessage } from "element-plus";
import { certApplyOnline, certApplyOutLine, certEdit } from "@/api/certMgr";
import regex from "@/utils/regulars";
import "./CertEditor.scss";

export default defineComponent({
  props: [],
  emits: ["onCompleted"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      info: {},
      formVal: {
        applyMode: "1",
        commonName: "",
        certType: "2",
        keyAlgorithm: "SM3withSM2",
        expire: "",
        orgName: "",
        orgUnit: "",
        idCard: "",
        address: "",
        phone: "",
        email: "",
      },
      formRef: null,
      loading: false,
    });
    const formRule: FormRules = {
      applyMode: [{ required: true, message: "请选择申请方式" }],
      commonName: [{ required: true, message: "请输入使用者名称" }],
      certType: [{ required: true, message: "请选择证书类型" }],
      keyAlgorithm: [{ required: true, message: "请选择密钥算法" }],
      expire: [{ required: true, message: "请选择有效期" }],
      orgName: [{ required: true, message: "请输入组织名称" }],
      orgUnit: [
        { required: true, message: "请输入组织代码" },
        { pattern: regex.onlyNumber, message: "组织代码仅能输入数字" },
        { min: 11, message: "组织代码只能为11位" },
        { max: 11, message: "组织代码只能为11位" },
      ],
      idCard: [
        { required: true, message: "请输入身份证号" },
        { pattern: regex.idCard, message: "身份证号码不合规" },
      ],
      phone: [{ pattern: regex.onlyNumber, message: "电话仅能为数字" }],
      email: [{ pattern: regex.email, message: "邮箱格式不合法" }],
    };
    const funMethods = {
      resetFormFields: () => {
        state.formVal = {
          applyMode: "1",
          commonName: "",
          certType: "2",
          keyAlgorithm: "SM3withSM2",
          expire: "",
          orgName: "",
          orgUnit: "",
          idCard: "",
          address: "",
          phone: "",
          email: "",
        };
      },
      show: (info) => {
        state.info = info;
        if (!isNull(info)) {
          state.formVal = {
            ...info,
          };
        }
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
        funMethods.resetFormFields();
      },
      onCompleted: (key) => {
        funMethods.hide();
        emit("onCompleted", key);
      },
      disabledDate: (time: Date) => {
        return time.getTime() < Date.now();
      },
    };
    const request = {
      onFinish: async () => {
        await state.formRef?.validate(async (valid: boolean) => {
          if (!valid) {
            return;
          }
          var payload: any = {
            ...state.formVal,
            expire: momentFormat(state.formVal.expire, "YYYY-MM-DD"),
          };
          if (payload.certType === "2") {
            delete payload.idCard;
          } else {
            delete payload.orgName;
            delete payload.orgUnit;
          }
          state.loading = true;
          if (!isNull(state.info)) {
            payload.id = (state.info as any).id;
            await certEdit(payload, () => (state.loading = false));
            ElMessage.success("编辑成功!");
            funMethods.onCompleted("edit");
          } else {
            if (payload.applyMode === "1") {
              await certApplyOnline(payload, () => (state.loading = false));
              ElMessage.success("申请成功!");
              funMethods.onCompleted("add");
            } else {
              await certApplyOutLine(payload, () => (state.loading = false));
              ElMessage.success("申请成功!");
              funMethods.onCompleted("add");
            }
          }
        });
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
      formRule,
    };
  },
});
</script>
<style lang='scss' scoped>
</style>