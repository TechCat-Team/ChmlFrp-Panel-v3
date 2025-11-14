import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useProviderStore } from '../stores/provider';
import { useUserStore } from '../stores/user';

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
                meta: {
                    title: 'ChmlFrp - 控制台首页',
                    keywords: 'ChmlFrp, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: 'ChmlFrp控制台首页，您可以在这里查看您的ChmlFrp账户预览',
                    requiresAuth: true,
                },
            },
            {
                path: '/user',
                name: '个人资料',
                component: () => import('@/pages/UserPage.vue'),
                meta: {
                    title: '个人资料 - ChmlFrp',
                    keywords: 'ChmlFrp, 个人资料, 用户信息, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '管理和查看您的ChmlFrp个人资料和账户信息。',
                    requiresAuth: true,
                },
            },
        ],
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
                meta: {
                    title: '隧道列表 - ChmlFrp',
                    keywords: 'ChmlFrp, 隧道管理, 隧道列表, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看和管理您的ChmlFrp所有映射隧道列表。',
                    requiresAuth: true,
                },
            },
            {
                path: '/tunnel/download',
                name: '软件下载',
                component: () => import('@/pages/Tunnel/DownloadPage.vue'),
                meta: {
                    title: '软件下载 - ChmlFrp',
                    keywords: 'ChmlFrp, 软件下载, 客户端, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '下载ChmlFrp的各种客户端软件，支持多平台。',
                },
            },
            {
                path: '/tunnel/config',
                name: '配置文件',
                component: () => import('@/pages/Tunnel/ConfigPage.vue'),
                meta: {
                    title: '配置文件 - ChmlFrp',
                    keywords: 'ChmlFrp, 配置文件, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '配置和管理您的ChmlFrp映射配置文件。',
                    requiresAuth: true,
                },
            },
            {
                path: '/tunnel/status',
                name: '节点状态',
                component: () => import('@/pages/Tunnel/StatusPage.vue'),
                meta: {
                    title: '节点状态 - ChmlFrp',
                    keywords: 'ChmlFrp, 节点状态, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看ChmlFrp端口映射节点的实时负载状态。',
                },
            },
        ],
    },
    {
        path: '/',
        name: '扩展功能',
        component: () => import('@/views/HomeView.vue'),
        children: [
            {
                path: '/expand/domain-name',
                name: '免费域名',
                component: () => import('@/pages/Expand/DomainName.vue'),
                meta: {
                    title: '免费域名 - ChmlFrp',
                    keywords: 'ChmlFrp, 免费域名, 域名服务, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '在ChmlFrp获取和管理您的免费域名。',
                    requiresAuth: true,
                },
            },
            {
                path: '/expand/free-ssl',
                name: '免费SSL',
                component: () => import('@/pages/Expand/FreeSSL.vue'),
                meta: {
                    title: '免费SSL - ChmlFrp',
                    keywords: 'ChmlFrp, 免费SSL证书, SSL, 端口映射, frp, 免费frp, 映射',
                    description: '您可以在ChmlFrp免费申请SSL证书',
                    requiresAuth: true,
                },
            },
            {
                path: '/expand/app-marketplace',
                name: '应用市场',
                component: () => import('@/pages/Expand/AppMarketplace.vue'),
                meta: {
                    title: 'ChmlFrp应用市场 - ChmlFrp',
                    keywords: 'ChmlFrp, 应用市场, 第三方应用市场, ChmlFrp应用市场, ChmlFrp软件, frp, 免费frp, 映射',
                    description:
                        '这里包含了所有ChmlFrp的官方、第三方应用，包含接入了ChmlFrp的MC开服器、ChmlFrp便携启动器等。',
                    requiresAuth: true,
                },
            },
        ],
    },
    {
        path: '/',
        name: '增值中心',
        component: () => import('@/views/HomeView.vue'),
        children: [
            {
                path: '/shop/top-up',
                name: '积分充值',
                component: () => import('@/pages/Shop/TopUp.vue'),
                meta: {
                    title: '积分充值 - ChmlFrp',
                    keywords: 'ChmlFrp, 积分充值, 增值服务, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '充值积分以获取更多增值服务。',
                    requiresAuth: true,
                },
            },
            {
                path: '/shop/buy',
                name: '积分商城',
                component: () => import('@/pages/Shop/BuyPage.vue'),
                meta: {
                    title: '积分商城 - ChmlFrp',
                    keywords: 'ChmlFrp, 积分商城, 增值服务, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '在ChmlFrp积分商城购买会员、带宽、隧道上限等各种增值服务。',
                    requiresAuth: true,
                },
            },
        ],
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
                meta: {
                    title: '关于面板 - ChmlFrp',
                    keywords: 'ChmlFrp, 关于我们, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '了解更多关于ChmlFrp控制面板的信息。',
                },
            },
            {
                path: '/other/log',
                name: '用户日志',
                component: () => import('@/pages/Other/LogPage.vue'),
                meta: {
                    title: '用户日志 - ChmlFrp',
                    keywords: 'ChmlFrp, 用户日志, 操作记录, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看您的ChmlFrp操作日志记录。',
                    requiresAuth: true,
                },
            },
        ],
    },
    {
        path: '/sign',
        name: '登录',
        component: () => import('@/views/SignView.vue'),
        meta: {
            title: '登录 - ChmlFrp',
            keywords: 'ChmlFrp, 登录, 用户认证, 内网穿透, 端口映射, frp, 免费frp, 映射',
            description: '登录到ChmlFrp控制台管理面板',
        },
    },
    {
        path: '/tunnel/info',
        name: '隧道详情',
        component: () => import('@/views/TunnelInfo.vue'),
        meta: {
            title: '隧道详情 - ChmlFrp',
            keywords: 'ChmlFrp, 隧道详情, 内网穿透, 端口映射, frp, 免费frp, 映射',
            description:
                'ChmlFrp用户隧道详情，这里会展示隧道连接数，今日流量，节点负载信息，隧道基础信息及关联程序等。',
        },
    },
    {
        path: '/node/info',
        name: '节点详情',
        component: () => import('@/views/NodeInfo.vue'),
        meta: {
            title: '节点详情 - ChmlFrp',
            keywords: 'ChmlFrp, 节点详情, 内网穿透, 端口映射, frp, 免费frp, 映射',
            description: 'ChmlFrp单个节点详情，这里会展示映射节点关联数据。',
        },
    },
    {
        path: '/',
        name: '管理面板',
        component: () => import('@/views/HomeView.vue'),
        children: [
            {
                path: '/admin/overall',
                name: '系统总览',
                component: () => import('@/pages/Admin/OverallPage.vue'),
                meta: {
                    title: '总览 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/panel',
                name: '面板管理',
                component: () => import('@/pages/Admin/PanelSettings.vue'),
                meta: {
                    title: '面板管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/node',
                name: '节点管理',
                component: () => import('@/pages/Admin/NodeManagement.vue'),
                meta: {
                    title: '节点管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/user',
                name: '用户管理',
                component: () => import('@/pages/Admin/UserManagement.vue'),
                meta: {
                    title: '用户管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/tunnel',
                name: '管理隧道',
                component: () => import('@/pages/Admin/TunnelManagement.vue'),
                meta: {
                    title: '隧道管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/gift-code',
                name: '兑换码管理',
                component: () => import('@/pages/Admin/ExchangeCode.vue'),
                meta: {
                    title: '兑换码管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/domain-name',
                name: '免费域名管理',
                component: () => import('@/pages/Admin/DomainNameManagement.vue'),
                meta: {
                    title: '免费域名管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            }
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    void from;

    useProviderStore().loadingBar?.start();

    const userStore = useUserStore();
    const isAuthenticated = !!userStore.userInfo; // 检查是否存在用户信息

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 如果路由需要认证且用户未登录
        next({ path: '/sign' });
    } else {
        next();
    }
});

router.afterEach(() => {
    useProviderStore().loadingBar?.finish();
});

export default router;
