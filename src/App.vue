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
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { RouterView } from 'vue-router';
import { useProviderStore } from './stores/provider';
import { useUserStore } from '@/stores/user';
import hljs from 'highlight.js/lib/core';
import ini from 'highlight.js/lib/languages/ini';
import nginx from 'highlight.js/lib/languages/nginx';
import powershell from 'highlight.js/lib/languages/powershell';
import { h, defineComponent } from 'vue';
import { useLoadingBar } from 'naive-ui';

// 注册代码高亮语言
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('powershell', powershell);

// 获取用户存储实例
const userStore = useUserStore();

// 页面挂载时加载用户信息
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

// 获取主题存储实例
const themeStore = useThemeStore();

// 假设 darkTheme 和 lightTheme 是从 naive-ui 导入的主题
import { darkTheme, lightTheme } from 'naive-ui';

// 计算当前主题
const computedTheme = computed(() => {
  return themeStore.theme === 'dark' ? darkTheme : lightTheme;
});

// 计算主题覆盖样式
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

// 获取提供者存储实例
const provider = useProviderStore();

// 定义视图组件
const ViewComponent = defineComponent({
  render: () => h(RouterView),
  setup() {
    provider.setLoadingBar(useLoadingBar());
  },
});

// 动画帧 ID
let animationFrameId: number | null = null;
// RGB 模式运行状态
let isRGBRunning = false;

// 更新 RGB 颜色
const updateRGBColor = (r: number, g: number, b: number, dr: number, dg: number, db: number) => {
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
  return { r, g, b, dr, dg, db };
};

// 启动 RGB 颜色动画
const animatePrimaryColor = () => {
  if (isRGBRunning) return;
  isRGBRunning = true;

  let r = 255, g = 0, b = 0;
  let dr = -5, dg = 5, db = 0;

  const step = () => {
    if (!themeStore.isRGBMode) {
      isRGBRunning = false;
      return;
    }
    const { r: newR, g: newG, b: newB, dr: newDr, dg: newDg, db: newDb } = updateRGBColor(r, g, b, dr, dg, db);
    r = newR;
    g = newG;
    b = newB;
    dr = newDr;
    dg = newDg;
    db = newDb;

    themeStore.primaryColor = `rgb(${r}, ${g}, ${b})`;
    animationFrameId = requestAnimationFrame(step);
  };

  step();
};

// 监听 RGB 模式变化
watch(() => themeStore.isRGBMode, (newVal) => {
  if (newVal) {
    animatePrimaryColor();
  } else if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});

// 页面挂载时检查 RGB 模式并启动动画
onMounted(() => {
  if (themeStore.isRGBMode) {
    animatePrimaryColor();
  }
});

// 页面卸载时取消动画
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});
</script>

<style lang="scss">
#app {
  font-family: 'Lato', 'Fira Code', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>