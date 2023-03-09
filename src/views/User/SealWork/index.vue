<template>
  <div class="userMgr">
    <div class="header">
      <el-card>
        <el-form :inline="true" :model="formVal">
          <div class="headerBox">
            <div class="searchContent">
              <el-form-item label="任务名称">
                <el-input
                  maxlength="20"
                  v-model="formVal.taskName"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="标签">
                <el-input
                  maxlength="20"
                  v-model="formVal.tagName"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="formVal.status" style="width: 273px">
                  <el-option
                    v-for="item in status"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="searchBtn">
              <el-button type="primary" @click="fetchData">查询</el-button>
              <el-button @click="resetForm">重置</el-button>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>
    <div class="Content">
      <el-card>
        <div class="exBtn">
          <el-button @click="add">
            <template #icon>
              <!-- <i class="iconfont icon-plus"></i> -->
              <el-icon color="#40b450">
                <i class="iconfont icon-zengjia"></i>
              </el-icon>
            </template>
            新增
          </el-button>
        </div>
        <Table
          :loading="fetchLoading"
          :colConfigs="column"
          :tableData="tableData"
        >
          <template #status>
            <el-table-column label="状态" v-slot="scope">
              <span
                class="error"
                :class="{ isSuccess: scope.row.status == 1 }"
              ></span
              >{{ status[scope.row.status].name }}
            </el-table-column>
          </template>
          <template #tagNames>
            <el-table-column label="标签" v-slot="scope">
              <el-tag
                v-for="(item, index) in scope.row.tagNames"
                :key="index"
                >{{ item }}</el-tag
              >
            </el-table-column>
          </template>
          <template #createTime>
            <el-table-column label="添加时间" v-slot="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </el-table-column>
          </template>
          <template #opt>
            <el-table-column label="操作" v-slot="scope">
              <el-button text type="primary" @click="downLoad(scope.row)"
                >下载</el-button
              >
            </el-table-column>
          </template>
        </Table>
        <div class="pagination">
          <el-pagination
            v-model:current-page="current"
            v-model:page-size="pageSize"
            :page-sizes="pageSizes"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="fetchData"
            @size-change="fetchData"
          />
        </div>
        <div class="supportBottom"></div>
      </el-card>
    </div>
  </div>
  <SealWork
    :dialogSealVisible="dialogSealVisible"
    v-if="dialogSealVisible"
    @close="close"
    @openWork="openWork"
    ref="sealWork"
  ></SealWork>
  <SealWorkEdit
    :dialogSealWorkVisible="dialogSealWorkVisible"
    v-if="dialogSealWorkVisible"
    :mainImagelist="mainImagelist"
    :fileList="fileList"
    :sealData="sealData"
    @close="closePDF"
    ref="sealWorkEdit"
  ></SealWorkEdit>
  <!-- <UserEditor ref="editorRef" :onCompleted="onEditorSuccess" /> -->
</template>

<script lang="ts">
import { dfPageSize, pageSizes } from "@/config";
import {
  WorkList,
  DownSuccess,
  FileChange,
  SeakList,
} from "@/api/sealWork/index";
import { isNull, removeNullAttribute, unixtimeFormat } from "@/utils";
import { defineComponent, reactive, toRefs, ref, onMounted } from "vue";
import Table from "../../../components/TableV2/table.vue";
import SealWork from "./components/AddSealWork.vue";
import { formatDateTime } from "@/utils/Dayjs/index";
import SealWorkEdit from "./components/SealWork1.vue";
import { fileDown } from "@/utils/fileUrl";
import "./index.scss";

export default defineComponent({
  components: { Table, SealWork, SealWorkEdit },
  name: "app",
  setup() {
    const state = reactive({
      formVal: {
        taskName: "",
        status: "",
        tagName: "",
        remark: "",
        page: 1,
        size: 10,
      },
      status: [
        { name: "执行中", id: 0 },
        { name: "完成", id: 1 },
      ],
      sealData: {},
      fileList: [],
      mainImagelist: [],
      dialogSealVisible: false,
      dialogSealWorkVisible: false,
      sealWorkEdit: null,
      column: [
        { label: "任务名称", prop: "taskName" },
        { label: "签署方式", prop: "type" },
        { slot: "tagNames" },
        { slot: "status" },
        { label: "备注", prop: "remark" },
        { slot: "createTime" },
        { slot: "opt" },
      ],
      sealWork: null,
      tableData: [],
      current: 1,
      total: 0,
      pageSize: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      editorRef: null,
    });

    const funMethods = {
      resetForm: () => {
        state.formVal = {
          taskName: "",
          status: "",
          tagName: "",
          remark: "",
          page: 1,
          size: 10,
        };
      },
      currentChange: (page) => {
        state.formVal.page = page;
        request.fetchData();
      },
      sizeChange: (size) => {
        state.formVal.size = size;
        state.formVal.page = 1;
        request.fetchData();
      },
      //关闭pdf
      closePDF: () => {
        state.dialogSealWorkVisible = false;
        request.fetchData();
      },
      downLoad: (row) => {
        let url = "/task/downloadTaskFile";
        fileDown(url, { id: row.id });
      },
      add: () => {
        state.dialogSealVisible = true;
      },
      close: () => {
        state.dialogSealVisible = false;
      },
      onEditorSuccess: () => {
        request.fetchData();
      },
      getFile: () => {},
      openWork: async (data) => {
        state.sealData = data;
        const formData = new FormData();
        formData.append("file", data.formData.get("file"));
        formData.append("type", data.type);
        let result = await FileChange(formData, () => {
          state.sealWork.loading = false;
        });
        state.dialogSealVisible = false;
        state.fileList = result;
        funMethods.getSignList();
      },
      getSignList: async () => {
        let result = await SeakList({ type: (state.sealData as any).type });
        state.mainImagelist = result;
        setTimeout(() => {
          state.dialogSealWorkVisible = true;
        }, 300);
        // state.mainImagelist = result;
        // api.getPDf(0);
      },
    };

    const request = {
      fetchData: async () => {
        state.fetchLoading = true;
        let result = await WorkList(state.formVal);
        state.tableData = result.list || [];
        state.total = result.total;
        state.fetchLoading = false;
      },
      // deleteUser: (id) => {
      //   //请求接口todo
      //   console.info(id);
      //   request.fetchData();
      // },
      // changeState: (id, state) => {
      //   console.info("id", id);
      //   console.info("state", state);
      // },
    };

    onMounted(() => {
      request.fetchData();
    });

    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
      formatDateTime,
    };
  },
});
</script>
<style lang="scss" scoped>
::v-deep .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
.error {
  height: 10px;
  width: 10px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 10px;
  background: red;
}
.isSuccess {
  height: 10px;
  width: 10px;
  display: inline-block;
  background: #20fa2e;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
