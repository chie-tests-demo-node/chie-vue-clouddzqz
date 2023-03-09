<template>
  <div class="addManagepDia">
    <el-dialog v-model="visible" :title="isEdit ? '修改印章' : '新增印章'" width="600px" :close-on-click-modal="false"
      :close-on-press-escape="false" @close="hide" destroy-on-close>
      <div class="test" v-loading="submitLoading" loading-text="数据提交中">
        <el-form :model="form" style="display: flex; flex-wrap: wrap" :rules="rules" ref="ruleFormRef">
          <el-form-item label="模板名称" :label-width="formLabelWidth" prop="sealType">
            <el-select v-model="form.sealType" clearable placeholder="请选择" style="width: 350px" :loading="loading"
              loading-text="正在加载数据" @click="getSealTypeOption" @change="selectLabel">
              <el-option v-for="item in tempOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="选择证书" :label-width="formLabelWidth" prop="certType">
            <el-select v-model="form.certType" clearable placeholder="请选择" style="width: 350px" @click="getCertTypeOption"
              @change="getCertLabel" :loading="loading" loading-text="正在加载数据">
              <el-option v-for="item in certOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="有效期" :label-width="formLabelWidth" prop="timeBetween">
            <el-date-picker v-model="form.timeBetween" placeholder="年/月/日" format="YYYY/MM/DD" style="width: 350px"
              value-format="YYYY-MM-DD" :disabled-date="disabledDate" />
          </el-form-item>
          <el-form-item label="生成方式" :label-width="formLabelWidth">
            <el-radio-group v-model="form.successType" class="ml-4" @change="onRadioChange">
              <el-radio label="1" size="large">自动</el-radio>
              <el-radio label="2" size="large">手动</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-show="form.successType === '1'" :label-width="formLabelWidth">
            <div v-show="!imUrlList[0]" style="color: gray; font-size: 20px">
              暂无印章
            </div>
            <el-image v-show="imUrlList[0]" style="width: 163px" :preview-src-list="imUrlList" :src="imUrlList[0]" />
            <el-button style="margin-left: 40px" type="primary" @click="successImg">生成</el-button>
          </el-form-item>
          <el-form-item v-show="form.successType === '2'" :label-width="formLabelWidth">
            <el-image v-show="form.fileImg" style="width: 163px" :src="form.fileImg" />
            <div v-show="form.fileImg" style="width: 200px"></div>
            <div style="display:block">
              <FileUpload ref="sealManageRef" :value="form.fileAll" @onChange="onImgChange" accept="image/png,image/jpeg"
                :maxSize="20 * 1024" :hideOpt="true" fileTip="请上传png/jpg文件 20K以内" />
            </div>
          </el-form-item>
          <el-form-item label="印章长" :label-width="formLabelWidth">
            <el-input v-model="form.lang" style="width: 350px" :value="form.lang" disabled />
          </el-form-item>
          <el-form-item label="印章宽" :label-width="formLabelWidth">
            <el-input v-model="form.short" style="width: 350px" :value="form.short" disabled />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button :disabled="submitLoading ? true : false" @click="hide">取消</el-button>
          <el-button :disabled="submitLoading ? true : false" type="primary" @click="onSubmitFun(ruleFormRef)">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs, ref } from "vue";
import { sealShapeOptions, CenterTypeOptions } from "@/utils/enums";
import { ElMessage, FormRules, FormInstance } from "element-plus";
import FileUpload from "@/components/CusForm/FileUpload/FileUpload.vue";
import {
  addSealManage,
  editSealManage,
  getCertList,
  getSealOptionList,
  makeSealImg,
  sealManageDetail,
} from "@/api/operator/sealManage";
import { hide } from "@popperjs/core";
import { getBase64ImgWH, removeBase64Prefix } from "@/utils";
export default defineComponent({
  name: "app",
  emits: ["onCompleted"],
  components: { FileUpload },
  setup(props, { emit }) {
    const dialogTableVisible = ref(false);
    const formLabelWidth = "140px";
    const ruleFormRef = ref<FormInstance>();
    const state = reactive({
      dialogFormVisible: false,
      visible: false,
      loading: false,
      isEdit: false,
      submitLoading: false,
      isShow: false,
      imUrlList: [],
      form: {
        id: "",
        certType: null,
        timeBetween: "",
        sealType: "",
        successType: "1",
        lang: null,
        short: null,
        signCert: "",
        tranCert: "",
        sealTypeName: "",
        newSealType: "",
        fileImg: null,
        fileAll: {
          file: "",
          name: "",
        },
      },
      newAddSealType: "1",
      selectRef: null,
      certOptions: [],
      sealShapeOptions,
      CenterTypeOptions,
      tempOptions: [],
      sealList: [],
      certList: [],
      sealManageRef: null,
      certId: null,
    });

    const rules: FormRules = {
      sealType: [{ required: true, message: "请输入" }],
      certType: [{ required: true, message: "请输入" }],
      timeBetween: [{ required: true, message: "请输入" }],
    };

    const funMethods = {
      onCancelFun() {
        emit("onCompleted");
      },
      async show(rowId: any) {
        if (typeof rowId === "number") {
          // 调详情的接口
          const newList = await sealManageDetail({ id: rowId });
          const calbackList = {
            ...newList,
            timeBetween: newList.expireTime,
            successType: newList.createType,
            sealType: newList.sealName,
            certType: newList.certName,
            short: newList.imgHeight,
            lang: newList.imgWidth,
            sealTypeName: newList.sealName,
          };
          state.newAddSealType = "1";
          state.certId = newList.certId;
          if (newList.createType === "1") {
            state.imUrlList[0] = newList.sealBlob;
          } else {
            calbackList.fileImg = newList.sealBlob
          }
          setTimeout(() => {
            state.sealManageRef?.setFile({
              file: newList.sealBlob,
              name: '请重新选择文件'
            });
          }, 100)
          state.form = { ...calbackList };
          state.isEdit = true;
          console.log(calbackList);
        } else {
          funMethods.resetForm();
          state.form.successType = "1";
          setTimeout(() => {
            state.sealManageRef?.setFile({
              file: "",
              name: "",
            });
          }, 100)
          state.imUrlList[0] = "";
          state.isEdit = false;
        }
        state.visible = true;
      },
      hide() {
        state.visible = false;
        ruleFormRef.value.resetFields()
        funMethods.resetForm();
        state.imUrlList[0] = "";
      },

      resetForm() {
        state.form = {
          id: "",
          certType: "",
          timeBetween: "",
          sealType: "",
          successType: "auto",
          lang: "",
          short: "",
          signCert: "",
          tranCert: "",
          sealTypeName: "",
          newSealType: "",
          fileImg: "",
          fileAll: {
            file: "",
            name: "",
          },
        };
      },

      async onImgChange(val: any) {
        state.form.fileImg = val.file;
        const data = await getBase64ImgWH(val.file);
        state.form.lang = (data.width / 25.4).toFixed(0);
        state.form.short = (data.height / 25.4).toFixed(0);
      },

      onRadioChange(val) {
        if (state.form.id && val === '2') {
          state.isShow = true;
          state.sealManageRef?.setFile({
            file: "",
            name: "",
          });
        } else {
          state.isShow = false;
        }
      },
      async onSubmitFun(formEl: FormInstance | undefined) {
        if (!formEl) return;
        await formEl.validate(async (valid, fields) => {
          if (!valid) { return }
          const newForm = {
            expire: state.form.timeBetween,
            createType: parseInt(state.form.successType),
            sealTypeName: state.form.sealTypeName,
            certId: state.certId ? state.certId : state.form.certType,
            imgHeight: state.form.short,
            imgWidth: state.form.lang,
            signCert: state.form.signCert,
            tranCert: state.form.tranCert,
            imgBase64: state.form.fileImg ? removeBase64Prefix(state.form.fileImg) : "",
            sealType: state.newAddSealType,
          };
          state.submitLoading = true;
          if (state.form.id) {
            await editSealManage({ ...newForm, id: state.form.id }, () => (state.submitLoading = false));
            ElMessage.success("修改成功");
          } else {
            await addSealManage(newForm, () => (state.submitLoading = false));
            ElMessage.success("新增成功");
          }
          funMethods.hide();
          emit("onCompleted");
        });
      },
      async successImg() {
        //TODO 调生成图片的接口
        console.log(state.form);
        const newForm = {
          expire: state.form.timeBetween,
          createType: parseInt(state.form.successType),
          sealTypeName: state.form.sealTypeName,
          certId: state.certId ? state.certId : state.form.certType,
        };
        console.log(newForm);
        const imgData = await makeSealImg(newForm);
        state.form.short = imgData.imgHeight
        state.form.lang = imgData.imgWidth
        state.imUrlList[0] = imgData.base64
      },
      disabledDate: (time: Date) => {
        return time.getTime() < Date.now();
      },
      selectLabel(val: any) {
        const newCert = state.sealList.filter((m: any) => val === m.id);
        console.log(newCert);
        state.form.sealTypeName = newCert[0].sealTypeName;
        state.form.newSealType = newCert[0].certType;
        state.newAddSealType = newCert[0].sealType;
        state.form.certType = ''
        console.log(state);
      },
      getCertLabel(val: any) {
        const newCert = state.certList.filter((m: any) => val === m.id);
        state.form.signCert = newCert[0].signCert;
        state.form.tranCert = newCert[0].tranCert;
      },
    };

    const requestMethods = {
      // 获取印章类型
      async getSealTypeOption() {
        state.loading = true;
        const sealOptionsList = await getSealOptionList(() => {
          state.loading = false;
        });
        const list = sealOptionsList.map((m: any) => {
          return {
            label: m.sealTypeName,
            value: m.id,
          };
        });
        state.tempOptions = list;
        state.sealList = sealOptionsList;
      },

      // 获取证书类型
      async getCertTypeOption() {
        state.loading = true;
        const list = await getCertList(
          { certType: state.form.newSealType },
          () => {
            state.loading = false;
          }
        );
        console.log(list);
        const newList = list.map((m: any) => {
          return {
            label: m.commonName,
            value: m.id,
          };
        });
        state.certOptions = newList;
        state.certList = list;
      },
    };

    return {
      ruleFormRef,
      rules,
      ...requestMethods,
      ...toRefs(state),
      ...funMethods,
      formLabelWidth,
      dialogTableVisible,
      ...props,
    };
  },
});
</script>
<style lang='scss' scoped>
.addManagepDia {
  background-color: red;

  .el-form-item {
    .el-form-item__content {
      display: block !important;
    }
  }

  .el-button--primary {
    background-color: #1c6cdd;
  }
}
</style>