<template>
  <div class="trustMgr">
    <div class="header">
      <el-card>
        <el-form :inline="true" :model="formVal">
          <div class="headerBox">
            <div class="searchContent">
              <el-form-item label="机构名称">
                <el-input
                  maxlength="20"
                  v-model="formVal.caName"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="联系人">
                <el-input
                  maxlength="20"
                  v-model="formVal.contacts"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input
                  maxlength="20"
                  v-model="formVal.contactWay"
                  style="width: 273px"
                  placeholder="请输入"
                />
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
              <el-icon color="#40b450">
                <i class="iconfont icon-zengjia"></i>
              </el-icon>
              <!-- <i class="iconfont icon-plus"></i> -->
            </template>
            新增
          </el-button>
        </div>
        <Table
          rowKey="id"
          :loading="fetchLoading"
          :colConfigs="column"
          :tableData="tableData"
        >
          <template #contactWay>
            <el-table-column label="联系电话" v-slot="scope">
              {{ encryptionPhone(scope.row.contactWay) }}
            </el-table-column>
          </template>
          <template #opt>
            <el-table-column label="操作" v-slot="scope">
              <a class="a_blue" @click="onEdit(scope.row)">编辑</a>
              <el-divider direction="vertical" />
              <a class="a_red" @click="confirmDelete(scope.row.id)">删除</a>
            </el-table-column>
          </template>
        </Table>
        <div class="pagination">
          <el-pagination
            v-model:current-page="current"
            v-model:page-size="size"
            :page-sizes="pageSizes"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="fetchData"
            @size-change="fetchData()"
          />
        </div>
        <div class="supportBottom"></div>
      </el-card>
    </div>
  </div>
  <TrustEditor ref="editorRef" @onCompleted="onEditorSuccess" />
</template>

<script lang='ts'>
import { dfPageSize, pageSizes } from "@/config";
import { removeNullAttribute, unixtimeFormat, encryptionPhone } from "@/utils";
import { ElMessageBox } from "element-plus/es";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { trustDelete, trustFetch } from "@/api/trust";
import { ElMessage } from "element-plus/es";
import Table from "../../../components/TableV2/table.vue";
import TrustEditor from "./components/TurstEditor.vue";
import "./TrustMgr.scss";
export default defineComponent({
  components: { Table, TrustEditor },
  name: "app",
  setup() {
    const state = reactive({
      formVal: {
        caName: "",
        contacts: "",
        contactWay: "",
      },
      column: [
        { label: "机构名称", prop: "caName" },
        { label: "OCSP地址", prop: "ocspIp" },
        { label: "OCSP端口", prop: "ocspPort" },
        { label: "联系人", prop: "contacts" },
        { slot: "contactWay" },
        { label: "备注", prop: "remark" },
        { label: "添加时间", prop: "createTime" },
        { slot: "opt" },
      ],
      tableData: [],
      current: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      editorRef: null,
    });
    const funMethods = {
      formatDate: (time: string | number, formatter?: string) => {
        return unixtimeFormat(time, formatter);
      },
      confirmDelete: async (id) => {
        await ElMessageBox.confirm("确认删除?", "提示", { type: "warning" });
        request.delete(id);
      },
      resetForm: () => {
        state.formVal = {
          caName: "",
          contacts: "",
          contactWay: "",
        };
      },
      onAdd: () => {
        state.editorRef.show();
      },
      onEdit: (editModel) => {
        state.editorRef.show(editModel);
      },
      onEditorSuccess: (type) => {
        request.fetchData(type === "add" ? 1 : undefined);
      },
      encryptionPhone,
    };
    const request = {
      fetchData: async (dfCurrent?: number) => {
        var formParams = removeNullAttribute({ ...state.formVal });
        var current = dfCurrent ?? state.current;
        var size = state.size;

        var payload = { ...formParams, current, size };
        state.fetchLoading = true;
        const fetchRsp = await trustFetch(payload, () => {
          state.fetchLoading = false;
        });
        state.tableData = fetchRsp?.records;
        state.total = fetchRsp?.total;
        state.size = size;
        state.current = current;
      },
      delete: async (id) => {
        state.fetchLoading = true;
        await trustDelete({ id }, () => (state.fetchLoading = false));
        ElMessage.success("删除成功!");
        request.fetchData();
      },
    };

    onMounted(() => {
      request.fetchData(1);
    });

    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
    };
  },
});
</script>