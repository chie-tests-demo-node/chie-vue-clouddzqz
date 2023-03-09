<template>
  <div v-loading="loading">
    <el-dialog :title="isEdit ? '编辑应用' : '新增应用'" :close-on-click-modal="false" :close-on-press-escape="false"
      v-model="visible" width="600px" @close="hide" destroy-on-close>
      <div class="form" v-loading="submitLoading" loading-text="数据提交中">
        <el-form :model="formData" :rules="rulesForm" ref="ruleFormRef">
          <el-form-item label="应用名称" :label-width="formLabelWidth" prop="companyName">
            <el-input v-model="formData.companyName" style="width: 350px;" placeholder="请输入应用名称" />
          </el-form-item>
          <el-form-item label="IP地址" :label-width="formLabelWidth" prop="ipAddress">
            <el-input v-model="formData.ipAddress" style="width: 350px;" placeholder="请输入IP地址" />
          </el-form-item>
          <el-form-item label="有效期" :label-width="formLabelWidth" prop="sqdqsj">
            <el-date-picker v-model="formData.sqdqsj" placeholder="年/月/日" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
              style="width: 350px;" :disabled-date="disabledDate" />
          </el-form-item>
          <el-form-item label="授权范围" :label-width="formLabelWidth">
            <el-radio-group v-model="formData.sqqjdm" class="ml-4">
              <el-radio label="0" size="large">全部</el-radio>
              <el-radio label="1" size="large" @click="onRadioClick">区间</el-radio>
            </el-radio-group>
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
    <AuthEditor ref="authEditorRef" @onCompleted="onCompleted" @onCancel="onCancel" />
  </div>
</template>

<script lang='ts'>
import { editAppAuthor, addAppAuthorAllFun, addAppAuthorOtherFun } from '@/api/operator/AppAuthor'
import { hide } from '@popperjs/core'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { defineComponent, reactive, ref, toRefs } from 'vue'
import AuthEditor from '@/components/AuthEditor/AuthEditor.vue'
import regex from '@/utils/regulars'
export default defineComponent({
  name: 'app',
  components: { AuthEditor },
  emits: ['onCompleted'],
  setup(props, { emit }) {
    const formLabelWidth = '140px'
    const ruleFormRef = ref<FormInstance>()
    const state = reactive({
      visible: false,
      loading: false,
      submitLoading: false,
      authEditorRef: null,
      formRef: null,
      isEdit: false,
      formData: {
        id: '',
        companyName: '',
        ipAddress: '',
        sqdqsj: '',
        sqqjdm: '0',
        sealId: [],
      },
    })
    const rulesForm: FormRules = {
      companyName: [{ required: true, message: '请输入', }],
      ipAddress: [
        { required: true, message: '请输入', },
        { pattern: regex.ipAddress, message: "请输入正确的ip地址" }
      ],
      sqdqsj: [{ required: true, message: '请输入', }],
    }

    const funMethods = {
      onRadioClick(e: any) {
        if (e.target.tagName !== 'INPUT') { return }
        state.authEditorRef?.show(state.formData.sealId)
      },
      onCompleted(selectedKeys: any) {
        state.formData.sealId = selectedKeys
      },
      onCancel() { },
      show(row: any) {
        if (row) {
          state.formData = { ...row }
          state.isEdit = true
        } else {
          state.isEdit = false
        }
        state.visible = true;
      },
      hide() {
        state.visible = false;
        ruleFormRef.value.resetFields()
        funMethods.resetForm()
      },

      resetForm: () => {
        state.formData = {
          id: '',
          companyName: '',
          ipAddress: '',
          sqdqsj: '',
          sqqjdm: '0',
          sealId: [],
        }
      },

      // 禁用今天之前的日期
      disabledDate: (time: Date) => {
        return time.getTime() < Date.now();
      },
      // 提交应用授权
      async onSubmitFun(formEl: FormInstance | undefined) {
        if (!formEl) return
        await formEl.validate(async (valid: Boolean) => {
          if (!valid) {
            return
          }
          state.submitLoading = true
          if (state.formData.id) {
            // TODO 调修改应用授权的接口
            await editAppAuthor(state.formData, () => state.submitLoading = false)
            ElMessage.success('修改成功')
          } else {
            if (state.formData.sqqjdm === '0') {
              // TODO 调新增应用授权的接口(全部)
              await addAppAuthorAllFun(state.formData, () => state.submitLoading = false)
            } else {
              // TODO 调新增应用授权的接口(区间)
              await addAppAuthorOtherFun(state.formData, () => state.submitLoading = false)
            }
            ElMessage.success('新增成功')
          }
          funMethods.hide()
          state.visible = false
          emit('onCompleted')
        })
      },
    }

    return {
      rulesForm,
      ruleFormRef,
      formLabelWidth,
      ...toRefs(state),
      ...funMethods
    }
  }
})

</script>
<style lang='scss' scoped>
.el-button--primary {
  background-color: #1c6cdd;
}
</style>