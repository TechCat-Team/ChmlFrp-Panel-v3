<template>
    <n-space justify="space-between">
        <span
            :style="{ display: isHidden ? 'none' : 'flex', color: themeStore.primaryColor, marginLeft: '24px', fontSize: '26px', transition: 'color 0.2s' }">
            ChmlFrp
        </span>
        <div :style="{ display: isHidden ? 'flex' : 'none' }">
            <n-dropdown size="large" :options="computedMenuOptions">
                <n-button quaternary style="font-size: 18px">
                    <n-icon :component="MenuOutline" style="cursor: pointer;"></n-icon>
                </n-button>
            </n-dropdown>
        </div>
        <n-space class="center-aligned" justify="space-between">
            <n-popover trigger="click" style="border-radius: 8px; max-height: 60vh; width: 350px">
                <template #trigger>
                    <n-button quaternary style="position: relative">
                        <n-icon :component="NotificationsOutline" style="font-size: 18px; cursor: pointer">
                            <n-badge v-if="unreadCount" :value="unreadCount" type="error" :max="99" />
                        </n-icon>
                    </n-button>
                </template>

                <n-spin :show="loading">
                    <n-list v-if="notifications.length">
                        <n-list-item v-for="notice in notifications" :key="notice.id">
                            <n-thing content-indented>
                                <template #header>
                                    <n-time :time="new Date(notice.time)" type="relative" />
                                </template>
                                <template #description>
                                    <n-text depth="3">{{ formatMessageTime(notice.time) }}</n-text>
                                </template>
                                <n-text>{{ notice.content }}</n-text>
                            </n-thing>
                        </n-list-item>
                    </n-list>

                    <n-empty v-else size="large" description="暂时没有新消息" style="margin: 20px 0" />
                </n-spin>
            </n-popover>
            <n-popover trigger="hover" style="border-radius: 8px;">
                <template #trigger>
                    <n-button quaternary style="font-size: 18px;" @click="ThemeSwitcherDrawer('right')">
                        <n-icon :component="SettingsOutline" style="cursor: pointer;"></n-icon>
                    </n-button>
                </template>
                <span>面板设置</span>
            </n-popover>
            <n-dropdown trigger="hover" :options="userDropdownOptions">
                <n-button quaternary size="large">
                    <n-avatar v-if="userInfo?.userimg" round size="large" :src="userInfo?.userimg"
                        style="cursor: pointer;">
                    </n-avatar>
                    <n-avatar v-else round>
                        CF
                    </n-avatar>
                    <div class="text-container">
                        <n-performant-ellipsis style="max-width: 90px">
                            <div class="text-top">{{ userInfo?.username || '尚未登陆' }}</div>
                        </n-performant-ellipsis>
                        <div class="text-bottom">{{ userInfo?.usergroup || '游客' }}</div>
                    </div>
                </n-button>
            </n-dropdown>
        </n-space>
    </n-space>
    <n-drawer v-model:show="themeSwitcherDrawer" :placement="placement" :default-width="251" resizable>
        <n-drawer-content title="面板配置">
            <ThemeSwitcher />
        </n-drawer-content>
    </n-drawer>
</template>

<script lang="ts" setup>
import { SettingsOutline } from '@vicons/ionicons5'
import { useThemeStore } from '@/stores/theme';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { NAvatar, NText, NIcon, DropdownOption, type DrawerPlacement } from 'naive-ui'
import { useRouter } from 'vue-router';
import { computedMenuOptions } from './Options/Menu'
import {
    PersonCircleOutline as UserIcon,
    LogOutOutline as LogoutIcon,
    MenuOutline, LogInOutline, NotificationsOutline
} from '@vicons/ionicons5'
// 获取登录信息
import { useUserStore } from '@/stores/user';
import dayjs from 'dayjs'

const userStore = useUserStore();
const userInfo = userStore.userInfo;

// 通知数据结构
interface Notification {
    id: number
    userid: number
    content: string
    quanti: string
    time: string
}

// 响应式数据
const notifications = ref<Notification[]>([])
const loading = ref(true)
const unreadCount = ref(0)

// 格式化时间显示
const formatMessageTime = (isoTime: string) => {
    return dayjs(isoTime).format('YYYY-MM-DD HH:mm')
}

// 获取通知数据
const fetchNotifications = async () => {
    try {
        const response = await fetch('https://cf-v2.uapis.cn/messages?token=7ulOTvzeKHDaeKsjDVsjfT3F')
        const { state, data, code } = await response.json()
        
        if (code === 200 && state === 'success') {
            notifications.value = data
            // 根据quanti字段计算未读数（根据实际业务需求调整）
            unreadCount.value = data.filter((n: { quanti: string; }) => n.quanti === 'yes').length
        }
    } catch (e) {
        console.error('获取通知失败:', e)
        message.error('获取通知失败，请检查网络')
    } finally {
        loading.value = false
    }
}

// UserDropdown图标函数
const renderIcon = (icon: Component, color?: string) => {
    return () => {
        return h(NIcon, { size: '24', color }, { default: () => h(icon) });
    };
};

// 纯内容渲染-用户基本资料
function renderCustomHeader() {
    return h(
        'div',
        {
            style: 'display: flex; align-items: center; padding: 8px 12px;'
        },
        [
            h(NAvatar, {
                round: true,
                style: 'margin-right: 12px;',
                src: userInfo?.userimg || undefined
            }),
            h('div', null, [
                h('div', null, [h(NText, { depth: 2 }, { default: () => userInfo?.username || '您尚未登录' })]),
                h('div', { style: 'font-size: 12px;' }, [
                    h(
                        NText,
                        { depth: 3 },
                        { default: () => userInfo?.email || 'example@chcat.cn' }
                    )
                ])
            ])
        ]
    )
}
// Router
const router = useRouter();
// 顶部消息
const message = useMessage()

// 基础的手机端适配
const screenStore = useScreenStore();
const { isHidden } = storeToRefs(screenStore);

const themeSwitcherDrawer = ref(false)
const placement = ref<DrawerPlacement>('right')
const themeStore = useThemeStore(); // 使用useThemeStore获取主题色
const ThemeSwitcherDrawer = (place: DrawerPlacement) => {
    themeSwitcherDrawer.value = true
    placement.value = place
}

const userDropdownOptions = ref<DropdownOption[]>([]);

const updateUserDropdownOptions = () => {
    if (userInfo) {
        userDropdownOptions.value = [
            {
                key: 'header',
                type: 'render',
                render: renderCustomHeader
            },
            {
                label: '用户资料',
                key: 'profile',
                icon: renderIcon(UserIcon),
                props: {
                    onClick: () => {
                        router.push('/user');
                    }
                }
            },
            {
                label: '退出登录',
                key: 'logout',
                icon: renderIcon(LogoutIcon, '#f5222d'),
                props: {
                    onClick: () => {
                        userStore.clearUser();
                        message.success('成功退出登陆，用户信息已清空');
                        router.push('/sign');
                    },
                },
            }
        ];
    } else {
        userDropdownOptions.value = [
            {
                key: 'header',
                type: 'render',
                render: renderCustomHeader
            },
            {
                label: '登录',
                key: 'login',
                icon: renderIcon(LogInOutline, '#529b2e'),
                props: {
                    onClick: () => {
                        router.push('/sign');
                    },
                },
            }
        ];
    }
};
// 初始化菜单项
updateUserDropdownOptions();

onMounted(fetchNotifications);
</script>

<style>
.center-aligned {
    display: flex;
    align-items: center;
    height: 60px;
}

.avatar-container {
    display: flex;
    align-items: center;
    margin-right: 12px;
}

.text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 8px;
}

.text-top,
.text-bottom {
    font-size: 12px;
    text-align: left;
}

.text-top {
    font-weight: bold;
}

.text-bottom {
    color: #999;
}

.logo-text {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: color var(--transition-duration);
}
</style>
