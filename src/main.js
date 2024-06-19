import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import '../src/assets/css/global.css'
import './assets/font/iconfont.css'
import SocketService from '@/utils/socket_service'

// 获取实例对象,对服务端进行websocket的连接
SocketService.Instance.connect()
// 挂载SocketService对象到Vue的原型对象上,其他的组件通过this.socket调用其中方法
Vue.prototype.$socket = SocketService.Instance

// 全局引入echart
Vue.prototype.$echarts = echarts
// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
//  将axios挂载到Vue的原型对象上，别的组件里通过this.$http拿到axios
Vue.prototype.$http = axios

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
