<template>
  <div id="app-pagination" :style="textPos">
    <el-pagination background @size-change="pageSizeChange" @current-change="currentPageChange"
      :current-page="PageIndex" :page-sizes="[10, 20, 30, 40, 50]" :page-size="PageSize" :small="Small" :layout="layout"
      :total="TotalCount" :page-count="PageCount" class="pageination-wrap">
    </el-pagination>
  </div>
</template>

<script lang='ts'>
import { reactive, toRefs, computed, onMounted } from 'vue'

export default {
  name: 'pagination',
  props: {
    PageCount: Number, // 总页数
    TotalCount: Number, // 总条数
    PageIndex: Number, // 当前页数
    PageSize: {
      // 展示每页条数
      type: Number,
      default: 30,
    },
    showTotal: {
      type: Boolean,
      default: true,
    },
    Small: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    Postion: {
      // 控制分页位置
      type: String,
      default: 'right',
      validator(v: string) {
        return ['left', 'center', 'right'].includes(v)
      },
    },
    layout: {
      type: String,
      default: 'total,prev, pager, next, jumper,sizes,slot',
    },
  },
  emits: ['change'],
  components: {},
  setup(props: any, context) {
    const textPos = computed(() => {
      const pos = {
        left: (_) => {
          return {
            'justify-content': 'flex-start',
          }
        },
        center: (_) => {
          return {
            'justify-content': 'center',
          }
        },
        right: (_) => {
          return {
            'justify-content': 'flex-end',
          }
        },
      }
      const setPos = (_pos) => pos[_pos] && pos[_pos]()
      return setPos(props.Postion)
    })
    const state = reactive({
      currentPage: 1,
      changeValue: {
        pageSizeNum: 0,
        currentPage: 0,
      },
    })
    onMounted(() => {
      state.changeValue = {
        pageSizeNum: props.PageSize,
        currentPage: props.PageIndex,
      }
    })
    const pageSizeChange = (v) => {
      state.changeValue.pageSizeNum = v
      state.changeValue.currentPage = 1
      context.emit('change', state.changeValue)
    }
    const currentPageChange = (v) => {
      state.changeValue.currentPage = v
      console.log(state.changeValue)
      context.emit('change', state.changeValue)
    }
    return {
      ...toRefs(state),
      pageSizeChange,
      currentPageChange,
      textPos,
    }
  },
}
</script>

<style lang='scss' type='text/scss'>
#app-pagination {
  display: flex;
  background: #fff;
  padding: 10px;
  text-align: right;
  position: relative;
  right: -30px;

  .el-pagination__jump {
    margin-left: 0px;
  }

  .el-pagination__editor.el-input {
    width: 50px;
  }

  .el-pagination {

    .el-pagination__total,
    .el-pagination__jump {
      font-size: 12px;
      line-height: 30px;
      height: 32px;
    }

    .el-input--mini .el-input__inner {
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      border-radius: 6px;
    }

    .el-pagination__editor {
      display: inline-flex;
    }

    .el-pagination__editor.el-input .el-input__inner {
      height: 32px;
      font-size: 12px;
      border-radius: 6px;
    }
  }

  .el-pagination.is-background .btn-prev,
  .el-pagination.is-background .btn-next,
  .el-pagination.is-background .el-pager li {
    margin: 0 5px;
    background-color: #fff;
    color: rgba(0, 0, 0, 0.65);
    min-width: 32px;
    border-radius: 2px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    box-sizing: border-box;
    line-height: 30px;
    height: 32px;
    font-size: 12px;
  }

  .el-pagination.is-background .el-pager li:not(.disabled).active {
    // background-color: $main-color;
    color: #ffffff;
    // border-color: $main-color;
  }
}
</style>
