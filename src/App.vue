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
    <!-- SVG 滤镜定义用于色弱模式 -->
    <svg class="defs-only" aria-hidden="true">
        <defs>
            <!-- 红绿色盲辅助滤镜 -->
            <filter id="colorblind" color-interpolation-filters="sRGB">
                <feColorMatrix
                    type="matrix"
                    values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
                />
            </filter>
        </defs>
    </svg>
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
    // 初始化无障碍模式
    if (themeStore.colorBlindMode) {
        document.documentElement.classList.add('color-blind-mode');
        document.documentElement.style.setProperty('--color-blind-filter', 'url(#colorblind)');
    }
    if (themeStore.highContrastMode) {
        document.documentElement.classList.add('high-contrast-mode');
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
    // 使用不透明背景，确保菜单清晰可见
    background-color: #1a1a1f !important;
    opacity: 1 !important;
}

// 确保在高对比度模式下菜单背景被正确覆盖
// 非高对比度模式下，菜单保持不透明背景
html[data-theme='dark']:not(.high-contrast-mode) .n-layout-header,
html[data-theme='dark']:not(.high-contrast-mode) .n-layout-sider {
    background-color: #1a1a1f !important;
    opacity: 1 !important;
}

// 当有背景图时，所有元素应用不透明度
// 只在 #app 上设置不透明度，子元素会继承
// 但菜单和顶部菜单应该保持完全不透明
#app {
    opacity: var(--background-opacity, 1);
    transition: opacity 0.3s ease;
}

// 确保菜单不受全局不透明度影响
.n-layout-header,
.n-layout-sider {
    opacity: 1 !important;
}

// 但是背景图本身不应该受不透明度影响（背景图在 html::before 上）
html::before {
    opacity: 1 !important;
}

// 色弱模式样式
.color-blind-mode {
    // 增强整体对比度，帮助色弱用户区分元素
    filter: contrast(1.15) brightness(1.05);
    
    // 确保所有按钮、链接都有明显的视觉区分（不依赖颜色）
    .n-button {
        border-width: 2px !important;
        font-weight: 500 !important;
    }
    
    // 确保状态指示器有图标或文字，不只用颜色
    .n-badge {
        border: 2px solid currentColor !important;
    }
    
    // 增强输入框的边框可见性
    .n-input,
    .n-select,
    .n-date-picker {
        border-width: 2px !important;
    }
    
    // 确保链接有下划线
    a:not(.n-button) {
        text-decoration: underline !important;
    }
}

// 高对比度模式样式
// 遵循 WCAG AAA 标准：对比度至少 7:1
.high-contrast-mode {
    // 亮色主题：黑色文字 + 白色背景（对比度 21:1，远超标准）
    --n-text-color: #000000 !important;
    --n-text-color-1: #000000 !important;
    --n-text-color-2: #000000 !important;
    --n-text-color-3: #000000 !important;
    --n-card-color: #ffffff !important;
    --n-modal-color: #ffffff !important;
    --n-popover-color: #ffffff !important;
    
    // 确保主要文字元素是黑色（高对比度）
    p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, label {
        color: #000000 !important;
    }
    
    // 确保所有背景都是白色
    .n-card,
    .n-modal,
    .n-drawer,
    .n-popover,
    .n-dropdown {
        background-color: #ffffff !important;
        border: 2px solid #000000 !important;
    }
    
    // 按钮样式：黑色边框，白色背景，黑色文字
    .n-button {
        border: 2px solid #000000 !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        font-weight: bold !important;
        
        &:hover {
            background-color: #000000 !important;
            color: #ffffff !important;
        }
    }
    
    // 输入框：黑色边框，白色背景
    .n-input,
    .n-select,
    .n-date-picker,
    .n-input-number {
        border: 2px solid #000000 !important;
        background-color: #ffffff !important;
        color: #000000 !important;
    }
    
    // 链接：黑色，加粗，下划线
    a {
        color: #000000 !important;
        text-decoration: underline !important;
        font-weight: bold !important;
        
        &:hover {
            background-color: #000000 !important;
            color: #ffffff !important;
        }
    }
    
    // 菜单和侧边栏
    .n-layout-header,
    .n-layout-sider {
        background-color: #ffffff !important;
        border: 2px solid #000000 !important;
    }
}

// 暗色主题下的高对比度模式
// 白色文字 + 黑色背景（对比度 21:1）
html[data-theme='dark'].high-contrast-mode {
    --n-text-color: #ffffff !important;
    --n-text-color-1: #ffffff !important;
    --n-text-color-2: #ffffff !important;
    --n-text-color-3: #ffffff !important;
    --n-card-color: #000000 !important;
    --n-modal-color: #000000 !important;
    --n-popover-color: #000000 !important;
    
    // 确保主要文字元素是白色（高对比度）
    p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, label {
        color: #ffffff !important;
    }
    
    .n-card,
    .n-modal,
    .n-drawer,
    .n-popover,
    .n-dropdown {
        background-color: #000000 !important;
        border: 2px solid #ffffff !important;
    }
    
    .n-button {
        border: 2px solid #ffffff !important;
        background-color: #000000 !important;
        color: #ffffff !important;
        font-weight: bold !important;
        
        &:hover {
            background-color: #ffffff !important;
            color: #000000 !important;
        }
    }
    
    .n-input,
    .n-select,
    .n-date-picker,
    .n-input-number {
        border: 2px solid #ffffff !important;
        background-color: #000000 !important;
        color: #ffffff !important;
    }
    
    a {
        color: #ffffff !important;
        text-decoration: underline !important;
        font-weight: bold !important;
        
        &:hover {
            background-color: #ffffff !important;
            color: #000000 !important;
        }
    }
    
    .n-layout-header,
    .n-layout-sider {
        background-color: #000000 !important;
        border: 2px solid #ffffff !important;
    }
}

// SVG 滤镜定义（色弱模式）
svg.defs-only {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
}
</style>
