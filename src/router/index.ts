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
      {
        path: '/user',
        name: '个人资料',
        component: () => import('@/pages/UserPage.vue')
      }
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
        component: () => import('@/pages/Tunnel/ListPage.vue'),
      },
      {
        path: '/tunnel/download',
        name: '软件下载',
        component: () => import('@/pages/Tunnel/DownloadPage.vue'),
      },
      {
        path: '/tunnel/config',
        name: '配置文件',
        component: () => import('@/pages/Tunnel/ConfigPage.vue'),
      },
      {
        path: '/tunnel/status',
        name: '节点状态',
        component: () => import('@/pages/Tunnel/StatusPage.vue'),
      },
    ]
  },
  {
    path: '/',
    name: '扩展功能',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '/expand/domainname',
        name: '免费域名',
        component: () => import('@/pages/Expand/DomainName.vue'),
      },
    ]
  },
  {
    path: '/',
    name: '增值中心',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '/shop/topup',
        name: '积分充值',
        component: () => import('@/pages/Shop/TopUp.vue'),
      },
      {
        path: '/other/buy',
        name: '积分商城',
        component: () => import('@/pages/Shop/BuyPage.vue'),
      },
      {
        path: '/other/record',
        name: '消费记录',
        component: () => import('@/pages/Shop/RecordPage.vue'),
      },
    ]
  },
  {
    path: '/',
    name: '其他信息',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '/other/about',
        name: '关于面板',
        component: () => import('@/pages/Other/AboutPage.vue'),
      },
    ]
  }
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
