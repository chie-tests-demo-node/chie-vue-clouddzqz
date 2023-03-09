<template>
  <el-dialog
    v-if="visible"
    v-model="visible"
    title="证书详情"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="certInfo" v-loading="pageLoading">
      <div class="row">
        <div class="title">使用者名称：</div>
        <div class="content">{{ info?.commonName }}</div>
      </div>
      <div class="row">
        <div class="title">证书类型：</div>
        <div class="content">
          {{ certTypeEnum.find((m) => m.value === info?.certType)?.name }}
        </div>
      </div>
      <div class="row">
        <div class="title">密钥算法：</div>
        <div class="content">
          {{
            secretAlgTypeEnum.find((m) => m.value === info?.keyAlgorithm)?.name
          }}
        </div>
      </div>
      <div class="row">
        <div class="title">有效期至：</div>
        <div class="content">{{ info?.expire }}</div>
      </div>
      <template v-if="info?.certType == 2">
        <div class="row">
          <div class="title">组织名称：</div>
          <div class="content">{{ info?.orgName }}</div>
        </div>
        <div class="row">
          <div class="title">组织代码：</div>
          <div class="content">{{ info?.orgUnit }}</div>
        </div>
      </template>
      <template v-else>
        <div class="row">
          <div class="title">身份证号：</div>
          <div class="content">{{ info?.idCard }}</div>
        </div>
      </template>
      <div class="row">
        <div class="title">联系地址：</div>
        <div class="content">{{ info?.address }}</div>
      </div>
      <div class="row">
        <div class="title">电话：</div>
        <div class="content">{{ encryptionPhone(info?.phone) }}</div>
      </div>
      <div class="row">
        <div class="title">邮箱：</div>
        <div class="content">{{ info?.email }}</div>
      </div>
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="hide">取消</el-button>
        <el-button type="primary" @click="hide">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang='ts'>
import {
  certAlgTypeQuery,
  certApplyTypeQuery,
  certStatusTypeQuery,
  certTypeQuery,
} from "@/api/certMgr";
import { unixtimeFormat, encryptionPhone } from "@/utils";
import { defineComponent, onMounted, reactive, toRefs } from "vue";
import "./CertInfo.scss";
export default defineComponent({
  name: "app",
  setup() {
    const state = reactive({
      visible: false,
      info: {},
      certTypeEnum: [],
      certApplyTypeEnum: [],
      certStatusEnum: [],
      secretAlgTypeEnum: [],
      pageLoading: false,
    });
    const funMethods = {
      show: (info) => {
        state.info = info;
        state.visible = true;
      },
      hide: () => {
        state.visible = false;
      },
      timeFormat: unixtimeFormat,
      encryptionPhone,
    };
    const request = {
      queryCertType: async () => {
        const certTypeEnum = await certTypeQuery(
          () => (state.pageLoading = false)
        );
        state.certTypeEnum = certTypeEnum;
      },
      queryCertApplyType: async () => {
        const certApplyTypeEnum = await certApplyTypeQuery(
          () => (state.pageLoading = false)
        );
        state.certApplyTypeEnum = certApplyTypeEnum;
      },
      queryCertStatusType: async () => {
        const certStatusEnum = await certStatusTypeQuery(
          () => (state.pageLoading = false)
        );
        state.certStatusEnum = certStatusEnum;
      },
      queryAlgType: async () => {
        const secretAlgTypeEnum = await certAlgTypeQuery(
          () => (state.pageLoading = false)
        );
        state.secretAlgTypeEnum = secretAlgTypeEnum;
      },
    };
    onMounted(async () => {
      state.pageLoading = true;
      await request.queryCertType();
      await request.queryCertApplyType();
      await request.queryCertStatusType();
      await request.queryAlgType();
      state.pageLoading = false;
    });
    return {
      ...toRefs(state),
      ...funMethods,
    };
  },
});
</script>
<style lang='scss' scoped>
</style>