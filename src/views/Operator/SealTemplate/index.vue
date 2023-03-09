<template>
  <div class="seal-tem" :loading="loading">
    <el-card class="seal-template">
      <el-form :inline="true" style="display: flex" :model="form">
        <div class="form-item">
          <div class="flex-content">
            <el-form-item label="模板名称" label-width="80px">
              <el-input v-model="form.sealTypeName" style="width: 273px" placeholder="请输入"></el-input>
            </el-form-item>
            <!-- <el-form-item label="印章类型" label-width="80px">
              <el-select v-model="form.sealType" clearable placeholder="请选择" style="width:260px">
                <el-option v-for="item in tempOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item> -->
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
          <el-icon color="#40b450">
            <i class="iconfont icon-zengjia"></i>
          </el-icon>
        </template>
        &nbsp;新增
      </el-button>
      <Table class="table-class" :colConfigs="colConfigs" :tableData="tableList" :maxHeight="1000" :loading="loading">
        <template #createTime>
          <el-table-column label="添加时间" v-slot="scope">
            {{ scope.row.createTime }}
          </el-table-column>
        </template>
        <template #option>
          <el-table-column label="操作" fixed="right" min-width="140" v-slot="scope">
            <div>
              {{ scope.row.option }}
              <el-button title="编辑" link type="primary" @click="showDia(scope.row)">
                编辑
              </el-button>
              <el-button title="删除" link type="danger" @click="handleClose(scope.row.id)"> 删除 </el-button>
            </div>
          </el-table-column>
        </template>
      </Table>
      <div class="footer-pagination">
        <el-pagination v-model:current-page="page" v-model:page-size="size" :page-sizes="pageSizes" :total="total"
          @current-change="queryList" @size-change="queryList" layout="total, sizes, prev, pager, next, jumper" />
      </div>
    </el-card>
    <AddTemplate ref="templateRef" @onCompleted="onCompleted" />
  </div>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs, onMounted } from "vue";
import Table from "@/components/TableV2/table.vue";
import AddTemplate from "./components/AddTemplate.vue";
import { sealTemplateTitle } from "@/utils/ListConfig/index";
import { ElMessage, ElMessageBox } from "element-plus";
import { dfPageSize, pageSizes } from "@/config";
import { tempOptions } from "@/utils/enums";
import { removeNullAttribute, unixtimeFormat } from '@/utils'
import { deleteSealTeml, querySealTemlList } from "@/api/operator/sealTeml";
export default defineComponent({
  name: "app",
  components: { Table, AddTemplate },
  setup() {
    const state = reactive({
      loading: false,
      colConfigs: Object.freeze(sealTemplateTitle),
      formatDateTime: unixtimeFormat,
      tableList: [],
      page: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      rowInfo: null,
      form: {
        sealTypeName: "",
        sealType: "",
      },
      value: "",
      tempOptions,
      templateRef: null,
    });

    const funMethods = {
      searchSeal() {
        // TODO 调查询接口
        const formData = removeNullAttribute({ ...state.form })
        requestMethods.queryList(formData)
      },
      resetForm() {
        state.form.sealTypeName = ""
        state.form.sealType = ''
        requestMethods.queryList()
      },
      async handleClose(id: string) {
        await ElMessageBox.confirm(
          '你确定要删除吗?',
          '提示',
          {
            type: 'warning',
          }
        )
        await deleteSealTeml({ id: id })
        ElMessage.success('删除成功')
        requestMethods.queryList()
      },
      async showDia(row: any) {
        if (row.id) {
          // 请求编辑的接口
          state.templateRef?.show(row)
          return
        }
        state.templateRef?.show()
      },
      onCompleted() {
        requestMethods.queryList()
      },
    };

    const requestMethods = {
      async queryList(formData?: Object) {
        state.loading = true
        const list: any = await querySealTemlList({ page: state.page, size: state.size, ...formData }, () => {
          state.loading = false
        })
        const newListData = list.list.map((m: any) => {
          return {
            ...m,
            name: m.sealTypeName,
            type: m.contentTypeName,
            shape: m.imageShapeName,
            sealSize: m.sealImageSize,
            certType: m.certTypeName,
          }
        })
        state.tableList = newListData
        state.total = list.total
      }
    }

    onMounted(() => {
      requestMethods.queryList()
    })
    return {
      ...toRefs(state),
      ...funMethods,
      ...requestMethods,
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

  // background-color: #e9f0fa;
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
    display: flex;
    justify-content: flex-end;
  }

  .iconfont {
    font-size: 24px;
  }

}
</style>