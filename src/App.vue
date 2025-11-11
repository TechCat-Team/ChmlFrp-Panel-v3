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
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('ini', ini);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('bash', bash);

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

    // 如果有背景图，则让背景色透明，否则使用默认背景色
    const hasBackgroundImage = !!themeStore.backgroundImage;
    const bodyColor = hasBackgroundImage 
        ? 'transparent' 
        : (themeStore.theme === 'light' ? '#f5f5f5' : undefined);

    const lightThemeOverrides = themeStore.theme === 'light' ? {
        bodyColor: bodyColor || '#f5f5f5', // 更改亮色主题下的背景颜色
    } : {};

    return {
        common: {
            ...commonColors,
            ...lightThemeOverrides,
            // 如果有背景图，强制设置 bodyColor 为透明
            ...(hasBackgroundImage ? { bodyColor: 'transparent' } : {}),
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

// 监听背景图变化，更新主题覆盖
watch(
    () => themeStore.backgroundImage,
    () => {
        // 触发 themeOverrides 重新计算
        // 由于 themeOverrides 是 computed，会自动更新
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
    // 初始化背景图
    if (themeStore.backgroundImage) {
        const opacity = themeStore.backgroundOpacity || 100;
        document.documentElement.style.setProperty('--background-image', `url(${themeStore.backgroundImage})`);
        document.documentElement.style.setProperty('--background-blur', `${themeStore.backgroundBlur}px`);
        document.documentElement.style.setProperty('--background-opacity', `${opacity / 100}`);
    } else {
        // 移除 CSS 变量以恢复默认样式
        document.documentElement.style.removeProperty('--background-image');
        document.documentElement.style.removeProperty('--background-blur');
        document.documentElement.style.removeProperty('--background-opacity');
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

// 全局背景图样式
html {
    // 背景图伪元素放在 html 上，因为 CSS 变量设置在 html 上
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -999;
        background-image: var(--background-image, none);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        filter: blur(var(--background-blur, 0px));
        transition: filter 0.3s ease, background-image 0.3s ease, opacity 0.3s ease;
        pointer-events: none; // 确保背景图不阻挡交互
        will-change: background-image, filter; // 优化性能
    }
    
    // 当没有背景图 CSS 变量时隐藏伪元素
    &:not([style*="--background-image"])::before {
        display: none;
    }
    
    // 当有背景图时显示
    &[style*="--background-image"]::before {
        display: block;
    }
}

body {
    position: relative;
    min-height: 100vh;
}

// 确保布局组件不遮挡背景图
#app {
    background-color: transparent;
    min-height: 100vh;
    position: relative;
}

// 当有背景图 CSS 变量时，让 body 和 html 背景透明
html[style*="--background-image"] {
    background-color: transparent !important;
}

body {
    background-color: transparent !important;
}

// 只让主内容区域透明以显示背景图
.n-layout-content {
    background-color: transparent !important;
}

// 恢复菜单和顶部菜单的背景色
// 根据主题设置合适的背景色
html[data-theme='light'] .n-layout-header,
html[data-theme='light'] .n-layout-sider {
    background-color: #ffffff !important;
}

html[data-theme='dark'] .n-layout-header,
html[data-theme='dark'] .n-layout-sider {
    background-color: rgba(16, 16, 20, 0.6) !important;
}

// 当有背景图时，所有元素应用不透明度
// 只在 #app 上设置不透明度，子元素会继承
#app {
    opacity: var(--background-opacity, 1);
    transition: opacity 0.3s ease;
}

// 但是背景图本身不应该受不透明度影响（背景图在 html::before 上）
html::before {
    opacity: 1 !important;
}
</style>
