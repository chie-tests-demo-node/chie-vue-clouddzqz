<template>
  <div class="fileUpload">
    <div>
      <el-button @click="selectFile" size="small" :disabled="props.disable">
        {{ currentFile?.name ? "重选文件" : "选择文件" }}
      </el-button>
    </div>
    <div class="tip">
      <div class="selected" v-if="currentFile?.name">
        <div class="fileName">
          <el-tooltip :content="currentFile?.name" placement="top">
            {{ currentFile?.name }}
          </el-tooltip>
        </div>
        <template v-if="!hideOpt">
          <el-divider direction="vertical" />
          <div>
            <a class="download" @click="downloadFile">
              <i class="iconfont icon-download"></i>
            </a>
          </div>
          <el-divider direction="vertical" />
          <div>
            <a class="clearFile" @click="clearFile">
              <i class="iconfont icon-close"></i>
            </a>
          </div>
        </template>
      </div>
      <div v-else class="unSelect">未选择文件</div>
    </div>
    <input style="display: none" type="file" :id="inputId" :accept="props.accept" @input="onFileChange" />
  </div>
  <div class="fileRemark">{{ props.fileTip }}</div>
</template>

<script lang="ts">
import { isNull, isNullArray, newGuid } from "@/utils";
import { ElMessageBox } from "element-plus/es";
import { defineComponent, reactive, toRefs } from "vue";
import "./FileUpload.scss";

export default defineComponent({
  props: ["value", "accept", "maxSize", "disable", "fileTip", "hideOpt",],
  emits: ["onChange"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      inputId: newGuid(),
      currentFile: {
        name: props.value?.name,
        file: props.value?.file,
      },
    });
    const funMethods = {
      updateVal: (val) => {
        emit("onChange", val);
      },
      getInput: () => {
        return document.getElementById(state.inputId);
      },
      selectFile: () => {
        funMethods.getInput().click();
      },
      clearFile: () => {
        funMethods.onlyClearSelf();
        funMethods.updateVal(null);
      },
      setFile: (currentFile) => {
        console.log(currentFile)
        state.currentFile = currentFile;
      },
      onlyClearSelf: () => {
        (funMethods.getInput() as any).value = "";
        state.currentFile = null;
      },
      onFileChange: (e) => {
        const files = e.target.files;
        if (isNullArray(files)) {
          funMethods.clearFile();
          return;
        }
        const file = files[0];
        console.info(file);
        if (!isNull(props.accept)) {
          var accepts = props.accept?.split(",");
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
        if (props.maxSize && props.maxSize > 0 && file.size > props.maxSize) {
          ElMessageBox.alert("文件大小超过最大限制", "提示", {
            type: "error",
          });
          funMethods.clearFile();
          return;
        }
        state.currentFile = { name: file.name, file };
        const reader = new FileReader();
        reader.onload = (ev) => {
          var base64Str: string = ev.target.result as any;
          funMethods.updateVal({ name: file.name, file: base64Str });
          state.currentFile.file = base64Str;
          // console.info(state.currentFile);
        };
        reader.readAsDataURL(file);
      },
      downloadFile: () => {
        let link = document.createElement("a");
        link.href = state.currentFile.file;
        link.download = state.currentFile.name;
        link.click();
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
      props,
    };
  },
});
</script>
<style lang="scss" scoped></style>
