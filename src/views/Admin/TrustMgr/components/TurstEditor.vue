<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    :title="editModel ? '修改信任域' : '新增信任域'"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="hide"
  >
    <div class="trustEditor" v-loading="submitLoading">
      <el-form
        :model="formVal"
        label-width="90px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="机构名称" prop="caName">
          <el-input v-model="formVal.caName" maxlength="50" />
        </el-form-item>
        <el-form-item label="根证书" prop="cert" class="fileLayout">
          <FileUpload
            ref="rootCertRef"
            :value="formVal.cert"
            @onChange="onRootCertChange"
            fileTip="请上传.cer文件 1M以内"
            accept="application/pkix-cert,application/x-x509-ca-cert,.cer"
            :maxSize="1 * 1024 * 1024"
          />
        </el-form-item>
        <el-form-item label="OCSP地址" prop="ocspIp">
          <el-input v-model="formVal.ocspIp" maxlength="50" />
        </el-form-item>
        <el-form-item label="OCSP端口" prop="ocspPort">
          <el-input v-model="formVal.ocspPort" maxlength="5" />
        </el-form-item>
        <el-form-item label="联系人" prop="contacts">
          <el-input v-model="formVal.contacts" maxlength="50" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactWay">
          <el-input v-model="formVal.contactWay" maxlength="20" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formVal.remark" maxlength="200" />
        </el-form-item>
        <!-- <el-form-item label="吊销列表" prop="destroyList">
        <FileUpload
          :value="formVal.destroyList"
          @onChange="onDestroyListChange"
        />
      </el-form-item> -->
      </el-form>
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="hide" :disabled="submitLoading">取消</el-button>
        <el-button type="primary" @click="finish" :disabled="submitLoading"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs } from "vue";
import { ElMessage, FormRules } from "element-plus/es";
import { isNull } from "@/utils";
import { trustAdd, trustEdit } from "@/api/trust";
import regex from "@/utils/regulars";
import FileUpload from "@/components/CusForm/FileUpload/FileUpload.vue";
import "./TurstEditor.scss";

export default defineComponent({
  props: [],
  components: { FileUpload },
  emits: ["onCompleted"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      formVal: {
        caName: "",
        contacts: "",
        contactWay: "",
        remark: "",
        cert: null,
        ocspIp: "",
        ocspPort: "",
        destroyList: null,
      },
      formRef: null,
      editModel: null,
      submitLoading: false,
      rootCertRef: null,
    });
    const formRules: FormRules = {
      caName: [{ required: true, message: "请输入机构名称" }],
      contactWay: [
        { pattern: regex.onlyNumber, message: "联系电话仅能为数字" },
      ],
      cert: [{ required: true, message: "请上传根证书" }],
      ocspIp: [{ required: true, message: "请输入OCSP地址" }],
      ocspPort: [
        { required: true, message: "请输入OCSP端口" },
        { pattern: regex.onlyNumber, message: "端口仅能为数字" },
        {
          validator: (rule, value, callback) => {
            var valNumber = parseInt(value);
            if (valNumber < 0 || valNumber > 65535) {
              return callback(new Error("端口范围为：0-65535"));
            }
            callback();
          },
        },
      ],
    };
    const funMethods = {
      show: (editModel) => {
        state.editModel = editModel;
        if (!isNull(editModel)) {
          var cert = {
            name: editModel.fileName,
            file: editModel.fileCert,
          };
          state.formVal = {
            caName: editModel.caName,
            contacts: editModel.contacts,
            contactWay: editModel.contactWay,
            remark: editModel.remark,
            cert,
            destroyList: null,
            ocspIp: editModel.ocspIp,
            ocspPort: editModel.ocspPort,
          };
          state.formVal.cert = { ...cert };
          setTimeout(() => {
            state.rootCertRef?.setFile({ ...cert });
          }, 100);
        }
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
        state.formVal = {
          caName: "",
          contacts: "",
          contactWay: "",
          remark: "",
          cert: null,
          destroyList: null,
          ocspIp: "",
          ocspPort: "",
        };
      },
      finish: async () => {
        await state.formRef?.validate(async (valid: boolean) => {
          if (!valid) {
            return;
          }
          var payload: any = {
            ...state.formVal,
            rootCert: state.formVal.cert.file,
            fileName: state.formVal.cert.name,
          };
          delete payload.cert;
          delete payload.destroyList;
          // console.info(payload);
          state.submitLoading = true;
          if (isNull(state.editModel)) {
            //新增
            await trustAdd(payload, () => {
              state.submitLoading = false;
            });
            ElMessage.success("新增信任域成功!");
            funMethods.hide();
            emit("onCompleted", "add");
          } else {
            //修改
            payload.id = state.editModel.id;
            await trustEdit(payload, () => {
              state.submitLoading = false;
            });
            ElMessage.success("修改信任域成功!");
            emit("onCompleted", "edit");
            funMethods.hide();
          }
        });
      },
      onRootCertChange: (val) => {
        state.formVal.cert = val;
        state.formRef?.validateField("cert");
      },
      onDestroyListChange: (val) => {
        state.formVal.destroyList = val;
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
      formRules,
    };
  },
});
</script>
<style lang='scss' scoped>
</style>