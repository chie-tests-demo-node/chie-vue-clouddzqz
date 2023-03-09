<template>
  <el-dialog
    v-model="dialogSealWorkVisible"
    :title="'新增盖章任务'"
    width="1400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    top="3vh"
  >
    <!-- <template #header>
      <div>
        <span>新增盖章任务</span>
        <Close style="width: 1em; height: 1em"></Close>
      </div>
    </template> -->
    <div class="content">
      <!-- <nav > -->
      <el-card class="left_nav">
        <template #header> 文件列表 </template>
        <ul>
          <li
            v-for="(item, index) in fileList"
            :key="item.fileNumber"
            :class="{ isActive: navIndex === index }"
            @click="changeFile(item, index)"
          >
            <el-tooltip
              :content="item.fileName"
              effect="light"
              placement="bottom"
            >
              {{ item.fileName }}
            </el-tooltip>
          </li>
        </ul>
      </el-card>
      <!-- </nav> -->
      <el-card class="center_img" v-loading="imgLoading">
        <template #header>我的印章 </template>
        <draggable
          v-model="mainImagelist"
          :group="{ name: 'itext', pull: 'clone' }"
          :sort="false"
          item-key="id"
          :animation="1000"
          @end="end"
          @clone="start"
        >
          <transition-group type="transition">
            <li
              v-for="item in mainImagelist"
              :key="item"
              class="item"
              style="text-align: center"
            >
              <img :src="item.sealImg" class="imgstyle" />
            </li>
          </transition-group>
        </draggable>
      </el-card>
      <el-card class="right_pdf" v-loading="loading">
        <div class="page">
          <!-- <el-button class="btn-outline-dark" @click="zoomIn">-</el-button>
        <span style="color:red;">{{(percentage*100).toFixed(0)+'%'}}</span>
        <el-button class="btn-outline-dark" @click="zoomOut">+</el-button> -->
          <div>
            <!-- <el-button class="btn-outline-dark" @click="prevPage"
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
              v-model="goNum"
              :min="1"
              :max="numPages"
              label="输入页码"
            ></el-input-number>
            <el-button class="btn-outline-dark" @click="cutover()"
              >跳转</el-button
            > -->
          </div>
          <div>
            <el-button
              class="btn-outline-dark"
              type="danger"
              @click="removeSignature"
            >
              删除签章</el-button
            >
            <el-button
              class="btn-outline-dark"
              type="primary"
              @click="clearSignature"
            >
              清除所有签章</el-button
            >
            <el-button
              class="btn-outline-dark"
              type="primary"
              @click="submitSignature"
              :loading="btnloading"
              >提交所有签章信息</el-button
            >
          </div>
        </div>
        <div class="content-pdf">
          <!-- pdf展示 -->
          <canvas
            id="the-canvas"
            style="
              width: 100%;
              margin: 0 auto;
              height: 100%;
              margin-bottom: 20px;
            "
          ></canvas>
          <!-- 盖章部分 -->
          <canvas id="ele-canvas" style="width: 100%; margin: 0 auto"></canvas>
        </div>
      </el-card>
    </div>
    <template #footer>
      <div style="text-align: center">
        <el-button @click="emit('close')">取消</el-button>
        <el-button type="primary" @click="submitSignature">确认</el-button>
      </div>
    </template>
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
import { fabric } from "fabric";
let pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.entry";
import {
  WorkList,
  DownSuccess,
  SeakList,
  DownFile,
  AddWork,
} from "@/api/sealWork/index";
import { apiDownloadFile } from "@/api/axiosv2";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
let pdfDoc;
import { pxConversionMm, mmConversionPx } from "@/utils/pxTomm";
import { off } from "element-plus/es/utils";
import { ElMessage } from "element-plus";
// import "./UserEditor.scss";
export default defineComponent({
  components: { AuthEditor, draggable: VueDraggableNext },
  props: ["fileList", "sealData", "dialogSealWorkVisible", "mainImagelist"],
  emits: ["close"],
  name: "app",
  setup(props, { emit }) {
    const state = reactive({
      visible: false,
      loading: true,
      btnloading: false,
      imgLoading: true,
      navIndex: 0,
      goNum: 1,
      formVal: {
        name: "",
        text: "",
        tag: "",
      },
      mainImagelist: props.mainImagelist || [],
      pdfUrl: `http://${window.location.host}/show.pdf`,
      pdfDoc: null,
      numPages: 1,
      pageNum: 1,
      pageHeight: null,
      scale: 1,
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
      formData: {},
      formRef: null,
    });
    watch(
      [() => state.whDatas],
      function (n, o) {
        if (state.whDatas) {
          nextTick(() => {
            funMethods.renderFabric();
            funMethods.canvasEvents();
          });
        }
      },
      { deep: true }
    );
    const funMethods = {
      //拖拽开始事件
      start: (e) => {},
      //切换文件
      changeFile: (item, index) => {
        funMethods.submitCaChe();
        if (state.navIndex !== index) {
          state.loading = true;
          state.navIndex = index;
          state.pageNum = 1;
          api.getPDf(index);
        }
      },
      submitCaChe: () => {
        //切换之前保存到本地文件
        let data = state.canvas.getObjects();
        console.log(data);
        let cacheSigns = JSON.parse(sessionStorage.getItem("cacheSigns"));
        let signs = {};
        let i = 0;
        for (const value of data) {
          signs[i] = {
            width: state.mainImagelist.find((item) => item.id === value.index)
              .imgWidth,
            height: state.mainImagelist.find((item) => item.id === value.index)
              .imgHeight,
            top: value.top,
            left: value.left,
            angle: value.angle,
            translateX: value.translateX,
            translateY: value.translateY,
            scaleX: value.scaleX,
            scaleY: value.scaleY,
            sealUrl: state.mainImagelist.find((item) => item.id === value.index)
              .sealImg,
            index: value.index,
          };
          i++;
        }
        if (cacheSigns == null) {
          cacheSigns = {};
          cacheSigns[state.navIndex] = signs;
        } else {
          cacheSigns[state.navIndex] = signs;
        }
        sessionStorage.setItem("cacheSigns", JSON.stringify(cacheSigns));
      },
      submit: async () => {
        state.formRef?.validate((valid: boolean) => {
          if (!valid) {
            const formData = new FormData();
            formData.append("file", (state.formData as any).get("file"));

            return;
          }
        });
      },
      renderPage(num) {
        //判断是否为第一次加载  删除第一次默认加载的canvas
        let contentPDF = document.querySelector(".content-pdf");
        let NewCanvas = document.querySelectorAll(".n-canvas");
        let canvasContainer = document.querySelector(".canvas-container");
        if (canvasContainer) {
          contentPDF.removeChild(canvasContainer);
          let EleCanvas = document.createElement("canvas");
          EleCanvas.setAttribute(
            "style",
            "width: 100%; margin: 0 auto;height:0;border: 1px solid #5ea6ef;"
          );
          EleCanvas.setAttribute("id", "ele-canvas");
          contentPDF.appendChild(EleCanvas);
        }
        // contentPDF.remove();  //删除上一次页面的canvas
        for (let i = 0; i < NewCanvas.length; i++) {
          contentPDF.removeChild(NewCanvas[i]);
        }

        state.pageRendering = true;
        return pdfDoc.getPage(num).then(funMethods.handsPage);
      },
      handsPage: (page) => {
        let viewport = page.getViewport({ scale: state.scale }); //设置视口大小
        var canvas = document.createElement("canvas");
        canvas.setAttribute("class", "n-canvas");
        canvas.style.display = "block";
        var context = canvas.getContext("2d");
        state.pageHeight = viewport.height;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        state.canvas.height = state.canvas.height + viewport.height;
        state.canvas.width = viewport.width;
        let renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        let renderTask = page.render(renderContext);
        document.querySelector(".content-pdf").appendChild(canvas);
        state.pageNum++;
        if (pdfDoc !== null && state.pageNum <= state.numPages) {
          pdfDoc.getPage(state.pageNum).then(funMethods.handsPage);
        } else {
          funMethods.renderPdf({
            width: state.canvas.width,
            height: state.canvas.height,
          });
          state.loading = false;
          state.imgLoading = false;
        }
      },
      renderPdf(data) {
        state.whDatas = data;
        (document.querySelector("#ele-canvas") as any).style.height =
          data.height + "px";
      },
      getPosition: (top) => {
        let tops = {
          top: <any>"", //当前高度,
          page: 1, //当前页数
        };
        if (top <= state.pageHeight) {
          //如果当前高度小于一页的高度  代表再第一页
          tops = {
            top: props.sealData.type === "pdf" ? state.pageHeight - top : top,
            page: 1,
          };
        } else {
          let page = Math.ceil(top / state.pageHeight); //向上取整
          let newTop = Math.ceil(top - (page - 1) * state.pageHeight);
          console.log(page, newTop);
          tops = {
            top:
              props.sealData.type === "pdf"
                ? state.pageHeight - newTop
                : newTop,
            page: page,
          };
        }
        return tops;
      },
      //生成绘图区域
      renderFabric() {
        let canvaEle: any = <HTMLElement>document.querySelector("#ele-canvas");
        canvaEle.width = state.whDatas.width;
        canvaEle.height = state.whDatas.height;
        state.canvas = new fabric.Canvas(canvaEle);
        let container: any = document.querySelector(".canvas-container");
        let upperCanvas = document.querySelector(".upper-canvas");
        container.style.position = "absolute";
        container.style.top = "0";
        container.style.bottom = "100px";
        funMethods.commonSign();
      },
      //添加签章
      addSeal(sealUrl, left, top, index, isend = true) {
        fabric.Image.fromURL(sealUrl.sealImg, (oImg) => {
          oImg.set({
            left: left,
            top: top,
            // angle: 10,
            opacity: 0.8,
            scaleX: 1,
            scaleY: 1,
            index: sealUrl.id,
          });
          oImg.scaleToWidth(mmConversionPx(sealUrl.imgWidth)); //
          oImg.scaleToHeight(mmConversionPx(sealUrl.imgHeight)); //

          state.canvas.add(oImg);
        });
      },
      //盖章回显
      commonSign(isFirst = false) {
        let caches = JSON.parse(sessionStorage.getItem("cacheSigns")); //获取缓存字符串后转换为对象
        console.log(caches, "我是缓存的", state.navIndex);
        if (caches == null) return false;
        let datas = caches[state.navIndex];
        if (datas != null && datas != undefined) {
          for (let index in datas) {
            funMethods.addSeal(
              {
                sealImg: datas[index].sealUrl,
                id: datas[index].index,
                imgWidth: datas[index].width,
                imgHeight: datas[index].height,
              },
              datas[index].left,
              datas[index].top,
              datas[index].index,
              false
            );
          }
        }
      },
      // 相关事件操作
      canvasEvents() {
        if (state.canvas !== null) {
          // 拖拽边界 不能将图片拖拽到绘图区域外
          state.canvas.on("object:moving", function (e) {
            var obj = e.target;

            if (
              obj.height > obj.canvas.height ||
              obj.width > obj.canvas.width
            ) {
              obj.setScaleY(obj.originalState.scaleY);
              obj.setScaleX(obj.originalState.scaleX);
            }
            obj.setCoords();
            if (
              obj.getBoundingRect().top - obj.cornerSize / 2 < 0 ||
              obj.getBoundingRect().left - obj.cornerSize / 2 < 0
            ) {
              obj.top = Math.max(
                obj.top,
                obj.top - obj.getBoundingRect().top + obj.cornerSize / 2
              );
              obj.left = Math.max(
                obj.left,
                obj.left - obj.getBoundingRect().left + obj.cornerSize / 2
              );
            }
            if (
              obj.getBoundingRect().top +
                obj.getBoundingRect().height +
                obj.cornerSize >
                obj.canvas.height ||
              obj.getBoundingRect().left +
                obj.getBoundingRect().width +
                obj.cornerSize >
                obj.canvas.width
            ) {
              obj.top = Math.min(
                obj.top,
                obj.canvas.height -
                  obj.getBoundingRect().height +
                  obj.top -
                  obj.getBoundingRect().top -
                  obj.cornerSize / 2
              );
              obj.left = Math.min(
                obj.left,
                obj.canvas.width -
                  obj.getBoundingRect().width +
                  obj.left -
                  obj.getBoundingRect().left -
                  obj.cornerSize / 2
              );
            }
          });
        }
      },
      end(e) {
        if (
          //判断是否进入pdf印章
          e.originalEvent.srcElement.getAttributeNode("class").nodeValue ===
          "upper-canvas "
        ) {
          console.log(
            e.originalEvent.layerX -
              mmConversionPx(
                state.mainImagelist[e.newDraggableIndex].imgWidth / 2
              ),
            e.originalEvent.layerY -
              mmConversionPx(
                state.mainImagelist[e.newDraggableIndex].imgHeight / 2
              )
          );
          funMethods.addSeal(
            state.mainImagelist[e.newDraggableIndex],
            e.originalEvent.layerX -
              mmConversionPx(
                state.mainImagelist[e.newDraggableIndex].imgWidth / 2
              ),
            e.originalEvent.layerY -
              mmConversionPx(
                state.mainImagelist[e.newDraggableIndex].imgHeight / 2
              ),
            e.newDraggableIndex
          );
        }
      },
      //确认签章位置并保存到本地
      confirmSignature() {
        let data = state.canvas.getObjects(); //获取当前页面内的所有签章信息
        console.log(data, "我是当前签章的东西");
        let caches = JSON.parse(sessionStorage.getItem("signs")); //获取缓存字符串后转换为对象
        let signDatas = {}; //存储当前页的所有签章信息
        let i = 0;
        let sealUrl = "";
        for (var val of data) {
          signDatas[i] = {
            width: val.width,
            height: val.height,
            top: val.top,
            left: val.left,
            angle: val.angle,
            translateX: val.translateX,
            translateY: val.translateY,
            scaleX: val.scaleX,
            scaleY: val.scaleY,
            pageNum: state.pageNum,
            sealUrl: state.mainImagelist[val.index],
            index: val.index,
          };
          i++;
        }
        if (caches == null) {
          caches = {};
          caches[state.pageNum] = signDatas;
        } else {
          caches[state.pageNum] = signDatas;
        }
        sessionStorage.setItem("signs", JSON.stringify(caches)); //对象转字符串后存储到缓存
      },
      removeSignature: () => {
        state.canvas.remove(state.canvas.getActiveObject());
      },
      clearSignature: () => {
        state.canvas.remove(state.canvas.clear()); //清空页面所有签章
        sessionStorage.clear();
        //清除缓存
      },
      submitSignature: async () => {
        state.btnloading = true;
        funMethods.submitCaChe(); //先将当前页面的保存到本地
        const cacheSigns = JSON.parse(sessionStorage.getItem("cacheSigns")); //缓存中的印章
        let sealInfoDtoList = [];
        for (const key in cacheSigns) {
          let list = Object.values(cacheSigns[key]).map((item: any) => {
            return {
              x: pxConversionMm(item.left) + item.width / 2, //加上自身宽度一半
              y:
                props.sealData.type === "pdf"
                  ? pxConversionMm(funMethods.getPosition(item.top).top) +
                    -item.height / 2
                  : pxConversionMm(funMethods.getPosition(item.top).top) +
                    item.height / 2, //转换坐标
              sealId: item.index,
              pageNum: funMethods.getPosition(item.top).page,
              fileNumber: props.fileList[key].fileNumber,
            };
          });
          sealInfoDtoList.push(...list);
        }
        const params = {
          taskName: props.sealData.taskName,
          tagNames: props.sealData.tagNames,
          sealInfoDtoList,
          remark: props.sealData.remark,
          type: props.sealData.type,
        };
        let result = await AddWork(params, () => {
          state.btnloading = false;
        });
        if (result) {
          ElMessage.success("操作成功");
          state.btnloading = false;
          emit("close");
        }
      },
      //pdf文件流转url
      getPDFURL: (file, type = "application/pdf;chartset=UTF-8") => {
        return window.URL.createObjectURL(new Blob([file], { type }));
      },
      showPDF: (file) => {
        nextTick(async () => {
          state.canvas = document.getElementById("the-canvas");
          state.canvas.height = 0;
          state.ctx = state.canvas.getContext("2d");
          pdfjsLib
            .getDocument({
              url: funMethods.getPDFURL(file),
              rangeChunkSize: 65536,
              disableAutoFetch: false,
            })
            .promise.then(async (pdfDoc_) => {
              // state.pdfDoc = pdfDoc_;
              pdfDoc = pdfDoc_;
              state.numPages = pdfDoc_.numPages;
              console.log(pdfDoc_.numPages);
              // for (let index = 0; index < pdfDoc_.numPages; index++) {
              let result = await funMethods.renderPage(state.pageNum);
              // }
              // funMethods.commonSign(state.pageNum, true);
            });
        });
      },
      getFile: () => {},
    };
    const api = {
      // getSignList: async () => {
      //   let result = await SeakList({ type: props.sealData.type });
      //   state.mainImagelist = result;

      // },
      getPDf: async (index) => {
        const params = {
          url: "/file/downloadTempFile",
          data: {
            uniqueNumber: props.fileList[index].fileNumber,
          },
        };
        let result = await apiDownloadFile(params);
        funMethods.showPDF(result);
      },
    };
    onMounted(() => {
      sessionStorage.removeItem("cacheSigns");
      api.getPDf(0);
      // api.getSignList();
    });
    return {
      ...toRefs(state),
      ...funMethods,
      ...api,
      ...props,
      emit,
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
.canvas-container {
  // position: absolute;
  // top: 60px;
  // left: 0;
  // right: 0;
  // bottom: 50px;
}
.content {
  max-height: 800px;
  height: 700px;
  display: flex;

  .center_img {
    width: 240px;
    margin: 0 10px;
    height: 100%;
    overflow-y: scroll;
    .imgstyle {
      height: 150px;
      width: 150px;
      margin-bottom: 20px;
    }
  }

  .right_pdf {
    flex: 1;
    position: relative;

    ::v-deep .el-card__body {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
    }

    .page {
      height: 40px;
      display: flex;
      justify-content: space-between;
    }

    #the-canvas {
      margin-top: 10px;
      position: absolute;
      top: 60px;
      bottom: 50px;
      left: 0;
      right: 0;
    }

    .content-pdf {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 100px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    #ele-canvas {
      border: 1px solid #5ea6ef;
      overflow: hidden;
    }
  }
  #ele-canvas {
    border: 1px solid #5ea6ef;
  }
  .left_nav {
    width: 200px;

    li {
      height: 40px;
      font-size: 14px;
      font-weight: bold;
      line-height: 40px;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
