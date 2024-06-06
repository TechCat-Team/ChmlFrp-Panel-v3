<template>
  <n-config-provider :hljs="hljs" :theme="computedTheme" :theme-overrides="themeOverrides">
    <!-- 加载条 -->
    <n-loading-bar-provider>
      <!-- 顶部信息 -->
      <n-message-provider>
        <ViewComponent />
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { defineComponent, h, computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { RouterView } from 'vue-router';
import { useProviderStore } from './stores/provider';
import { NLoadingBarProvider, useLoadingBar, lightTheme, darkTheme, NMessageProvider } from 'naive-ui';
import hljs from 'highlight.js/lib/core'
import ini from 'highlight.js/lib/languages/ini'
import nginx from 'highlight.js/lib/languages/nginx'
import powershell from 'highlight.js/lib/languages/powershell'

hljs.registerLanguage('ini', ini)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('powershell', powershell)

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
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
}
</style>
