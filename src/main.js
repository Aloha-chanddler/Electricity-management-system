import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import '@/assets/css/global.css'
import '@/assets/fonts/iconfont.css'

import { Form, FormItem, Input,Button,Container,Header,Aside,Main,Menu,Submenu,MenuItem } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import {Message} from 'element-ui'
Vue.prototype.$message = Message
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)


import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config);
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
