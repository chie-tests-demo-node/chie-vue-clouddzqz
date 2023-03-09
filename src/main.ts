import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementPlus from "element-plus";
import locale from "element-plus/lib/locale/lang/zh-cn";
import "./registerServiceWorker";
import "element-plus/dist/index.css";
import "@/assets/reset.css";
// iconfont 图标
import "@/assets/icon/iconfont.css";

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus, { locale })
  .mount("#app");
