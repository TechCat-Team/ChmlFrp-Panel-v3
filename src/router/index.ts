import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useProviderStore } from '../stores/provider'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '/home',
        name: '首页',
        component: () => import('@/pages/HomePage.vue'),
      },
    ]
  },
  {
    path: '/',
    name: '隧道管理',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '/tunnel/list',
        name: '隧道列表',
        component: () => import('@/pages/Tunnel/List.vue'),
      },
      {
        path: '/tunnel/download',
        name: '软件下载',
        component: () => import('@/pages/Tunnel/Download.vue'),
      },
      {
        path: '/tunnel/config',
        name: '配置文件',
        component: () => import('@/pages/Tunnel/Config.vue'),
      },
      {
        path: '/tunnel/status',
        name: '节点状态',
        component: () => import('@/pages/Tunnel/Status.vue'),
      },
    ]
  },
  // {
  //   path: '/login',
  //   name: '登录',
  //   component: () => import('@/views/LoginView.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(() => {
  useProviderStore().loadingBar?.start()
})

router.afterEach(() => {
  useProviderStore().loadingBar?.finish()
})

export default router
