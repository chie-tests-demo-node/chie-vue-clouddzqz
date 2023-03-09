<template>
    <div class='ca-el-table'>
        <el-table v-if='isRefresh' ref='refTable' @row-click="handleRowClick" @row-dblclick="handleRowdbClick"
            v-bind='$attrs' highlight-current-row :data='tableList' :max-height='maxHeight' :row-key='rowKey'
            :span-method='spanMethod' :stripe='stripe' border tooltip-effect='dark' @select='select'
            @selection-change='selectionChangeF' @select-all='selectAll' @header-dragend='headerDragendF'>
            <template v-for='colConfig in colConfigs'>
                <slot v-if='colConfig.slot' :name='colConfig.slot'></slot>
                <el-table-column v-else-if="colConfig.type !== 'selection'" :key='colConfig.prop'
                    :show-overflow-tooltip='true' v-bind='colConfig' show-overflow-tooltip>
                    <template #header>
                        <TableCell v-if='colConfig.headerRenderer' :renderer='h => colConfig.headerRenderer(h)'>
                        </TableCell>
                        <span v-else-if='colConfig.headerFormatter' v-html='colConfig.headerFormatter()'></span>
                        <span v-else>{{ colConfig.label }}</span>
                        <span v-if='colConfig.sort' class='ca-el-table__sortBox'>
                            <i :style="{
                                borderBottomColor:
                                    tempObj[colConfig.prop].sort === 0
                                        ? '#1F9B83'
                                        : '#c0c4cc',
                            }" class='ca-el-table__sort ca-el-table__asc' @click='setSort(colConfig.prop, 0)'></i>
                            <i :style="{
                                borderTopColor:
                                    tempObj[colConfig.prop].sort === 1
                                        ? '#1F9B83'
                                        : '#c0c4cc',
                            }" class='ca-el-table__sort ca-el-table__desc' @click='setSort(colConfig.prop, 1)'></i>
                        </span>
                    </template>
                    <template v-slot='scope'>
                        <a v-if='colConfig.link' @click='itemClick(scope.row, colConfig.prop)'>
                            {{ scope.row[colConfig.prop] }}
                        </a>
                        <template v-else-if='colConfig.formatter'>
                            <span v-html='
                                colConfig.formatter(
                                    scope.row[colConfig.prop],
                                    scope.row,
                                    colConfig.prop,
                                    scope
                                )
                            '></span>
                        </template>
                        <TableCell v-else-if='colConfig.renderer' :renderer='h => colConfig.renderer(h, scope)'>
                        </TableCell>
                        <template v-else-if='colConfig.rowSlot'>
                            <div>
                                <slot :scope='scope'></slot>
                            </div>
                        </template>
                        <template v-else>{{
                            scope.row[colConfig.prop] === undefined ||
                                scope.row[colConfig.prop] === null ||
                                scope.row[colConfig.prop] === ''
                                ? '-'
                                : scope.row[colConfig.prop]
                        }}
                        </template>
                    </template>
                </el-table-column>
                <el-table-column v-else :key='colConfig.prop' v-bind='colConfig'
                    show-overflow-tooltip></el-table-column>
            </template>
            <template v-slot:empty>
                <img alt='' class='table-empty' src='@/assets/imgs/empty.png' />
            </template>
        </el-table>
    </div>
</template>
<script>
import { nextTick, onMounted, reactive, ref, toRefs, watch } from 'vue'
import TableCell from './tabelCell.vue'
import { ElTable, ElTableColumn } from 'element-plus'
export default {
    components: {
        TableCell,
        ElTable,
        ElTableColumn,
    },
    props: {
        stripe: {
            type: Boolean,
            default: false,
        },
        colConfigs: {
            type: Array,
            default: () => [],
        },
        tableList: {
            type: Array,
            default() {
                return []
            },
        },
        height: Number,
        maxHeight: Number,
        rowKey: Function,
        spanMethod: Function,
        handleRowClick: Function,
        handleRowdbClick: Function,
    },
    emits: [
        'select',
        'select-all',
        'selection-change',
        'filterData',
        'itemClick',
    ],
    setup(props, context) {
        const refTable = ref(null)
        const state = reactive({
            isRefresh: true,
            tempObj: {},
            searchData: {
                filter: [], //列过滤条件集合
                sort: [], //列排序条件集合
            },
        })
        onMounted(() => {
            init()
        })
        /* 初始化排序信息 */
        const init = () => {
            for (var i = props.colConfigs.length - 1; i >= 0; i--) {
                if (props.colConfigs[i].prop) {
                    state.tempObj[props.colConfigs[i].prop] = {
                        sort: '',
                    }
                }
            }
        }
        //表头设置排序  0升序 1降序
        const setSort = (prop, val) => {
            if (!state.tempObj[prop]) {
                state.tempObj[prop] = { sort: val }
            } else {
                state.tempObj[prop].sort = val
            }
            let i = arrHasItme(state.searchData.sort, prop)
            if (i > -1) {
                state.searchData.sort[i].sort = val
            } else {
                state.searchData.sort.push({
                    prop: prop,
                    sort: val,
                })
            }
            context.emit('filterData', state.searchData)
            goToRefresh()
        }
        const goToRefresh = () => {
            state.isRefresh = false
            // 在组件移除后，重新渲染组件
            // nextTick可实现在DOM 状态更新后，执行传入的方法。
            nextTick(() => {
                state.isRefresh = true
            })
        }
        //判断数组是否存在改元素
        const arrHasItme = (arr, prop) => {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].prop == prop) {
                    return i
                }
            }
            return -1
        }
        //表格元素点击事件
        const itemClick = (data, prop) => {
            context.emit('itemClick', { data: data, prop: prop })
        }
        //选中行变化时
        const selectionChangeF = (val) => {
            context.emit('selection-change', val)
        }
        // selectAll
        const selectAll = (all) => {
            context.emit('select-all', all)
        }
        const select = (selecteds, row) => {
            context.emit('select', selecteds, row)
        }
        //当拖动表头改变了列的宽度的时候会触发该事件
        const headerDragendF = () => {
            nextTick(() => {
                refTable.value.doLayout()
            })
        }
        // 清空clearSelection
        const clearSelection = () => {
            refTable.value.clearSelection()
        }
        // 返选
        const toggleRowSelection = (row, status) => {
            refTable.value.toggleRowSelection(row, status)
        }

        watch(() => props.tableList, headerDragendF)

        return {
            ...toRefs(state),
            setSort,
            itemClick,
            selectionChangeF,
            headerDragendF,
            clearSelection,
            refTable,
            toggleRowSelection,
            selectAll,
            select,
        }
    },
}
</script>

<style lang='scss'>
.ca-el-table .el-table__row a {
    color: blue;
    cursor: pointer;
}

.ca-el-table .el-table__row a.ca-el-table__btn {
    text-decoration: none;
    padding: 0 5px;
}

.ca-el-table .el-table th,
.ca-el-table .el-table thead.is-group th {
    background: #dae1eb;
    font-size: 16px;
    font-weight: 500;
    color: #000;
    height: 50px;
}

.ca-el-table .el-table--small th {
    padding: 0;
}

.ca-el-table .el-table td {
    font-size: 12px;
    padding: 7px 0;
    font-weight: normal;
    color: #666;
}

.ca-el-table .el-table .cell {
    line-height: 24px;
}

.ca-el-table__sortBox {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 22px;
    width: 24px;
    vertical-align: middle;
    cursor: pointer;
    overflow: initial;
    position: relative;
}

.ca-el-table__sort {
    width: 0;
    height: 0;
    border: 6px solid transparent;
    position: absolute;
    left: 7px;
}

.ca-el-table__sort.ca-el-table__asc {
    border-bottom-color: #c0c4cc;
    top: -3px;
}

.ca-el-table__sort.ca-el-table__desc {
    border-top-color: #c0c4cc;
    bottom: -1px;
}

.ca-el-table .el-table .ca-el-table__history td {
    color: #999;
}

.ca-el-table .el-table .ca-el-table__pre__cancel td {
    color: #999;
}

.ca-el-table .el-table__empty-block {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    padding-right: 100%;
}

.table-empty {
    width: 99px;
    height: 72px;
    padding: 110px 0;
}
</style>
