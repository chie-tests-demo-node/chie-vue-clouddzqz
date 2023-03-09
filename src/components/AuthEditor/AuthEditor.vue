<template>
  <el-dialog v-if="visible" v-model="visible" title="应用授权" width="800px" :close-on-click-modal="false"
    :close-on-press-escape="false" :show-close="false" @close="hide">
    <div class="authEditor">
      <div class="searchHeader">
        <div class="searchContent">
          <el-form :inline="true" :model="formVal" ref="formRef">
            <el-form-item label="印章类型">
              <el-select clearable v-model="formVal.sealType">
                <el-option v-for="item in certTypeOpt" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="印章名称">
              <el-input v-model="formVal.sealName" />
            </el-form-item>
          </el-form>
        </div>
        <div class="searchBtn">
          <el-button type="primary" @click="fetchData(1)">查询</el-button>
          <el-button @click="resetData">重置</el-button>
        </div>
      </div>
      <div class="content">
        <Table :loading="fetchLoading" :colConfigs="column" :tableData="tableData" :rowKey="'id'" ref="tabRef">
          <!-- <template #sealType>
            <el-table-column label="印章类型" v-slot="scope">
              {{ certTypeEnum[scope.row.sealType] }}
            </el-table-column>
          </template> -->
        </Table>
        <div class="pagination">
          <el-pagination background v-model:current-page="page" v-model:page-size="size" :page-sizes="pageSizes"
            :total="total" layout="total, sizes, prev, pager, next, jumper" @current-change="fetchData"
            @size-change="fetchData()" />
        </div>
      </div>
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="hide">取消</el-button>
        <el-button type="primary" @click="finish">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs } from "vue";
import { dfPageSize, pageSizes } from "@/config";
import { removeNullAttribute, isNullArray } from "@/utils";
import { getSelectOption, sealTypeEnum, tempOptions } from "@/utils/enums";
import Table from "@/components/TableV2/table.vue";
import { querySealList } from "@/api/operator/AppAuthor";
import "./AuthEditor.scss";
export default defineComponent({
  props: [],
  emits: ["onCompleted", "onCancel"],
  name: "app",
  components: { Table },
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      formVal: {
        sealType: "",
        sealName: "",
      },
      formRef: null,
      tableData: [],
      page: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      certTypeEnum: sealTypeEnum,
      // certTypeOpt: getSelectOption(sealTypeEnum),
      certTypeOpt: tempOptions,
      tabRef: null,
    });
    const column = [
      { slot: "selection" },
      { label: "印章名称", prop: "sealName" },
      { label: "印章编码", prop: "sealCode" },
      { label: "印章类型", prop: "sealTypeCodeName" },
      { label: "有效期", prop: "expireTime" },
    ];
    const funMethods = {
      show: (dfSelectedKeys?) => {
        state.visible = true;
        setTimeout(() => {
          state.tabRef?.setReserveKeys(dfSelectedKeys ?? []);
          request.fetchData();
        }, 100);
      },
      hide: () => {
        state.visible = false;
        state.formVal.sealName = ''
        state.formVal.sealType = ''
        emit("onCancel");
      },
      finish: () => {
        const selectedKeys = state.tabRef.getSelectionKeys();
        // if (isNullArray(selectedKeys)) {
        // ElMessage.error("请选择要授权的内容");
        // return;
        // }
        emit("onCompleted", selectedKeys);
        funMethods.hide();
      },
      resetData() {
        state.formVal.sealName = ''
        state.formVal.sealType = ''
        request.fetchData()
      }
    };
    const request = {
      fetchData: async (dfCurrent?) => {
        var formParams = removeNullAttribute({ ...state.formVal });
        var page = dfCurrent ?? state.page;
        var size = state.size;
        var payload = { ...formParams, page, size };
        state.fetchLoading = true;
        const fetchRsp = await querySealList(
          payload,
          () => (state.fetchLoading = false)
        );
        state.tableData = fetchRsp.list;
        state.total = fetchRsp.total;
        state.size = size;
        state.page = page;
        setTimeout(() => {
          state.tabRef?.toggleRowSelection();
        }, 100);
      },
    };
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