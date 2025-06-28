<template>
    <n-config-provider :hljs="hljs" :theme="computedTheme" :theme-overrides="themeOverrides">
        <!-- 加载条 -->
        <n-loading-bar-provider>
            <!-- 顶部信息 -->
            <n-message-provider>
                <!-- 对话框 -->
                <n-dialog-provider>
                    <ViewComponent />
                </n-dialog-provider>
            </n-message-provider>
        </n-loading-bar-provider>
    </n-config-provider>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme';
import { RouterView } from 'vue-router';
import { useProviderStore } from './stores/provider';
import { useUserStore } from '@/stores/user';
import hljs from 'highlight.js/lib/core';
import ini from 'highlight.js/lib/languages/ini';
import nginx from 'highlight.js/lib/languages/nginx';
import powershell from 'highlight.js/lib/languages/powershell';

hljs.registerLanguage('ini', ini);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('powershell', powershell);

const userStore = useUserStore();

onMounted(() => {
    userStore.loadUser();
});

// 获取当前年份
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

// 控制台输出版权信息
const chmlFrpPanel = ` _____         _      ____      _   
|_   _|__  ___| |__  / ___|__ _| |_ 
  | |/ _ \\/ __| '_ \\| |   / _\` | __|
  | |  __/ (__| | | | |__| (_| | |_ 
  |_|\\___|\\___|_| |_|\\____\\__,_|\\__|
`;
console.info(chmlFrpPanel);
console.info(`Copyright 2021 - ${currentYear} TechCat All rights reserved.`);

const themeStore = useThemeStore();

const computedTheme = computed(() => {
    return themeStore.theme === 'dark' ? darkTheme : lightTheme;
});

const themeOverrides = computed(() => {
    const commonColors = {
        primaryColor: themeStore.primaryColor,
        primaryColorHover: themeStore.primaryColor,
        primaryColorPressed: themeStore.primaryColor,
        primaryColorSuppl: themeStore.primaryColor,
    };

    const lightThemeOverrides = {
        bodyColor: '#f5f5f5', // 更改亮色主题下的背景颜色
    };

    return {
        common: {
            ...commonColors,
            ...(themeStore.theme === 'light' ? lightThemeOverrides : {}),
        },
        Button: {
            // 调整Primary按钮，让它看起来更合适
            textColorPrimary: '#fff',
            textColorHoverPrimary: '#fff',
            textColorPressedPrimary: '#fff',
            textColorFocusPrimary: '#fff',
            textColorDisabledPrimary: '#fff',
            colorPrimary: themeStore.primaryColor,
            colorHoverPrimary: themeStore.primaryColor,
            colorPressedPrimary: themeStore.primaryColor,
            colorFocusPrimary: themeStore.primaryColor,
            colorDisabledPrimary: themeStore.primaryColor,
        },
    };
});

const provider = useProviderStore();

const ViewComponent = defineComponent({
    render: () => h(RouterView),
    setup() {
        provider.setLoadingBar(useLoadingBar());
    },
});

let animationFrameId: number | null = null;
let isRGBRunning = false;

const animatePrimaryColor = () => {
    if (isRGBRunning) return;
    isRGBRunning = true;

    let r = 255,
        g = 0,
        b = 0;
    let dr = -5,
        dg = 5,
        db = 0;

    const step = () => {
        if (!themeStore.isRGBMode) {
            isRGBRunning = false;
            return;
        }
        if (r <= 0 && g >= 255) {
            dr = 0;
            dg = -5;
            db = 5;
        }
        if (g <= 0 && b >= 255) {
            dr = 5;
            dg = 0;
            db = -5;
        }
        if (b <= 0 && r >= 255) {
            dr = -5;
            dg = 5;
            db = 0;
        }
        r += dr;
        g += dg;
        b += db;

        themeStore.primaryColor = `rgb(${r}, ${g}, ${b})`;
        animationFrameId = requestAnimationFrame(step);
    };

    step();
};

watch(
    () => themeStore.isRGBMode,
    (newVal) => {
        if (newVal) {
            animatePrimaryColor();
        } else if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
);

// 触屏识别
const isTouchDevice = ref(false);

provide('isTouchDevice', isTouchDevice);

const detectInputMethod = (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
        isTouchDevice.value = true;
    } else if (event.pointerType === 'mouse') {
        isTouchDevice.value = false;
    }
};

onMounted(() => {
    if (themeStore.isRGBMode) {
        animatePrimaryColor();
    }
    // 初始化模糊效果
    if (themeStore.isDialogBoxHairGlass) {
        document.documentElement.style.setProperty('--modal-filter', '10px');
    } else {
        document.documentElement.style.setProperty('--modal-filter', '0px');
    }
    // 更新目前的指针方式
    window.addEventListener('pointerdown', detectInputMethod);
});

onUnmounted(() => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    // 移除指针事件监听器
    window.removeEventListener('pointerdown', detectInputMethod);
});
</script>

<style lang="scss">
#app {
    font-family: 'Lato', 'Fira Code', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
