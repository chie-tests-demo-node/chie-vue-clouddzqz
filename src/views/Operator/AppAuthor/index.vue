<template>
  <div class="seal-tem">
    <el-card class="seal-template">
      <el-form :inline="true" style="display:flex" :model="form">
        <div class="form-item">
          <div class="flex-content">
            <el-form-item label="应用名称" label-width="80px">
              <el-input v-model="form.companyName" style="width: 273px" placeholder="请输入"></el-input>
            </el-form-item>
          </div>
          <div class="btns">
            <el-button type="primary" @click="searchSeal">查询</el-button>
            <el-button type="default" @click="resetForm">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
    <el-card>
      <el-button type="default" @click="showDia">
        <template #icon>
          <el-icon color='#40b450'>
            <i class="iconfont icon-zengjia"></i>
          </el-icon>
        </template> &nbsp;新增
      </el-button>
      <Table :loading="loading" class="table-class" :colConfigs="colConfigs" :tableData="tableList" :maxHeight="1000">
        <template #timecon>
          <el-table-column label="有效期" v-slot="scope"> {{ scope.row.timecon }} </el-table-column>
        </template>
        <template #createTime>
          <el-table-column label="创建时间" v-slot="scope"> {{ scope.row.createTime }} </el-table-column>
        </template>
        <template #option>
          <el-table-column label="操作" fixed="right" min-width="140" v-slot="scope">
            <div>
              <el-button title="下载" link type="primary" @click="uploadFile(scope.row.id)"> 下载 </el-button>
              <el-button title="编辑" link type="primary" @click="showDia(scope.row.id)"> 编辑 </el-button>
              <el-button title="删除" link type="danger" @click="deleteApp(scope.row.id)"> 删除 </el-button>
            </div>
          </el-table-column>
        </template>
      </Table>
      <div class="footer-pagination">
        <el-pagination v-model:current-page="page" v-model:page-size="size" :page-sizes="pageSizes"
          @current-change="queryList" @size-change="queryList" :total="total"
          layout="total, sizes, prev, pager, next, jumper" />
      </div>
    </el-card>
    <NewAppAuthor ref="appAuthorRef" @onCompleted="onCompleted" />
  </div>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs, onMounted } from "vue";
import Table from "@/components/TableV2/table.vue";
import { removeNullAttribute } from "@/utils";
import { appAuthorTitle } from "@/utils/ListConfig/index";
import Pagination from '@/components/Pagination/index.vue';
import NewAppAuthor from "./components/NewAppAuthor.vue";
import { dfPageSize, pageSizes } from "@/config";
import { ElMessage, ElMessageBox } from "element-plus";
import { deleteAppAuthor, downloadFile, queryIdList, querySealBigList } from "@/api/operator/AppAuthor";
import { downloadFileByPostStream } from "@/utils/fileUrl";
import { apiDownload } from "@/api/axiosv2";
export default defineComponent({
  name: "app",
  components: { Table, Pagination, NewAppAuthor },
  setup() {
    const state = reactive({
      loading: false,
      colConfigs: Object.freeze(appAuthorTitle),
      form: { companyName: '', },
      tableList: [],
      page: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      appAuthorRef: null,
    });

    const funMethods = {
      searchSeal() {
        const formData = removeNullAttribute({ ...state.form })
        requestMethods.queryList(formData)
      },
      resetForm() {
        state.form.companyName = ''
        requestMethods.queryList()
      },
      onCompleted() {
        requestMethods.queryList()
      },

      // 下载应用文件
      async uploadFile(rowId: any) {
        // downloadFileByPostStream('/sign/auth/down/FileAuthor', { id: rowId })
        await downloadFile({ id: rowId })
        ElMessage.success('下载成功')
      },

      //  新增/编辑应用
      async showDia(rowId: any) {
        if (typeof rowId === 'number') {
          const list = await queryIdList({ id: rowId })
          state.appAuthorRef?.show({ ...list, companyName: list.yymc })
          return
        }
        state.appAuthorRef?.show()
      },
    }

    const requestMethods = {
      // 查询应用授权列表
      async queryList(form?: Object) {
        state.loading = true
        const appAuthorList = await querySealBigList({ ...form, page: state.page, size: state.size }, () => {
          state.loading = false
        })
        const data = appAuthorList.list.map((m: any) => {
          return {
            ...m,
            name: m.yymc,
            ip: m.ipAddress,
            timecon: m.sqdqsj,
            createTime: m.createTime,
          }
        })
        state.tableList = data
        state.total = appAuthorList.total
      },

      // 删除应用
      async deleteApp(id: any) {
        await ElMessageBox.confirm(
          '你确定要删除吗?',
          '提示',
          {
            type: 'warning',
          },
        )
        await deleteAppAuthor({ id: id })
        ElMessage.success('删除成功')
        requestMethods.queryList()
      }
    }

    onMounted(async () => {
      requestMethods.queryList()
    })

    return {
      ...toRefs(state),
      ...requestMethods,
      ...funMethods,
    };
  },
});
</script>
<style lang='scss' scoped>
.seal-tem {
  height: 100%;
  max-width: 100%;
  min-width: 900px;
  width: 100%;

  .el-form-item {
    margin: 0px;
  }

  height: 100%;

  .table-class {
    margin-top: 20px;
  }

  .seal-template {
    background-color: #fff;
    margin-bottom: 8px;

    .form-item {
      display: flex;
      align-items: center;
      width: 100%;

      .flex-content {
        width: 100%;
      }

      .btns {
        text-align: right;
        width: 200px;
      }
    }
  }

  .footer-pagination {
    margin-top: 20px;
    margin-right: 20px;
    display: flex;
    justify-content: flex-end;
  }

  // .iconfont {
  //   font-size: 24px;
  // }
}
</style>