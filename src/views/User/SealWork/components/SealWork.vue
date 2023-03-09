<template>
  <el-dialog
    v-model="dialogSealWorkVisible"
    :title="'新增盖章任务'"
    width="1600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    top="3vh"
  >
    <div class="content">
      <!-- <nav > -->
      <el-card class="left_nav">
        <template #header> 文件列表 </template>
        <ul>
          <li
            v-for="(item, index) in fileList"
            :key="index"
            :class="{ isActive: navIndex === index }"
            @click="selectFile(item, index)"
          >
            {{ item.name }}
          </li>
          <!-- <li>哈哈哈.text</li>
          <li>哈哈哈.text</li>
          <li>哈哈哈.text</li>
          <li>哈哈哈.text</li>
          <li>哈哈哈.text</li> -->
        </ul>
      </el-card>
      <!-- </nav> -->
      <el-card class="center_img">
        <template #header>印章列表 </template>
        <draggable
          v-model="mainImagelist"
          :group="{ name: 'itext', pull: 'clone' }"
          :sort="false"
          item-key="id"
          :animation="1000"
        >
          <transition-group type="transition">
            <li
              v-for="item in mainImagelist"
              :key="item"
              class="item"
              style="text-align: center"
            >
              <img :src="item" class="imgstyle" />
            </li>
          </transition-group>
        </draggable>
      </el-card>
      <el-card class="right_pdf">
        <div class="page">
          <!-- <el-button class="btn-outline-dark" @click="zoomIn">-</el-button>
        <span style="color:red;">{{(percentage*100).toFixed(0)+'%'}}</span>
        <el-button class="btn-outline-dark" @click="zoomOut">+</el-button> -->
          <el-button class="btn-outline-dark" @click="prevPage"
            >上一页</el-button
          >
          <el-button class="btn-outline-dark" @click="nextPage"
            >下一页</el-button
          >
          <el-button class="btn-outline-dark"
            >{{ pageNum }}/{{ numPages }}页</el-button
          >
          <el-input-number
            style="margin: 0 5px; border-radius: 5px"
            class="btn-outline-dark"
            v-model="pageNum"
            :min="1"
            :max="numPages"
            label="输入页码"
          ></el-input-number>
          <el-button class="btn-outline-dark" @click="cutover">跳转</el-button>
        </div>
        <canvas id="the-canvas"></canvas>
        <!-- 盖章部分 -->
        <canvas id="ele-canvas"></canvas>
        <div class="ele-control" style="margin-bottom: 2%">
          <el-button class="btn-outline-dark" @click="removeSignature">
            删除签章</el-button
          >
          <el-button class="btn-outline-dark" @click="clearSignature">
            清除所有签章</el-button
          >
          <el-button class="btn-outline-dark" @click="submitSignature"
            >提交所有签章信息</el-button
          >
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import AuthEditor from "@/components/AuthEditor/AuthEditor.vue";
import { VueDraggableNext } from "vue-draggable-next";
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  computed,
  watch,
  nextTick,
} from "vue";
let pdfDoc: any = "";
import { fabric } from "fabric";
let pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.entry";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
// import "./UserEditor.scss";
export default defineComponent({
  components: { AuthEditor, draggable: VueDraggableNext },
  props: ["dialogSealWorkVisible"],
  emits: ["close"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      navIndex: 0,
      formVal: {
        name: "",
        text: "",
        tag: "",
      },
      fileList: [
        { name: "我是上传的zip.zip" },
        { name: "我是上传的zip.zip" },
        { name: "我是上传的zip.zip" },
        { name: "我是上传的zip.zip" },
        { name: "我是上传的zip.zip" },
      ],
      mainImagelist: [require("@/assets/imgs/3.png")],
      pdfUrl: "",
      pdfDoc: null,
      numPages: 1,
      pageNum: 1,
      scale: 2.2,
      pageRendering: false,
      pageNumPending: null,
      sealUrl: "",
      signUrl: "",
      canvas: null,
      ctx: null,
      canvasEle: null,
      whDatas: null,
      taskInfo: {},
      upload: null,
      formRules: {},
      formRef: null,
      formData: {},
    });
    const funMethods = {
      submit: async () => {
        state.formRef.validate((valid: boolean) => {
          if (!valid) {
            const formData = new FormData();
            formData.append("file", (state.formData as any).get("file"));

            return;
          }
        });
      },
      canvasEvents: () => {
        // 拖拽边界 不能将图片拖拽到绘图区域外
        state.canvasEle.on("object:moving", function (e) {
          var obj = e.target;
          // if object is too big ignore
          if (
            obj.currentHeight > obj.canvas.height ||
            obj.currentWidth > obj.canvas.width
          ) {
            return;
          }
          obj.setCoords();
          // top-left  corner
          if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
            obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
            obj.left = Math.max(
              obj.left,
              obj.left - obj.getBoundingRect().left
            );
          }
          // bot-right corner
          if (
            obj.getBoundingRect().top + obj.getBoundingRect().height >
              obj.canvas.height ||
            obj.getBoundingRect().left + obj.getBoundingRect().width >
              obj.canvas.width
          ) {
            obj.top = Math.min(
              obj.top,
              obj.canvas.height -
                obj.getBoundingRect().height +
                obj.top -
                obj.getBoundingRect().top
            );
            obj.left = Math.min(
              obj.left,
              obj.canvas.width -
                obj.getBoundingRect().width +
                obj.left -
                obj.getBoundingRect().left
            );
          }
        });
      },
      selectFile: (row, index) => {
        state.navIndex = index;
      },
      //翻页展示盖章信息
      commonSign: (pageNum, isFirst = false) => {
        if (isFirst == false) state.canvasEle.remove(state.canvasEle.clear()); //清空页面所有签章
        let caches = JSON.parse(localStorage.getItem("signs")); //获取缓存字符串后转换为对象
        if (caches == null) return false;
        let datas = caches[state.pageNum];
        if (datas != null && datas != undefined) {
          for (let index in datas) {
            funMethods.addSeal(
              datas[index].sealUrl,
              datas[index].left,
              datas[index].top,
              datas[index].index
            );
          }
        }
      },
      renderPage(num) {
        state.pageRendering = true;
        return pdfDoc.getPage(num).then((page) => {
          let viewport = page.getViewport({ scale: state.scale }); //设置视口大小
          state.canvas.height = viewport.height;
          state.canvas.width = viewport.width;

          // Render PDF page into canvas context
          let renderContext = {
            canvasContext: state.ctx,
            viewport: viewport,
          };
          let renderTask = page.render(renderContext);
          // Wait for rendering to finish
          renderTask.promise.then(() => {
            state.pageRendering = false;
            if (state.pageNumPending !== null) {
              // New page rendering is pending
              funMethods.renderPage(state.pageNumPending);
              state.pageNumPending = null;
            }
          });
        });
      },
      showpdf: (pdfUrl) => {
        let caches = JSON.parse(localStorage.getItem("signs")); //获取缓存字符串后转换为对象
        console.log(caches);
        if (caches != null) {
          let datas = caches[state.pageNum];
          if (datas != null && datas != undefined) {
            for (let index in datas) {
              funMethods.addSeal(
                datas[index].sealUrl,
                datas[index].left,
                datas[index].top,
                datas[index].index
              );
            }
          }
        }
        state.canvas = window.document.getElementById("the-canvas");
        state.ctx = state.canvas.getContext("2d");
        pdfjsLib
          .getDocument({
            url: pdfUrl,
            rangeChunkSize: 65536,
            disableAutoFetch: false,
          })
          .promise.then((pdfDoc_: any) => {
            pdfDoc = pdfDoc_;
            state.numPages = pdfDoc_.numPages;
            funMethods.renderPage(state.pageNum).then(() => {
              funMethods.renderPdf({
                width: state.canvas.width,
                height: state.canvas.height,
              });
            });
            funMethods.commonSign(state.pageNum, true);
          });
      },
      //设置PDF预览区域高度
      setPdfArea() {
        state.pdfUrl = `http://${window.location.host}/show.pdf`;
        nextTick(() => {
          funMethods.showpdf(state.pdfUrl); //接口返回的应该还有盖章信息，不只是pdf
        });
      },
      //添加公章
      addSeal: (sealUrl, left, top, index) => {
        fabric.Image.fromURL(sealUrl, (oImg) => {
          oImg.set({
            left: left,
            top: top,
            // angle: 10,
            scaleX: 0.8,
            scaleY: 0.8,
            index: index,
          });
          // oImg.scale(0.5); //图片缩小一
          state.canvasEle.add(oImg);
        });
      },
      //设置绘图区域宽高
      renderPdf: (data) => {
        state.whDatas = data;
      },
      end(e) {
        funMethods.addSeal(
          state.mainImagelist[e.newDraggableIndex],
          e.originalEvent.layerX,
          e.originalEvent.layerY,
          e.newDraggableIndex
        );
      },

      prevPage: () => {},
      nextPage: () => {},
      cutover: () => {},
      removeSignature: () => {},
      clearSignature: () => {},
      submitSignature: () => {},
    };
    watch(
      () => {
        state.pdfUrl;
      },
      (n, v) => {
        nextTick(() => {
          funMethods.showpdf(n);
        });

        // if (state.whDatas) {
        //   // funMethods.renderFabric();
        //   funMethods.canvasEvents();
        //   let eleCanvas = document.querySelector("#ele-canvas");
        //   eleCanvas.style = "border:1px solid #5ea6ef";
        // }
      }
    );
    onMounted(() => {
      nextTick(() => {
        state.mainImagelist = [
          require("@/assets/imgs/3.png"),
          require("@/assets/imgs/3.png"),
        ];
        state.taskInfo = {
          title: "测试盖章",
          uname: "张三",
          endtime: "2021-09-01 17:59:59",
        };
        state.pdfUrl = `http://${window.location.host}/show.pdf`;
        funMethods.showpdf(`http://${window.location.host}/show.pdf`);
      });
    });
    return {
      ...toRefs(state),
      ...funMethods,
      ...props,
    };
  },
});
</script>
<style lang="scss" scoped>
::v-deep .el-upload__tip {
  font-size: 20px;
  color: red;
  font-weight: bold;
}

.content {
  max-height: 800px;
  height: 700px;
  display: flex;
  .center_img {
    width: 300px;
    margin: 0 10px;
    .imgstyle {
      height: 100px;
      width: 260px;
    }
  }
  .right_pdf {
    flex: 1;
    .page {
      text-align: center;
      margin: 0 auto;
    }
    #the-canvas {
      margin-top: 10px;
    }
    #ele-canvas {
      /* border: 1px solid #5ea6ef; */
      overflow: hidden;
    }
    .ele-control {
      text-align: center;
      margin-top: 3%;
    }
  }
  .left_nav {
    width: 200px;
    li {
      height: 40px;
      font-size: 14px;
      font-weight: bold;
      line-height: 40px;
      cursor: pointer;
    }
    li:hover {
      color: #409eff;
    }
    .isActive {
      color: #409eff;
    }
  }
}
</style>
