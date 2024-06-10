<template>
    <n-space justify="space-between" class="center-aligned">
        <span
            :style="{ display: isHidden ? 'none' : 'flex', color: themeStore.primaryColor, marginLeft: '24px', fontSize: '26px', transition: 'color 0.2s' }">
            ChmlFrp
        </span>
        <div :style="{ display: isHidden ? 'flex' : 'none' }">
            <n-dropdown size="large" :options="menuOptions">
                <n-button quaternary style="font-size: 18px">
                    <n-icon :component="MenuOutline" style="cursor: pointer;"></n-icon>
                </n-button>
            </n-dropdown>
        </div>
        <n-space class="center-aligned" justify="space-between">
            <n-popover trigger="hover">
                <template #trigger>
                    <n-button quaternary style="font-size: 18px;" @click="ThemeSwitcherDrawer('right')">
                        <n-icon :component="SettingsOutline" style="cursor: pointer;"></n-icon>
                    </n-button>
                </template>
                <span>面板设置</span>
            </n-popover>
            <n-dropdown trigger="hover" :options="userDropdownOptions">
                <n-button quaternary size="large" class="avatar-container">
                    <n-avatar round size="large"
                        src="https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg"
                        style="cursor: pointer;"></n-avatar>
                    <div class="text-container">
                        <n-performant-ellipsis style="max-width: 90px">
                            <div class="text-top">chaoji</div>
                        </n-performant-ellipsis>
                        <div class="text-bottom">超级会员</div>
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
import { ref, h, Component } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { NAvatar, NText, NIcon, useMessage, type DrawerPlacement } from 'naive-ui'
import ThemeSwitcher from './ThemeSwitcher.vue';
import { useRouter } from 'vue-router';
import { menuOptions } from './Options/Menu'
import {
    PersonCircleOutline as UserIcon,
    LogOutOutline as LogoutIcon,
    MenuOutline
} from '@vicons/ionicons5'

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
                src: 'https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg'
            }),
            h('div', null, [
                h('div', null, [h(NText, { depth: 2 }, { default: () => 'chaoji233' })]),
                h('div', { style: 'font-size: 12px;' }, [
                    h(
                        NText,
                        { depth: 3 },
                        { default: () => 'chaoji@chcat.cn' }
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
const userDropdownOptions = [
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
                message.success('成功退出登陆，用户信息已清空');
                router.push('/login')
            },
        },
    },
]
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
</style>
