import Vue from 'vue'
import VueRouter from 'vue-router'
import ScreenPageVue from '@/views/ScreenPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/screen'
  },
  {
    path: '/screen',
    component: ScreenPageVue
  }
]

const router = new VueRouter({
  routes
})

export default router
