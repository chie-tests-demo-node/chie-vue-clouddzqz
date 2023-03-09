<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    title="导入证书"
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
        :rules="{ signCert: [{ required: true, message: '请选择签名证书' }] }"
      >
        <el-form-item label="签名证书" prop="signCert">
          <FileUpload
            :value="formVal.signCert"
            @onChange="onSignCertChange"
            fileTip="请上传.cer文件 1M以内"
            accept="application/pkix-cert,application/x-x509-ca-cert,.cer"
            :maxSize="1 * 1024 * 1024"
          />
        </el-form-item>
        <el-form-item label="加密证书">
          <FileUpload
            :value="formVal.jmCert"
            @onChange="onJmCertChange"
            fileTip="请上传.cer文件 1M以内"
            accept="application/pkix-cert,application/x-x509-ca-cert,.cer"
            :maxSize="1 * 1024 * 1024"
          />
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
import { defineComponent, reactive, toRefs } from "vue";
import FileUpload from "@/components/CusForm/FileUpload/FileUpload.vue";
import { isNull } from "@/utils";
import { certImport } from "@/api/certMgr";
import { ElMessage } from "element-plus";

export default defineComponent({
  components: { FileUpload },
  props: [],
  emits: ["onCompleted"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      formVal: {
        signCert: null,
        jmCert: null,
      },
      formRef: null,
      info: {},
      loading: false,
    });
    const funMethods = {
      resetForm: () => {
        state.formVal = {
          signCert: null,
          jmCert: null,
        };
      },
      show: (info) => {
        state.info = info;
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
        funMethods.resetForm();
      },
      onSignCertChange: (val) => {
        state.formVal.signCert = val;
        state.formRef?.validateField("signCert");
      },
      onJmCertChange: (val) => {
        state.formVal.jmCert = val;
      },
      onCompleted: () => {
        funMethods.hide();
        emit("onCompleted");
      },
    };
    const request = {
      onFinish: async () => {
        await state.formRef?.validate(async (valid: boolean) => {
          if (!valid) {
            return;
          }

          var payload: any = {
            id: (state.info as any).id,
            signFileCert: state.formVal.signCert.file,
          };

          if (!isNull(state.formVal.jmCert)) {
            payload.tranFileCert = state.formVal.jmCert.file;
          }

          state.loading = true;
          await certImport(payload, () => (state.loading = false));

          ElMessage.success("导入成功!");

          //操作完成后
          funMethods.onCompleted();
        });
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
    };
  },
});
</script>
<style lang='scss' scoped>
</style>