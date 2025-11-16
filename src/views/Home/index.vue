<template>
    <n-layout style="height: 100vh">
        <n-layout-header round>
            <HeaderComponent />
        </n-layout-header>
        <n-layout :inverted="true" position="absolute" style="top: 60px" has-sider>
            <n-layout-sider
                :style="{ display: isHidden ? 'none' : 'flex' }"
                collapse-mode="width"
                :collapsed-width="64"
                :width="240"
                :collapsed="collapsed"
                show-trigger
                @collapse="handleCollapse"
                @expand="handleExpand"
                :native-scrollbar="false"
            >
                <MenuComponent />
            </n-layout-sider>
            <n-layout content-style="padding: 24px;" :native-scrollbar="false">
                <router-view></router-view>
            </n-layout>
        </n-layout>
    </n-layout>
</template>

<script lang="ts" setup>
import { useLayoutStore } from '@/stores/useLayout';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

// 菜单适配手机端，自动隐藏sider
const screenStore = useScreenStore();
const { isHidden } = storeToRefs(screenStore);

const layoutStore = useLayoutStore();
const collapsed = computed(() => layoutStore.collapsed);

const handleCollapse = () => {
    layoutStore.setCollapse(true);
};

const handleExpand = () => {
    layoutStore.setCollapse(false);
};
</script>
