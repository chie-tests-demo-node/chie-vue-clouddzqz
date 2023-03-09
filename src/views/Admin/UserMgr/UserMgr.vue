<template>
  <div class="userMgr">
    <div class="header">
      <el-card>
        <el-form :inline="true" :model="formVal">
          <div class="headerBox">
            <div class="searchContent">
              <el-form-item label="用户名称">
                <el-input maxlength="20" v-model="formVal.username" style="width: 273px" placeholder="请输入" />
              </el-form-item>
            </div>
            <div class="searchBtn">
              <el-button type="primary" @click="fetchData(1)">查询</el-button>
              <el-button @click="resetForm">重置</el-button>
            </div>
          </div>
        </el-form>
      </el-card>
    </div>
    <div class="Content">
      <el-card>
        <div class="exBtn">
          <el-button @click="onAdd">
            <template #icon>
              <el-icon color='#40b450'>
                <i class="iconfont icon-zengjia"></i>
              </el-icon>
              <!-- <i class="iconfont icon-plus"></i> -->
            </template>
            新增
          </el-button>
        </div>
        <Table :loading="fetchLoading" :colConfigs="column" :tableData="tableData" :rowKey="'id'">
          <template #state>
            <el-table-column label="状态" v-slot="scope">
              <el-switch @click="confirmChangeState(scope.row.id, scope.row.state)" :active-value="1"
                :model-value="scope.row.state" style="
                          --el-switch-on-color: rgb(26, 250, 41);
                          --el-switch-off-color: rgb(216, 30, 6);
                        " />
            </el-table-column>
          </template>
          <template #opt>
            <el-table-column label="操作" v-slot="scope">
              <a class="a_blue" @click="onEdit(scope.row)">编辑</a>
              <el-divider direction="vertical" />
              <a class="a_blue" @click="showPwdEditor(scope.row)">重置密码</a>
              <el-divider direction="vertical" />
              <a class="a_red" @click="confirmDelete(scope.row.id)">删除</a>
            </el-table-column>
          </template>
        </Table>
        <div class="pagination">
          <el-pagination v-model:current-page="pageNo" v-model:page-size="pageNumber" :page-sizes="pageSizes"
            :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="fetchData"
            @size-change="fetchData()" />
        </div>
        <div class="supportBottom"></div>
      </el-card>
    </div>
  </div>
  <UserEditor ref="editorRef" @onCompleted="onEditorSuccess" />
  <PwdEditor ref="pwdEditorRef" />
</template>

<script lang='ts'>
import { dfPageSize, pageSizes } from "@/config";
import { removeNullAttribute, unixtimeFormat } from "@/utils";
import { ElMessage, ElMessageBox } from "element-plus/es";
import { defineComponent, reactive, toRefs, ref, onMounted } from "vue";
import { userFetch, userStatusChange } from "@/api/userMgr";
import Table from "../../../components/TableV2/table.vue";
import UserEditor from "./components/UserEditor.vue";
import PwdEditor from "./components/PwdEditor.vue";
import "./UserMgr.scss";

export default defineComponent({
  components: { Table, UserEditor, PwdEditor },
  name: "app",
  setup() {
    const state = reactive({
      formVal: {
        username: "",
      },
      column: [
        { label: "用户名", prop: "username" },
        { slot: "state" },
        { label: "签章到期时间", prop: "sealEndTimeString" },
        { label: "创建时间", prop: "createTime" },
        { slot: "opt" },
      ],
      tableData: [],
      pageNo: 1,
      total: 0,
      pageNumber: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      editorRef: null,
      pwdEditorRef: null,
    });

    const funMethods = {
      resetForm: () => {
        state.formVal = {
          username: "",
        };
      },
      formatDate: (time: string | number, formatter?: string) => {
        return unixtimeFormat(time, formatter);
      },
      onAdd: () => {
        state.editorRef?.show();
      },
      onEdit: (editModel) => {
        state.editorRef?.show(editModel);
      },
      onEditorSuccess: (key) => {
        request.fetchData(key === "add" ? 1 : undefined);
      },
      confirmDelete: async (id) => {
        await ElMessageBox.confirm("确认删除?", "提示", {
          type: "warning",
        });
        request.deleteUser(id);
      },
      confirmChangeState: async (id, state) => {
        await ElMessageBox.confirm(
          `确认${state === 1 ? "停用" : "启用"}?`,
          "提示",
          {
            type: "warning",
          }
        );
        request.changeState(id, state);
      },
      showPwdEditor: (info) => {
        state.pwdEditorRef?.show(info);
      },
    };

    const request = {
      fetchData: async (dfCurrent?) => {
        var formParams = removeNullAttribute({ ...state.formVal });
        var pageNo = dfCurrent ?? state.pageNo;
        var pageNumber = state.pageNumber;
        var payload = { ...formParams, pageNo, pageNumber };
        state.fetchLoading = true;
        const fetchRsp = await userFetch(
          payload,
          () => (state.fetchLoading = false)
        );
        state.tableData = fetchRsp.data;
        state.total = fetchRsp.total;
        state.pageNo = pageNo;
      },
      deleteUser: async (id) => {
        state.fetchLoading = true;
        await userStatusChange(
          { id, state: 2 },
          () => (state.fetchLoading = false)
        );
        ElMessage.success("操作成功!");
        request.fetchData();
      },
      changeState: async (id, status) => {
        state.fetchLoading = true;
        await userStatusChange(
          { id, state: status === 1 ? 0 : 1 },
          () => (state.fetchLoading = false)
        );
        ElMessage.success("操作成功!");
        request.fetchData();
      },
    };

    onMounted(() => {
      request.fetchData();
    });

    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
    };
  },
});
</script>