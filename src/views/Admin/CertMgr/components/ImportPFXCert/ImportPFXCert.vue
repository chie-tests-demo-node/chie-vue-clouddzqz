<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    title="导入PFX证书"
    width="420px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="hide"
  >
    <div v-loading="certInfoLoading">
      <el-form
        :model="formVal"
        ref="formRef"
        label-width="110px"
        :rules="formRule"
      >
        <el-form-item label="口令" prop="password">
          <el-input v-model="formVal.password" @input="onPFXCodeChange" />
        </el-form-item>
        <el-form-item label="上传PFX文件" prop="pfxFile">
          <FileUpload
            ref="uploadRef"
            :value="formVal.pfxFile"
            @onChange="onPFXFileChange"
            :disable="!enables.pfxFile"
            fileTip="请上传.pfx文件,1M以内"
            :maxSize="1 * 1024 * 1024"
            accept="application/x-pkcs12,.pfx"
          />
        </el-form-item>
        <el-form-item label="使用者名称" prop="commonName">
          <el-input
            v-model="formVal.commonName"
            :disabled="!enables.commonName"
          />
        </el-form-item>
        <el-form-item label="证书类型" prop="certType">
          <el-radio-group
            v-model="formVal.certType"
            :disabled="!enables.certType"
          >
            <el-radio :label="'2'">机构证书</el-radio>
            <el-radio :label="'1'">个人证书</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="密钥算法" prop="keyAlgorithm">
          <el-radio-group
            v-model="formVal.keyAlgorithm"
            :disabled="!enables.keyAlgorithm"
          >
            <el-radio :label="'SM3withSM2'">SM2</el-radio>
            <el-radio :label="'SHA256withRSA'">RSA</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="有效期至" prop="expire">
          <el-date-picker
            v-model="formVal.expire"
            style="width: 100%"
            :disabled-date="disabledDate"
            :disabled="!enables.expire"
          />
        </el-form-item>
        <div v-if="formVal.certType === '2'">
          <el-form-item label="组织名称" prop="orgName">
            <el-input
              maxlength="20"
              v-model="formVal.orgName"
              :disabled="!enables.orgName"
            />
          </el-form-item>
          <el-form-item label="组织代码" prop="orgUnit">
            <el-input
              maxlength="20"
              v-model="formVal.orgUnit"
              :disabled="!enables.orgUnit"
            />
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label="身份证号" prop="idCard">
            <el-input
              maxlength="20"
              v-model="formVal.idCard"
              :disabled="!enables.idCard"
            />
          </el-form-item>
        </div>
        <el-form-item label="联系地址" prop="address">
          <el-input
            maxlength="20"
            v-model="formVal.address"
            :disabled="!enables.address"
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input
            maxlength="20"
            v-model="formVal.phone"
            :disabled="!enables.phone"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            maxlength="20"
            v-model="formVal.email"
            :disabled="!enables.email"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="hide" :disabled="certInfoLoading">取消</el-button>
        <el-button type="primary" @click="onFinish" :disabled="certInfoLoading"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts'>
import { isNull, momentFormat } from "@/utils";
import { ElMessage, ElMessageBox, FormRules } from "element-plus/es";
import { defineComponent, reactive, toRefs } from "vue";
import { pfxImport, pfxInfo } from "@/api/certMgr";
import FileUpload from "@/components/CusForm/FileUpload/FileUpload.vue";
import regex from "@/utils/regulars";
import "./ImportPFXCert.scss";
export default defineComponent({
  props: [],
  emits: ["onCompleted"],
  components: { FileUpload },
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      formVal: {
        password: "",
        pfxFile: null,
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
      enables: {
        pfxFile: false,
        commonName: false,
        certType: false,
        keyAlgorithm: false,
        expire: false,
        orgName: false,
        orgUnit: false,
        idCard: false,
        address: false,
        phone: false,
        email: false,
      },
      certInfoLoading: false,
      uploadRef: null,
    });
    const formRule: FormRules = {
      password: [{ required: true, message: "请输入口令" }],
      pfxFile: [{ required: true, message: "请上传PFX文件" }],
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
    };
    const funMethods = {
      resetForm: () => {
        state.formVal = {
          password: "",
          pfxFile: null,
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
        state.enables = {
          pfxFile: false,
          commonName: false,
          certType: false,
          keyAlgorithm: false,
          expire: false,
          orgName: false,
          orgUnit: false,
          idCard: false,
          address: false,
          phone: false,
          email: false,
        };
        state.uploadRef?.onlyClearSelf();
      },
      show: () => {
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
        funMethods.resetForm();
      },
      onCompleted: () => {
        funMethods.hide();
        emit("onCompleted");
      },
      onPFXCodeChange: (val) => {
        funMethods.resetForm();
        state.formVal.password = val;
        if (!isNull(val)) {
          state.enables.pfxFile = true;
        }
      },
      disabledDate: (time: Date) => {
        return time.getTime() < Date.now();
      },
    };
    const request = {
      fetchPFXCertInfo: async () => {
        state.certInfoLoading = true;
        const certInfo = await pfxInfo(
          { password: state.formVal.password, pfx: state.formVal.pfxFile.file },
          () => (state.certInfoLoading = false),
          () => {
            state.formVal.pfxFile = null;
            state.uploadRef?.onlyClearSelf();
          }
        );
        state.enables = {
          pfxFile: false,
          commonName: isNull(certInfo.commonName),
          certType: isNull(certInfo.certType),
          keyAlgorithm: isNull(certInfo.keyAlgorithm),
          expire: isNull(certInfo.expire),
          orgName: isNull(certInfo.orgName),
          orgUnit: isNull(certInfo.orgUnit),
          idCard: isNull(certInfo.idCard),
          address: isNull(certInfo.address),
          phone: isNull(certInfo.phone),
          email: isNull(certInfo.email),
        };
        state.formVal = {
          ...state.formVal,
          ...certInfo,
        };
      },
      onPFXFileChange: async (val) => {
        if (isNull(state.formVal.password)) {
          ElMessageBox.alert("请先输入口令", "提示", { type: "error" });
          return;
        }
        state.formVal.pfxFile = val;
        state.formRef?.validateField("pfxFile");
        if (isNull(val)) {
          funMethods.resetForm();
          return;
        }
        request.fetchPFXCertInfo();
      },
      onFinish: async () => {
        await state.formRef?.validate(async (valid: boolean) => {
          if (!valid) {
            return;
          }
          var payload = {
            ...state.formVal,
            expire: momentFormat(state.formVal.expire, "YYYY-MM-DD"),
            pfx: state.formVal.pfxFile.file,
          };
          state.certInfoLoading = true;
          await pfxImport(payload, () => (state.certInfoLoading = false));
          ElMessage.success("导入成功!");
          funMethods.onCompleted();
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