<template>
  <div v-loading="enumLoading" class="certMgr">
    <div class="header">
      <el-card>
        <el-form :inline="true" :model="formVal">
          <div class="headerBox">
            <div class="searchContent">
              <el-form-item label="使用者名称">
                <el-input
                  maxlength="20"
                  v-model="formVal.commonName"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input
                  maxlength="20"
                  v-model="formVal.phone"
                  style="width: 273px"
                  placeholder="请输入"
                />
              </el-form-item>
              <el-form-item label="证书类型">
                <el-select
                  clearable
                  v-model="formVal.certType"
                  style="width: 273px"
                >
                  <el-option
                    v-for="item in certTypeEnum"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
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
          <el-button @click="showApplyCert">
            <template #icon>
              <el-icon color="#40b450">
                <i class="iconfont icon-zengjia"></i>
              </el-icon>
              <!-- <i class="iconfont icon-plus"></i> -->
            </template>
            申请证书
          </el-button>
          <el-button class="addicon" @click="showImportPFX">
            <template #icon>
              <i class="iconfont icon-daoru"></i>
            </template>
            导入PFX证书
          </el-button>
        </div>
        <Table
          :loading="fetchLoading"
          :colConfigs="column"
          :tableData="tableData"
        >
          <template #phone>
            <el-table-column label="电话" v-slot="scope">
              {{ encryptionPhone(scope.row.phone) }}
            </el-table-column>
          </template>
          <template #certType>
            <el-table-column label="证书类型" v-slot="scope">
              {{
                certTypeEnum.find((m) => m.value === scope.row.certType)?.name
              }}
            </el-table-column>
          </template>
          <template #applyType>
            <el-table-column label="申请方式" v-slot="scope">
              {{
                certApplyTypeEnum.find((m) => m.value === scope.row.applyMode)
                  ?.name
              }}
            </el-table-column>
          </template>
          <template #certStatus>
            <el-table-column label="证书状态" v-slot="scope">
              {{
                certStatusEnum.find((m) => m.value === scope.row.state)?.name
              }}
            </el-table-column>
          </template>
          <template #opt>
            <el-table-column label="操作" v-slot="scope" width="300">
              <span v-if="scope.row.state == 0">
                <a class="a_blue" @click="showEditCert(scope.row)">编辑</a>
                <el-divider direction="vertical" />
                <a class="a_blue" @click="showImportCert(scope.row)"
                  >导入证书</a
                >
                <el-divider direction="vertical" />
                <a class="a_blue" @click="exportP10(scope.row.id)">导出P10</a>
                <el-divider direction="vertical" />
              </span>
              <a class="a_blue" @click="showCertInfo(scope.row)">详情</a>
              <el-divider direction="vertical" />
              <a class="a_red" @click="confirmLogoutCert(scope.row.id)">注销</a>
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
  <CertInfo ref="certInfoRef" />
  <ImportCert ref="importCertRef" @onCompleted="fetchData(1)" />
  <CertEditor ref="editorRef" @onCompleted="onEditorSuccess" />
  <ImportPFXCert ref="pfxRef" @onCompleted="fetchData(1)" />
</template>

<script lang='ts'>
import { dfPageSize, getBaseUrl, pageSizes } from "@/config";
import { removeNullAttribute, unixtimeFormat, encryptionPhone } from "@/utils";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import { ElMessage, ElMessageBox } from "element-plus/es";
import {
  certApplyTypeQuery,
  certFetch,
  certLogout,
  certStatusTypeQuery,
  certTypeQuery,
  exportP10,
} from "@/api/certMgr";
import Table from "../../../components/TableV2/table.vue";
import CertInfo from "./components/CertInfo/CertInfo.vue";
import ImportCert from "./components/ImportCert/ImportCert.vue";
import CertEditor from "./components/CertEditor/CertEditor.vue";
import ImportPFXCert from "./components/ImportPFXCert/ImportPFXCert.vue";
import "./CertMgr.scss";

export default defineComponent({
  components: { Table, CertInfo, ImportCert, CertEditor, ImportPFXCert },
  name: "app",
  setup() {
    const state = reactive({
      formVal: {
        commonName: "",
        phone: "",
        certType: "",
      },
      tableData: [],
      current: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      fetchLoading: false,
      certTypeEnum: [],
      certApplyTypeEnum: [],
      certStatusEnum: [],
      certInfoRef: null,
      importCertRef: null,
      editorRef: null,
      pfxRef: null,
      enumLoading: false,
    });
    const column = [
      { label: "使用者名称", prop: "commonName" },
      { label: "证书有效期", prop: "expire" },
      { label: "CN项", prop: "address" },
      { slot: "phone" },
      { slot: "certType" },
      { slot: "applyType" },
      { slot: "certStatus" },
      { label: "添加时间", prop: "createTime", width: 170 },
      { slot: "opt" },
    ];
    const funMethods = {
      resetForm: () => {
        state.formVal = {
          commonName: "",
          phone: "",
          certType: "",
        };
      },
      formatDate: unixtimeFormat,
      confirmLogoutCert: async (id) => {
        await ElMessageBox.confirm("确认注销?", "提示", { type: "warning" });
        request.logoutCert(id);
      },
      showCertInfo: (row) => {
        state.certInfoRef?.show(row);
      },
      showImportCert: (row) => {
        state.importCertRef?.show(row);
      },
      showApplyCert: () => {
        state.editorRef?.show();
      },
      showEditCert: (row) => {
        state.editorRef?.show(row);
      },
      showImportPFX: () => {
        state.pfxRef?.show();
      },
      onEditorSuccess: (key) => {
        request.fetchData(key === "add" ? 1 : undefined);
      },
      dowloadUrl: (id) => {
        return `${getBaseUrl()}/cert/csr/export?id=${id}`;
      },
    };
    const request = {
      fetchData: async (dfCurrent?) => {
        var formParams = removeNullAttribute({ ...state.formVal });
        var current = dfCurrent ?? state.current;
        var size = state.size;
        var payload = { ...formParams, current, size };
        state.fetchLoading = true;
        const fetchRsp = await certFetch(
          payload,
          () => (state.fetchLoading = false)
        );
        state.tableData = fetchRsp.records;
        state.total = fetchRsp.total;
        state.size = size;
        state.current = current;
      },
      logoutCert: async (id) => {
        state.fetchLoading = true;
        await certLogout({ id }, () => (state.fetchLoading = false));
        ElMessage.success("注销完成");
        //删除完成后刷新列表
        request.fetchData();
      },
      queryCertType: async () => {
        const certTypeEnum = await certTypeQuery(
          () => (state.enumLoading = false)
        );
        state.certTypeEnum = certTypeEnum;
      },
      queryApplyType: async () => {
        const certApplyTypeEnum = await certApplyTypeQuery(
          () => (state.enumLoading = false)
        );
        state.certApplyTypeEnum = certApplyTypeEnum;
      },
      queryCertStatusType: async () => {
        const certStatusEnum = await certStatusTypeQuery(
          () => (state.enumLoading = false)
        );
        state.certStatusEnum = certStatusEnum;
      },
      exportP10: async (id) => {
        state.fetchLoading = true;
        await exportP10({ id }, () => (state.fetchLoading = false));
        ElMessage.success("下载成功");
      },
      encryptionPhone,
    };
    onMounted(async () => {
      state.enumLoading = true;
      await request.queryCertType();
      await request.queryApplyType();
      await request.queryCertStatusType();
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