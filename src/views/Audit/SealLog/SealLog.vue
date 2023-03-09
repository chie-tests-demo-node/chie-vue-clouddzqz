<template>
  <div class="sealLog" v-loading="enumLoading">
    <div class="header">
      <el-card>
        <el-form :inline="true" :model="formVal" label-width="84px">
          <div class="headerBox">
            <div class="searchContent">
              <el-form-item label="印章名称">
                <el-input
                  maxlength="20"
                  v-model="formVal.sealName"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="调试方式">
                <el-select
                  clearable
                  v-model="formVal.callMode"
                  style="width: 273px"
                >
                  <el-option
                    v-for="item in callTypeEnum"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="审计状态">
                <el-select clearable v-model="formVal.auditState">
                  <el-option
                    v-for="item in auditStateEnum"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <div style="width: 685px; min-width: 685px; max-width: 685px">
                <el-form-item label="&nbsp;&nbsp;&nbsp;操作时间">
                  <el-date-picker
                    v-model="formVal.beginTime"
                    type="datetime"
                    :format="'YYYY-MM-DD HH:mm:ss'"
                    style="width: 273px"
                  />
                </el-form-item>
                <span class="timeSplit">至</span>
                <el-form-item>
                  <el-date-picker
                    maxlength="20"
                    v-model="formVal.endTime"
                    type="datetime"
                    :format="'YYYY-MM-DD HH:mm:ss'"
                    style="width: 273px"
                  />
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
          <el-button type="primary" @click="logAudit" :disabled="fetchLoading"
            >审计</el-button
          >
        </div>
        <Table
          :loading="fetchLoading"
          :colConfigs="column"
          :tableData="tableData"
          rowKey="id"
          :selectable="(row) => row.auditState === '0'"
          ref="tabRef"
        >
          <template #callMode>
            <el-table-column label="调用方式" v-slot="scope">
              {{
                callTypeEnum.find((m) => m.value === scope.row.callMode)?.name
              }}
            </el-table-column>
          </template>
          <template #opResult>
            <el-table-column label="操作结果" v-slot="scope">
              {{ optRstEnum.find((m) => m.value === scope.row.opResult)?.name }}
            </el-table-column>
          </template>
          <template #auditState>
            <el-table-column label="审计状态" v-slot="scope">
              <span style="color: red" v-if="scope.row.auditState === '2'">
                审计失败
              </span>
              <span v-else>
                {{
                  auditStateEnum.find((m) => m.value === scope.row.auditState)
                    ?.name
                }}
              </span>
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
</template>

<script lang='ts'>
import { dfPageSize, pageSizes } from "@/config";
import { isNullArray, momentFormat, removeNullAttribute } from "@/utils";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import {
  callModeTypeQuery,
  opResultTypeQuery,
  auditStateTypeQuery,
  sealLogFetch,
  auditSealLog,
} from "@/api/sealLog";
import Table from "../../../components/TableV2/table.vue";
import "./SealLog.scss";
import { ElMessage } from "element-plus";
export default defineComponent({
  components: { Table },
  name: "app",
  setup() {
    const state = reactive({
      formVal: {
        sealName: "",
        callMode: "",
        auditState: "",
        beginTime: "",
        endTime: "",
      },
      tableData: [],
      current: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      tabRef: null,
      callTypeEnum: [],
      optRstEnum: [],
      auditStateEnum: [],
      enumLoading: false,
    });
    const column = [
      { slot: "selection" },
      { label: "印章名称", prop: "sealName" },
      { slot: "callMode" },
      { label: "操作者", prop: "operator" },
      { label: "盖章对象", prop: "opObject" },
      { slot: "opResult" },
      { label: "备注", prop: "remark" },
      { label: "创建时间", prop: "createTime" },
      { slot: "auditState" },
    ];
    const funMethods = {
      resetForm: () => {
        state.formVal = {
          sealName: "",
          callMode: "",
          auditState: "",
          beginTime: "",
          endTime: "",
        };
      },
    };
    const request = {
      fetchData: async (dfCurrent?) => {
        var formParams = removeNullAttribute({ ...state.formVal });
        var current = dfCurrent ?? state.current;
        var size = state.size;
        if (formParams.beginTime) {
          formParams.beginTime = momentFormat(formParams.beginTime);
        }
        if (formParams.endTime) {
          formParams.endTime = momentFormat(formParams.endTime);
        }
        var payload = { ...formParams, current, size };
        state.fetchLoading = true;
        const fetchRsp = await sealLogFetch(
          payload,
          () => (state.fetchLoading = false)
        );
        state.tableData = fetchRsp.records;
        state.total = fetchRsp.total;
        state.size = size;
        state.current = current;
      },
      queryCallModeType: async () => {
        const callTypeEnum = await callModeTypeQuery(
          () => (state.enumLoading = false)
        );
        state.callTypeEnum = callTypeEnum;
      },
      queryOpRstType: async () => {
        const optRstEnum = await opResultTypeQuery(
          () => (state.enumLoading = false)
        );
        state.optRstEnum = optRstEnum;
      },
      queryAuditState: async () => {
        const auditStateEnum = await auditStateTypeQuery(
          () => (state.enumLoading = false)
        );
        state.auditStateEnum = auditStateEnum;
      },
      logAudit: async () => {
        const selectedKeys = state.tabRef?.getSelectionKeys();
        if (isNullArray(selectedKeys)) {
          ElMessage.error("请选择要审计的数据");
          return;
        }
        state.fetchLoading = true;
        await auditSealLog(selectedKeys, () => (state.fetchLoading = false));
        state.tabRef?.clearSelection();
        ElMessage.success("操作成功");
        request.fetchData();
      },
    };
    onMounted(async () => {
      state.enumLoading = true;
      await request.queryCallModeType();
      await request.queryOpRstType();
      await request.queryAuditState();
      state.enumLoading = false;
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