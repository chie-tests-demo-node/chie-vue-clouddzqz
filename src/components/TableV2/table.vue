<template>
  <el-table
    :data="tableData"
    :max-height="maxHeight"
    :height="height"
    border
    v-loading="props.loading"
    :row-key="props.rowKey"
    default-expand-all
    ref="table"
    :stripe="true"
  >
    <template v-for="(item, index) in colConfigs" :key="index">
      <el-table-column
        v-if="item.slot && item.slot === 'selection'"
        type="selection"
        :width="item.width"
        :selectable="props.selectable"
        :reserve-selection="true"
      />
      <slot v-else-if="item.slot" :name="item.slot"></slot>
      <!-- 如果不是选择框 -->
      <el-table-column
        v-else-if="item.type !== 'selection'"
        :prop="item.prop"
        :show-overflow-tooltip="true"
        :label="item.label"
        :width="item.width"
        :fixed="item.fixed"
      />
      <!-- 选择框 -->
    </template>
    <template #empty>
      <div style="height: 24px"></div>
      <img alt="" class="table-empty" src="@/assets/imgs/empty.png" />
    </template>
  </el-table>
</template>

<script lang="ts">
import { isNullArray } from "@/utils";
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  name: "app",
  props: [
    "colConfigs",
    "tableData",
    "maxHeight",
    "height",
    "loading",
    "rowKey",
    "selectable",
  ],
  emits: [],
  setup(props, { emit }) {
    const state = reactive({
      table: null,
      propsReserveKeys: [],
    });
    const funMethods = {
      clearSelection: () => {
        state.table?.clearSelection();
      },
      getSelectionRows: () => {
        return state.table?.getSelectionRows();
      },
      getSelectionKeys: () => {
        return funMethods.getSelectionRows()?.map((m) => m[props.rowKey]);
      },
      setReserveKeys: (keys) => {
        state.propsReserveKeys = keys;
      },
      toggleRowSelection: () => {
        if (isNullArray(state.propsReserveKeys)) {
          return;
        }
        var nowHasRows = props.tableData?.filter(
          (m) => state.propsReserveKeys.indexOf(m[props.rowKey]) != -1
        );
        for (let index = 0; index < nowHasRows.length; index++) {
          const element = nowHasRows[index];
          state.table.toggleRowSelection(element, true);
          state.propsReserveKeys = state.propsReserveKeys.filter(
            (m) => m != element[props.rowKey]
          );
        }
      },
    };
    return {
      ...toRefs(state),
      ...funMethods,
      props,
    };
  },
});
</script>
<style lang="scss" scoped></style>
