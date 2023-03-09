<template>
  <el-dialog v-model="visible" :title="isEdit ? '修改印章模板' : '新增印章模板'" width="1000px" @close="hide" destroy-on-close>
    <div class="test" v-loading="submitLoading" loading-text="数据提交中">
      <el-form :model="form" style="display: flex;flex-wrap: wrap;" :rules="rules" ref="ruleFormRef">
        <el-form-item label="证书类型" :label-width="formLabelWidth" prop="certType">
          <el-select v-model="form.certType" clearable placeholder="请选择" style="width:260px" @change="changeCertype">
            <el-option v-for="item in certOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" style="width:260px" placeholder="电子名称" />
        </el-form-item>
        <el-form-item label="印章类型" :label-width="formLabelWidth" prop="sealType">
          <el-select v-model="form.sealType" clearable placeholder="请选择" style="width:260px" @change="changeSealType">
            <el-option v-for="item in tempOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="印章形状" :label-width="formLabelWidth" prop="shape">
          <el-select v-model="form.shape" clearable placeholder="请选择" style="width:260px">
            <el-option v-for="item in sealShapeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.shape !== '2'" label="印章大小" :label-width="formLabelWidth" prop="sealSize">
          <el-input v-model="form.sealSize" style="width:260px" placeholder="格式如: 40*40" />
        </el-form-item>
        <el-form-item label="中部展示形式" :label-width="formLabelWidth" prop="showType">
          <el-select v-model="form.showType" clearable placeholder="请选择" style="width:260px">
            <el-option v-for="item in CenterTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="中部内容展现形式大小" :label-width="formLabelWidth" prop="starSize">
          <el-input type="number" :min="1" :max="30" v-model="form.starSize" style="width:260px"
            placeholder="中部内容展现形式大小(1-30mm)" />
        </el-form-item>
        <el-form-item label="印章上部字体" :label-width="formLabelWidth" prop="sealTopFont">
          <el-input type="number" :min="1" :max="30" v-model="form.sealTopFont" style="width:260px"
            placeholder="电子印章字体大小(1-30mm)" />
        </el-form-item>
        <el-form-item label="印章中部字体" :label-width="formLabelWidth" prop="sealCenterFont">
          <el-input type="number" :min="1" :max="30" v-model="form.sealCenterFont" style="width:260px"
            placeholder="中间字体大小(1-30mm)" />
        </el-form-item>
        <el-form-item label="印章内容字体大小" :label-width="formLabelWidth" prop="fontSize">
          <el-input type="number" :min="1" :max="30" v-model="form.fontSize" style="width:260px"
            placeholder="印章内容字体大小(1-30mm)" />
        </el-form-item>
        <el-form-item label="印章中部内容" :label-width="formLabelWidth" prop="imgContent">
          <el-input v-model="form.imgContent" style="width:260px" placeholder="印章中部内容" />
        </el-form-item>
        <el-form-item label="印章底部字体" :label-width="formLabelWidth" prop="sealBottomFont">
          <el-input type="number" :min="1" :max="30" v-model="form.sealBottomFont" style="width:260px"
            placeholder="底部字体大小(1-30mm)" />
        </el-form-item>
        <el-form-item label="印章外框宽度" :label-width="formLabelWidth" prop="width">
          <el-input type="number" :min="1" :max="30" v-model="form.width" style="width:260px"
            placeholder="边框宽度(1-30mm)" />
        </el-form-item>
        <el-form-item label="中底文字间距" :label-width="formLabelWidth" prop="centerFontDistance">
          <el-input type="number" :min="1" :max="30" v-model="form.centerFontDistance" style="width:260px"
            placeholder="和底部字体距离(1-30mm)" />
        </el-form-item>
        <el-form-item label="底部文字偏移量" :label-width="formLabelWidth" prop="BottomFontOffset">
          <el-input type="number" :min="1" :max="30" v-model="form.BottomFontOffset" style="width:260px"
            placeholder="底部文字偏移量(1-30mm)" />
        </el-form-item>
        <el-form-item label="底部文字内容" :label-width="formLabelWidth" prop="bottomFontContent">
          <el-input v-model="form.bottomFontContent" style="width:260px" placeholder="底部文字内容" />
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
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs, ref } from 'vue'
import { certOptions, sealShapeOptions, CenterTypeOptions, tempOptions, sealTypeEnum, sealTypeNewEnum } from '@/utils/enums'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElOption, ElSelect, FormInstance, FormRules } from 'element-plus'
import form from 'element-plus/es/components/form'
import { addSealTeml, editSealTeml, sealTemlDetail } from '@/api/operator/sealTeml'
import { removeNullAttribute } from '@/utils'
import regex from '@/utils/regulars'
export default defineComponent({
  name: 'app',
  emits: ['onCompleted'],
  setup(props, { emit }) {
    const dialogTableVisible = ref(false)
    const ruleFormRef = ref<FormInstance>()
    const formLabelWidth = '170px'
    const state = reactive({
      dialogFormVisible: false,
      loading: false,
      submitLoading: false,
      visible: false,
      isEdit: false,
      form: {
        id: '',
        certType: "",
        name: "",
        shape: "",
        sealSize: "",
        showType: "",
        sealType: "",
        sealTopFont: null,
        sealCenterFont: null,
        sealBottomFont: null,
        width: null,
        centerFontDistance: null,
        BottomFontOffset: null,
        bottomFontContent: "",
        starSize: null,
        imgContent: '',
        fontSize: null,
      },
      certOptions,
      sealShapeOptions,
      CenterTypeOptions,
      tempOptions,
      resetTypes: {
        sealType: "",
        certType: ''
      }
    })





    const funMethods = {
      onCancelFun() {
        emit("onCompleted")
      },

      validFun(rule: any, value: any, callback: any) {
        console.log(value)
        const newValue = parseFloat(value).toFixed(2)
        if (parseInt(newValue) < 1 || parseInt(newValue) > 30) {
          return callback(new Error("范围为1-30mm"));
        }
        callback();
      },

      async show(rowInfo: any) {
        // if (row.id) { }
        // state.isEdit = isEdit
        if (rowInfo) {
          const detailData = await sealTemlDetail({ id: rowInfo.id })
          state.form = {
            ...rowInfo,
            certType: sealTypeEnum[detailData.certType],
            name: detailData.sealTypeName,
            shape: detailData.imageShape,
            sealSize: detailData.sealImageSize,
            showType: detailData.contentType,
            starSize: detailData.starSize,
            sealTopFont: detailData.topFontSize,
            sealCenterFont: detailData.centerFontSize,
            imgContent: detailData.imgContent,
            sealBottomFont: detailData.bottomFontSize,
            width: detailData.sealBorderWidth,
            centerFontDistance: detailData.centerBottomKerning,
            BottomFontOffset: detailData.margintopKerning,
            bottomFontContent: detailData.bottomContent,
            fontSize: detailData.fontSize,
            sealType: sealTypeNewEnum[detailData.sealType],
          }

          state.resetTypes = {
            certType: detailData.certType,
            sealType: detailData.sealType,
          }
          state.isEdit = true
        } else {
          state.isEdit = false
          funMethods.resetForm()
        }
        state.visible = true;
      },
      hide() {
        state.visible = false;
        ruleFormRef.value.resetFields()
        funMethods.resetForm()
      },

      changeCertype(val) {
        console.log(val)
        state.resetTypes = {
          certType: val,
          sealType: state.resetTypes.sealType
        }
      },
      changeSealType(val) {
        state.resetTypes = {
          certType: state.resetTypes.certType,
          sealType: val
        }
      },

      resetForm() {
        state.form = {
          id: '',
          certType: "",
          name: "",
          shape: "",
          sealSize: "",
          showType: "",
          sealType: "",
          sealTopFont: "",
          sealCenterFont: "",
          sealBottomFont: "",
          width: "",
          centerFontDistance: "",
          BottomFontOffset: "",
          bottomFontContent: "",
          starSize: '',
          imgContent: '',
          fontSize: ""
        }
      },

      async onSubmitFun(formEl: FormInstance | undefined) {
        console.log(formEl)
        if (!formEl) return
        await formEl.validate(async (valid, fields) => {
          if (!valid) { return }
          // TODO 调新增印章模板的接口
          const newForm = {
            id: state.form.id,
            certType: state.resetTypes.certType ? state.resetTypes.certType : state.form.certType,
            sealTypeName: state.form.name,
            imageShape: state.form.shape,
            sealImageSize: state.form.sealSize,
            contentType: state.form.showType,
            sealType: state.resetTypes.sealType ? state.resetTypes.sealType : state.form.sealType,
            topFontSize: parseFloat(parseFloat(state.form.sealTopFont).toFixed(2)),
            centerFontSize: parseFloat(parseFloat(state.form.sealCenterFont).toFixed(2)),
            bottomFontSize: parseFloat(parseFloat(state.form.sealBottomFont).toFixed(2)),
            sealBorderWidth: parseFloat(parseFloat(state.form.width).toFixed(2)),
            centerBottomKerning: parseFloat(parseFloat(state.form.centerFontDistance).toFixed(2)),
            margintopKerning: parseFloat(parseFloat(state.form.BottomFontOffset).toFixed(2)),
            bottomContent: state.form.bottomFontContent,
            starSize: parseFloat(parseFloat(state.form.starSize).toFixed(2)),
            imgContent: state.form.imgContent,
            fontSize: parseFloat(parseFloat(state.form.fontSize).toFixed(2))
          }
          console.log(newForm)
          const newFormData = removeNullAttribute(newForm)
          state.submitLoading = true
          if (state.form.id) {
            await editSealTeml(newFormData, () => state.submitLoading = false)
            ElMessage.success('修改成功')
          } else {
            await addSealTeml(newFormData, () => state.submitLoading = false)
            ElMessage.success('新增成功')
          }
          funMethods.hide()
          emit('onCompleted')
        })
      }
    }

    const rules = reactive<FormRules>({
      name: [{ required: true, message: '请输入', }],
      shape: [{ required: true, message: '请输入', }],
      sealSize: [{ required: true, message: '请输入', }],
      certType: [{ required: true, message: '请输入', }],
      showType: [{ required: true, message: '请输入', }],
      sealTopFont: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      sealCenterFont: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      centerFontDistance: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      bottomFontContent: [{ required: true, message: '请输入', }],
      BottomFontOffset: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      width: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      sealBottomFont: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      sealType: [{ required: true, message: '请输入', }],
      starSize: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
      imgContent: [{ required: true, message: '请输入', }],
      fontSize: [{ required: true, message: '请输入', }, { validator: funMethods.validFun },],
    })

    return {
      rules,
      ruleFormRef,
      ...toRefs(state),
      ...funMethods,
      formLabelWidth,
      dialogTableVisible,
      ...props,
    }
  }
})

</script>
<style lang='scss' scoped>
.el-button--primary {
  background-color: #1c6cdd;
}
</style>