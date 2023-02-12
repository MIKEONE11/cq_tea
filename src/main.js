import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 公共的css文件
import '@/assets/css/common.css'

// iconfont css文件
import '@/assets/iconfont/css/iconfont.css'

// 淘宝无限适配文件
import '@/assets/js/flexible.js'

// ly-tab 插件
import LyTab from 'ly-tab';
Vue.use(LyTab);

//全局引入 mint-ui 
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.use(MintUI)

//全局引入：vant
import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(Vant)

// 全局引入 fastclick
import  FastClick from 'fastclick'
FastClick.attach(document.body);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
