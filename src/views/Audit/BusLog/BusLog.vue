<template>
  <div class="busLog" v-loading="pageLoading">
    <div class="header">
      <el-card>
        <el-form :inline="true" :model="formVal" label-width="84px">
          <div class="headerBox">
            <div class="searchContent">
              <el-form-item label="操作人姓名">
                <el-input maxlength="20" v-model="formVal.username" style="width: 273px" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="角色类型">
                <el-select clearable v-model="formVal.roleType" style="width: 273px">
                  <el-option v-for="item in roleTypeEnum" :key="item.code" :label="item.message" :value="item.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作菜单">
                <el-select clearable v-model="formVal.operateMenu" style="width: 273px">
                  <el-option v-for="item in menuTypeEnum" :key="item.code" :label="item.message" :value="item.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作类型">
                <el-select clearable v-model="formVal.operateType" style="width: 273px">
                  <el-option v-for="item in optTypeEnum" :key="item.code" :label="item.message" :value="item.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作结果">
                <el-select clearable v-model="formVal.operateReturn" style="width: 273px">
                  <el-option v-for="item in optRstEnum" :key="item.code" :label="item.message" :value="item.code" />
                </el-select>
              </el-form-item>
              <div style="width: 685px; min-width: 685px; max-width: 685px;">
                <el-form-item label="&nbsp;&nbsp;&nbsp;操作时间">
                  <el-date-picker v-model="formVal.createTime" type="datetime" :format="'YYYY-MM-DD HH:mm:ss'"
                    style="width: 273px" />
                </el-form-item>
                <span class="timeSplit">至</span>
                <el-form-item>
                  <el-date-picker maxlength="20" v-model="formVal.endTime" type="datetime" :format="'YYYY-MM-DD HH:mm:ss'"
                    style="width: 273px" />
                </el-form-item>
              </div>
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
          <el-button type="primary" @click="audit" :disabled="fetchLoading">审计</el-button>
        </div>
        <Table
          :loading="fetchLoading"
          :colConfigs="column"
          :tableData="tableData"
          :rowKey="'id'"
          :selectable="(row) => row.auditState === 1"
          ref="tableRef"
        >
          <template #auditStateMessage>
            <el-table-column label="审计状态" v-slot="scope">
              <span style="color: red" v-if="scope.row.auditState === 3">
                审计失败
              </span>
              <span v-else>
                {{ scope.row.auditStateMessage }}
              </span>
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
</template>

<script lang='ts'>
import { dfPageSize, pageSizes } from "@/config";
import { isNullArray, momentFormat, removeNullAttribute } from "@/utils";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { sealLogAudit, sealLogEnumQuery, sealLogFetch } from "@/api/busLog";
import Table from "../../../components/TableV2/table.vue";
import "./BusLog.scss";
import { ElMessage } from "element-plus";
export default defineComponent({
  components: { Table },
  name: "app",
  setup() {
    const state = reactive({
      formVal: {
        username: "",
        roleType: "",
        operateMenu: "",
        operateType: "",
        operateReturn: "",
        createTime: "",
        endTime: "",
      },
      roleTypeEnum: [],
      menuTypeEnum: [],
      optTypeEnum: [],
      optRstEnum: [],
      tableData: [],
      pageNo: 1,
      total: 0,
      pageNumber: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      pageLoading: false,
      tableRef: null,
    });
    const column = [
      { slot: "selection" },
      { label: "操作人姓名", prop: "username" },
      { label: "角色类型", prop: "roleName" },
      { label: "操作菜单", prop: "operateMenuMessage" },
      { label: "操作类型", prop: "operateTypeMessage" },
      { label: "操作对象", prop: "operateObject" },
      { label: "操作结果", prop: "operateReturnMessage" },
      { label: "备注", prop: "remark" },
      { label: "创建时间", prop: "createTime" },
      { slot: "auditStateMessage" },
    ];
    const funMethods = {
      resetForm: () => {
        state.formVal = {
          username: "",
          roleType: "",
          operateMenu: "",
          operateType: "",
          operateReturn: "",
          createTime: "",
          endTime: "",
        };
      },
    };
    const request = {
      fetchData: async (dfCurrent?) => {
        var formParams = removeNullAttribute({ ...state.formVal });
        var pageNo = dfCurrent ?? state.pageNo;
        var pageNumber = state.pageNumber;
        if (formParams.createTime) {
          formParams.createTime = momentFormat(formParams.createTime);
        }
        if (formParams.endTime) {
          formParams.endTime = momentFormat(formParams.endTime);
        }
        var payload = { ...formParams, pageNo, pageNumber };
        state.fetchLoading = true;
        const fetchRsp = await sealLogFetch(
          payload,
          () => (state.fetchLoading = false)
        );
        state.tableData = fetchRsp.data;
        state.total = fetchRsp.total;
        state.pageNumber = pageNumber;
        state.pageNo = pageNo;
      },
      enumSearch: async () => {
        state.pageLoading = true;
        const roleTypeEnum = await sealLogEnumQuery(
          1,
          () => (state.pageLoading = false)
        );
        const menuTypeEnum = await sealLogEnumQuery(
          2,
          () => (state.pageLoading = false)
        );
        const optTypeEnum = await sealLogEnumQuery(
          3,
          () => (state.pageLoading = false)
        );
        const optRstEnum = await sealLogEnumQuery(
          4,
          () => (state.pageLoading = false)
        );
        state.pageLoading = false;
        state.roleTypeEnum = roleTypeEnum;
        state.menuTypeEnum = menuTypeEnum;
        state.optTypeEnum = optTypeEnum;
        state.optRstEnum = optRstEnum;
      },
      audit: async () => {
        const selectedKeys = state.tableRef?.getSelectionKeys();
        if (isNullArray(selectedKeys)) {
          ElMessage.error("请选择要审计的数据");
          return;
        }
        state.fetchLoading = true;
        await sealLogAudit(selectedKeys, () => (state.fetchLoading = false));
        state.tableRef?.clearSelection();
        ElMessage.success("操作成功");
        request.fetchData();
      },
    };
    onMounted(async () => {
      await request.enumSearch();
      await request.fetchData();
    });
    return {
      ...toRefs(state),
      ...funMethods,
      ...request,
      column,
    };
  },
});
</script>
<style lang='scss' scoped></style>