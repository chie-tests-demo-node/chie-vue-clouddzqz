<template>
  <div class="seal-tem">
    <el-card class="seal-template">
      <el-form :inline="true" style="display: flex" :model="form">
        <div class="form-item">
          <div class="flex-content">
            <el-form-item label="印章名称" label-width="80px">
              <el-input v-model="form.name" style="width: 273px" placeholder="请输入"></el-input>
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
          <el-icon color="#40b450">
            <i class="iconfont icon-zengjia"></i>
          </el-icon>
        </template>
        &nbsp;新增
      </el-button>
      <Table :loading="fetchLoading" class="table-class" :colConfigs="colConfigs" :tableData="tableList"
        :maxHeight="1000">
        <template #timeBetween>
          <el-table-column label="有效期" v-slot="scope">
            {{ scope.row.timeBetween }}
          </el-table-column>
        </template>
        <template #status>
          <el-table-column label="状态" v-slot="scope">
            <el-switch @click="onSwitchChange(scope.row.id, scope.row.status)"
              :model-value="scope.row.status === 1 ? true : false"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
          </el-table-column>
        </template>
        <template #createTime>
          <el-table-column width="230px" label="添加时间" v-slot="scope">
            {{ scope.row.createTime }}
          </el-table-column>
        </template>
        <template #sealImg>
          <el-table-column label="印章图片" v-slot="scope">
            <el-image style="height: 30px" :preview-src-list="[scope.row.sealImg]" :src='scope.row.sealImg'
              :preview-teleported="preViewImg" />
          </el-table-column>
        </template>
        <template #option>
          <el-table-column label="操作" fixed="right" min-width="140" v-slot="scope">
            <div>
              {{ scope.row.option }}
              <el-button title="编辑" link type="primary" @click="showDia(scope.row.id)">
                编辑
              </el-button>
              <el-button title="注销" link type="danger" @click="cancelData(scope.row.id)"> 注销 </el-button>
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
    <AddSealManage ref="sealManageRef" @onCompleted="onCompleted" />
  </div>
</template>

<script lang='ts'>
import { defineComponent, reactive, toRefs, ref, onMounted } from "vue";
import Table from "@/components/TableV2/table.vue";
import { removeNullAttribute, unixtimeFormat } from "@/utils";
import { sealManageTitle } from "@/utils/ListConfig/index";
import { ElMessage, ElMessageBox } from "element-plus";
import AddSealManage from "./components/AddSealManage.vue";
import { dfPageSize, pageSizes } from "@/config";
import { sealCreateTypeEnum, tempOptions } from "@/utils/enums";
import { exitSealManage, querySealManageList } from "@/api/operator/sealManage";
export default defineComponent({
  name: "app",
  components: { Table, AddSealManage },
  setup() {
    const state = reactive({
      preViewImg: true,
      fetchLoading: false,
      rowInfo: {},
      colConfigs: Object.freeze(sealManageTitle),
      formatDateTime: unixtimeFormat,
      tableList: [],
      page: 1,
      total: 0,
      size: dfPageSize,
      pageSizes: pageSizes,
      form: {
        name: "",
      },
      value: "",
      options: tempOptions,
      sealManageRef: null,
    });

    const funMethods = {
      searchSeal() {
        const formData = removeNullAttribute({ sealTypeName: state.form.name })
        requestMethods.queryList(formData)
      },
      resetForm() {
        state.form.name = "";
        requestMethods.queryList()
      },
      async cancelData(rowId: any) {
        await ElMessageBox.confirm('你确定要注销吗?', '提示', { type: 'warning', })
        await exitSealManage({ id: rowId, status: 2 })
        ElMessage.success('注销成功')
        requestMethods.queryList()
      },

      showDia(rowId: any) {
        if (rowId) {
          console.log(rowId)
          state.sealManageRef?.show(rowId)
          return
        }
        state.sealManageRef?.show()
      },

      // 更改印章状态
      async onSwitchChange(rowId: any, status: any) {
        await ElMessageBox.confirm(`确认${status === 1 ? "停用" : "启用"}?`, "提示", { type: "warning", });
        if (status !== 1) {
          await exitSealManage({ id: rowId, status: 1 })
        } else {
          await exitSealManage({ id: rowId, status: 0 })
        }
        requestMethods.queryList()
      },
      onCompleted() {
        requestMethods.queryList()
      }
    };

    const requestMethods = {
      async queryList(form?: Object) {
        state.fetchLoading = true
        const list = await querySealManageList({ page: state.page, size: state.size, ...form }, () => {
          state.fetchLoading = false
        })
        const newList = list.list.map((m) => {
          return {
            ...m,
            name: m.sealName,
            code: m.sealCode,
            cert: m.certName,
            type: sealCreateTypeEnum[m.createType],
            sealImg: m.sealBlob,
            timeBetween: m.expireTime,
            status: m.isEnabled,
          }
        })
        state.tableList = newList
        state.page = list.page
        state.size = list.size
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
.el-table__inner-wrapper {
  z-index: 0;
}

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