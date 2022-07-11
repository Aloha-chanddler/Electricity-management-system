import Vue from "vue";
import VueRouter from 'vue-router'
import LoginPage from '@/components/LoginPage'
import HomePage from '@/components/HomePage'
import WelcomePage from '@/components/WelcomePage'
import UserPage from '@/components/user/UserPage'
import RightsPage from '@/components/right/RightsPage'
Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
    {
      path:'/',
      redirect:'/login'
    },
    {
      path:'/login',
      component:LoginPage
    },
    {
      path:'/home',
      component:HomePage,
      redirect:'/welcome',
      children:[
        {
          path:'/welcome',
          component:WelcomePage
        },
        {
          path:'/users',
          component:UserPage
        },
        {
          path:'/rights',
          component:RightsPage
        },
      ]
    }
  ]
})
// 为路由添加beforeEach守卫
router.beforeEach((to,from,next)=>{
  // 如果跳转的目标页面时login页面，则放行
  if(to.path === '/login') return next()
  // 获取sessionstorage中保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 判断：如果页面中没有token，则统一强制跳转到‘/login’页面
  if(!tokenStr) return next('/login')
  // 如果页面中有token则跳转到'/home'主页
  next()
})

export default router 