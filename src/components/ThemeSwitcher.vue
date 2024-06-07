<template>
  <div class="container">
    <n-divider>主题</n-divider>
    <div class="theme-switch">
      <span style="margin-right: 10px;">手动</span>
      <n-switch size="large" v-model:value="isAutoTheme" :checked-value="true" :unchecked-value="false">
        <template #checked>跟随系统</template>
        <template #unchecked>手动切换</template>
      </n-switch>
      <span style="margin-left: 10px;">自动</span>
    </div>
    <div class="theme-switch" style="margin-top: 10px;" v-if="!isAutoTheme">
      <span style="margin-right: 10px;">亮色</span>
      <n-switch size="large" v-model:value="isDarkTheme" :rail-style="railStyle" :checked-value="true"
        :unchecked-value="false">
        <template #checked-icon>
          <n-icon :component="Sparkles" color="#9f9f9c" />
        </template>
        <template #unchecked-icon>
          <n-icon :component="Sunny" color="#E6A23C" />
        </template>
        <template #checked>月映万川</template>
        <template #unchecked>日照千里</template>
      </n-switch>
      <span style="margin-left: 10px;">暗色</span>
    </div>
    <n-divider>主题色</n-divider>
    <n-color-picker v-model:value="primaryColor" :show-preview="true" />
    <div class="preset-colors">
      <div v-for="color in presetColors" :key="color" :style="{ backgroundColor: color }" class="preset-color"
        @click="setPresetColor(color)"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, CSSProperties } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { NSwitch, NColorPicker, NDivider, NIcon } from 'naive-ui';
import { Sparkles, Sunny } from '@vicons/ionicons5';

const themeStore = useThemeStore();
const isDarkTheme = ref(themeStore.theme === 'dark');
const primaryColor = ref(themeStore.primaryColor);
const isAutoTheme = ref(themeStore.isAutoTheme);

const presetColors = [
  '#18a058', '#2080f0', '#f5222d', '#fa541c', '#faad14', '#13c2c2', '#52c41a', '#eb2f96', '#722ed1', '#2f54eb'
];

const changeTheme = (isDark: boolean) => {
  const theme = isDark ? 'dark' : 'light';
  themeStore.setTheme(theme);
  document.documentElement.setAttribute('data-theme', theme);
};

const changePrimaryColor = (color: string) => {
  themeStore.setPrimaryColor(color);
};

const setPresetColor = (color: string) => {
  primaryColor.value = color;
  changePrimaryColor(color);
};

watch(isDarkTheme, (newIsDark) => {
  if (!isAutoTheme.value) {
    changeTheme(newIsDark);
  }
});

watch(primaryColor, (newColor) => {
  changePrimaryColor(newColor);
});

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  isDarkTheme.value = e.matches;
  changeTheme(isDarkTheme.value);
};

watch(isAutoTheme, (newVal) => {
  themeStore.setAutoTheme(newVal);
  if (newVal) {
    const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkTheme.value = systemDarkTheme.matches;
    changeTheme(isDarkTheme.value);
    systemDarkTheme.addEventListener('change', handleSystemThemeChange);
  } else {
    const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkTheme.removeEventListener('change', handleSystemThemeChange);
  }
});

const railStyle = ({
  focused,
  checked
}: {
  focused: boolean
  checked: boolean
}) => {
  const style: CSSProperties = {}
  if (checked) {
    style.background = '#000000'
    if (focused) {
      style.boxShadow = '0 0 0 2px #00000040'
    }
  }
  return style
};

onMounted(() => {
  if (isAutoTheme.value) {
    const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkTheme.addEventListener('change', handleSystemThemeChange);
    isDarkTheme.value = systemDarkTheme.matches;
    changeTheme(isDarkTheme.value);
  } else {
    changeTheme(isDarkTheme.value);
  }
});

onUnmounted(() => {
  const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
  systemDarkTheme.removeEventListener('change', handleSystemThemeChange);
});
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 水平居中对齐 */
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  /* 固定列数 */
  gap: 10px;
  margin-top: 10px;
  justify-content: center;
  /* 水平居中对齐网格 */
  max-width: 250px
}

.preset-color {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.preset-color:hover {
  transform: scale(1.1);
}
</style>