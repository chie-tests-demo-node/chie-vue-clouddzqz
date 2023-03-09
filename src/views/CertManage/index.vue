<template>
  <div class="certManage">
    <div class="cert-btn">
      <el-button type="primary" @click="selectFile">
        {{ fileName ? '重新上传' : '上传' }}
      </el-button>
      <span class="tip">{{ fileName ? fileName : '未选择任何文件' }}
        <a v-if="fileName" class="clearFile" @click="clearFile">
          <i class="iconfont icon-close"></i>
        </a>
      </span>
      <div class="cerTip">请上传1M以内的.cer文件</div>
      <input type="file" style="display: none" :id="inputId" :maxSize="maxSize" :accept="accept" @input="onFileChange" />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs } from 'vue'
import FileUpload from "@/components/CusForm/FileUpload/FileUpload.vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { uploadRootCert } from '@/api/rootCert';
import { isNull, newGuid } from '@/utils';

export default defineComponent({
  components: { FileUpload },
  name: 'app',
  setup() {
    const state = reactive({
      inputId: newGuid(),
      rootCert: null,
      accept: 'application/pkix-cert,application/x-x509-ca-cert,.cer',
      maxSize: 1 * 1024 * 1024,
      fileName: null,
    })
    const funMethods = {
      getInput: () => {
        return document.getElementById(state.inputId);
      },
      selectFile: () => {
        funMethods.getInput().click();
      },
      clearFile: () => {
        funMethods.onlyClearSelf();
      },
      onlyClearSelf: () => {
        (funMethods.getInput() as any).value = "";
        state.fileName = ''
      },
      onFileChange: async (e: any) => {
        const files = e.target.files;
        const file = files[0];
        const formData = new FormData()
        formData.append('files', file)
        state.fileName = file.name
        if (!isNull(state.accept)) {
          var accepts = state.accept?.split(",");
          if (!isNull(accepts) && accepts!.length > 0) {
            if (accepts?.indexOf(file.type) === -1) {
              ElMessageBox.alert("请上传指定类型的文件", "提示", {
                type: "error",
              });
              funMethods.clearFile();
              return;
            }
          }
        }
        if (state.maxSize && state.maxSize > 0 && file.size > state.maxSize) {
          ElMessageBox.alert("文件大小超过最大限制", "提示", {
            type: "error",
          });
          funMethods.clearFile();
          return;
        }
        await uploadRootCert(formData, () => { })
        ElMessage.success('上传成功')
      },
    }
    const requestMethods = {}
    return {
      ...toRefs(state),
      ...funMethods,
      ...requestMethods
    }
  }
})

</script>
<style lang='scss' scoped>
.certManage {
  height: 100%;
  width: 100%;
  background-color: #fff;

  .cert-btn {
    padding-top: 30px;
    margin-left: 20px;

    .tip {
      margin-left: 10px;
    }

    .cerTip {
      margin-top: 10px;
    }

    .clearFile {
      color: red;
      cursor: pointer;
    }
  }
}
</style>