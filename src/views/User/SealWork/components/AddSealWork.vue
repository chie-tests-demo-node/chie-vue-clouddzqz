<template>
  <el-dialog
    v-if="dialogSealVisible"
    v-model="dialogSealVisible"
    :title="'新增盖章任务'"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form
      :model="formVal"
      label-width="110px"
      :rules="formRules"
      ref="formRef"
    >
      <el-form-item label="任务名称" prop="taskName">
        <el-input v-model="formVal.taskName" maxlength="50" />
      </el-form-item>
      <el-form-item label="签署方式" prop="type">
        <el-radio-group v-model="formVal.type">
          <el-radio :label="'pdf'">pdf</el-radio>
          <el-radio :label="'ofd'">ofd</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="标签" prop="tagNames" class="form-item-tag">
        <!-- <el-input v-model="formVal.tagNames" maxlength="20" /> -->
        <el-tag
          v-for="(tag, index) in formVal.tagNames"
          :key="index"
          closable
          @close="hanleClose"
          >{{ tag }}</el-tag
        >
        <el-input
          v-if="inputVisible"
          v-model="inputValue"
          ref="inputRef"
          @keyup.enter="handleInput"
          @blur="handleInput"
          class="input-tags"
        ></el-input>
        <el-tag v-else effect="plain" @click="showInput"> + 添加标签</el-tag>
      </el-form-item>
      <el-form-item label="盖章文件" prop="endTime">
        <el-upload
          v-model:file-list="fileList"
          class="upload-demo"
          ref="upload"
          action="#"
          multiple
          accept=".pdf,.ofd,.rar,.zip,.doc,.docx,.jpg"
          :headers="headers"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :before-upload="handleFileUploader"
          :http-request="httpRequest"
          :on-exceed="handleExceed"
          :on-success="onSuccess"
          :limit="2"
        >
          <el-button type="primary">选择文件</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formVal.remark"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          maxlength="200"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit" :loading="loading"
          >确认</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import AuthEditor from "@/components/AuthEditor/AuthEditor.vue";
import { ElMessage } from "element-plus";
import moment from "moment";
import { defineComponent, nextTick, reactive, toRefs } from "vue";
// import "./UserEditor.scss";
export default defineComponent({
  components: { AuthEditor },
  props: ["dialogSealVisible"],
  emits: ["close", "openWork"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      inputValue: "",
      inputVisible: false,
      inputRef: null,
      loading: false,
      tags: [],
      formVal: {
        taskName: "",
        tagNames: [],
        remark: "",
        type: "pdf",
      },
      headers: {},
      formRef: null,
      upload: null,
      fileList: [],
      formRules: {
        taskName: [
          { required: true, message: "请输入任务名称" },
          { max: 50, message: "名称长度不能超过50位" },
        ],
        tagNames: [{ required: true, message: "请添加标签", trigger: "blur" }],
        remark: [
          { required: true, message: "请输入备注" },
          { max: 200, message: "备注长度不能超过200位" },
        ],
        type: [{ required: true, message: "请选择签署方式" }],
      },
      formData: {},
      isUpload: false,
    });

    const funMethods = {
      submit: async () => {
        state.formRef.validate((valid: boolean) => {
          if (valid) {
            state.loading = true;
            if (!state.isUpload) {
              ElMessage.error("请先上传文件");
              return;
            }
            const formData = new FormData();
            formData.append("file", (state.formData as any).get("file"));
            emit("openWork", { formData: formData, ...state.formVal });
            return;
          }
        });
      },
      hanleClose: (tag) => {
        state.formVal.tagNames.splice(state.formVal.tagNames.indexOf(tag), 1);
      },
      handleInput: (tag) => {
        if (state.inputValue) {
          state.formVal.tagNames.push(state.inputValue);
        }
        state.inputVisible = false;
        state.inputValue = "";
      },
      showInput: (tag) => {
        state.inputVisible = true;
        nextTick(() => {
          state.inputRef.input!.focus();
        });
      },
      handleRemove: () => {
        state.isUpload = false;
      },
      handleFileUploader: (file) => {
        //rar和doc文件类型不一致  通过name的后缀判断文件类型
        let typeList = file.name.split(".");
        let type = typeList[typeList.length - 1]; //.最后一个为类型
        //.pdf,.ofd,.rar,.zip,.doc,.docx
        if (
          type == "pdf" ||
          type == "zip" ||
          type == "ofd" ||
          type == "rar" ||
          type == "doc" ||
          type == "docx" ||
          type == "jpg"
        ) {
          if (type == "rar" || type == "zip") {
            const isLt20M = file.size / 1024 / 1024 < 20;
            if (!isLt20M) {
              ElMessage.error("上传的.zip,.rar文件大小不能超过20M！");
            }
            return isLt20M;
          } else {
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
              ElMessage.error(
                "上传的.pdf,.ofd,.doc,.docx,.jpg文件大小不能超过2M！"
              );
            }
            return isLt2M;
          }
        } else {
          ElMessage.error(
            "上传的文件格式错误，应为.pdf .ofd .rar .zip .doc .docx,.jpg文件"
          );
          return false;
        }
      },
      handleExceed: () => {
        ElMessage.error("最多只能上传1个文件！");
      },
      //限制第二次上传删除第一次的文件
      handleChange: (file, fileList) => {
        state.fileList = fileList.slice(-1);
      },
      httpRequest: (file) => {
        state.isUpload = true;
        const formData = new FormData();
        formData.append("file", file.file);
        state.formData = formData;
      },
      onSuccess: (res) => {
        console.log(res);
      },
      close: () => {
        emit("close");
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
    };
  },
});
</script>
<style lang="scss" scoped>
::v-deep .el-upload__tip {
  font-size: 20px;
  color: red;
  font-weight: bold;
}
.input-tags {
  width: 100px;
}
.form-item-tag {
  ::v-deep .el-form-item__content {
    display: flex;
  }
}
::v-deep .el-upload-list {
  width: 400px !important;
}
::v-deep .el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
  margin-top: 7px;
}
</style>
