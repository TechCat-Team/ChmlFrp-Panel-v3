<template>
    <div class="container">
        <n-divider>主题</n-divider>
        <div class="theme-switch">
            <span style="margin-right: 10px">手动</span>
            <n-switch size="large" v-model:value="isAutoTheme" :checked-value="true" :unchecked-value="false">
                <template #checked>自动切换</template>
                <template #unchecked>手动切换</template>
            </n-switch>
            <span style="margin-left: 10px">自动</span>
        </div>
        <div class="theme-switch" style="margin-top: 10px" v-if="!isAutoTheme">
            <span style="margin-right: 10px">亮色</span>
            <n-switch
                size="large"
                v-model:value="isDarkTheme"
                :rail-style="railStyle"
                :checked-value="true"
                :unchecked-value="false"
            >
                <template #checked-icon>
                    <n-icon :component="Sparkles" color="#9f9f9c" />
                </template>
                <template #unchecked-icon>
                    <n-icon :component="Sunny" color="#E6A23C" />
                </template>
                <template #checked>月映万川</template>
                <template #unchecked>日照千里</template>
            </n-switch>
            <span style="margin-left: 10px">暗色</span>
        </div>
        <n-divider>主题色</n-divider>
        <n-color-picker v-model:value="primaryColor" :show-preview="true" />
        <div class="preset-colors">
            <div
                v-for="color in presetColors"
                :key="color"
                :style="{ backgroundColor: color }"
                class="preset-color"
                @click="setPresetColor(color)"
            ></div>
        </div>
        <n-flex vertical style="margin-top: 24px">
            <n-flex justify="space-between" style="width: 200px">
                <span>RGB模式</span>
                <n-switch size="large" v-model:value="isRGBMode" :checked-value="true" :unchecked-value="false" />
            </n-flex>
            <n-flex justify="space-between">
                <span>对话框模糊</span>
                <n-switch
                    size="large"
                    v-model:value="isDialogBoxHairGlass"
                    :checked-value="true"
                    :unchecked-value="false"
                />
            </n-flex>
        </n-flex>
        <n-divider>背景图</n-divider>
        <div class="background-settings" style="width: 100%; max-width: 300px">
            <n-upload
                :file-list="[]"
                :show-file-list="false"
                accept="image/*"
                @change="handleFileChange"
                :max="1"
            >
                <n-button block>选择本地图片</n-button>
            </n-upload>
            <n-input
                v-model:value="backgroundImageUrl"
                placeholder="输入网络图片链接"
                style="margin-top: 10px"
                @update:value="handleImageUrlChange"
                clearable
            />
            <div v-if="backgroundImageUrl || backgroundImage" class="image-preview" style="margin-top: 10px">
                <img
                    :src="backgroundImageUrl || backgroundImage"
                    alt="背景预览"
                    style="max-width: 100%; max-height: 150px; border-radius: 8px"
                />
                <n-button
                    size="small"
                    type="error"
                    style="margin-top: 8px"
                    @click="clearBackgroundImage"
                >
                    清除背景图
                </n-button>
            </div>
            <div v-if="backgroundImageUrl || backgroundImage" style="margin-top: 16px; width: 100%">
                <n-flex justify="space-between" align="center">
                    <span>模糊深度: {{ backgroundBlur }}px</span>
                </n-flex>
                <n-slider
                    v-model:value="backgroundBlur"
                    :min="0"
                    :max="20"
                    :step="1"
                    style="margin-top: 8px"
                    @update:value="handleBlurChange"
                />
            </div>
            <div v-if="backgroundImageUrl || backgroundImage" style="margin-top: 16px; width: 100%">
                <n-flex justify="space-between" align="center">
                    <span>元素不透明度: {{ backgroundOpacity || 100 }}%</span>
                </n-flex>
                <n-slider
                    v-model:value="backgroundOpacity"
                    :min="0"
                    :max="100"
                    :step="1"
                    style="margin-top: 8px"
                    @update:value="handleOpacityChange"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { CSSProperties } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { Sparkles, Sunny } from '@vicons/ionicons5';

const themeStore = useThemeStore();
const isDarkTheme = ref(themeStore.theme === 'dark');
const primaryColor = ref(themeStore.primaryColor);
const isAutoTheme = ref(themeStore.isAutoTheme);
const isRGBMode = ref(themeStore.isRGBMode);
const isDialogBoxHairGlass = ref(themeStore.isDialogBoxHairGlass);
const backgroundImage = ref(themeStore.backgroundImage);
const backgroundImageUrl = ref(themeStore.backgroundImage);
const backgroundBlur = ref(themeStore.backgroundBlur);
const backgroundOpacity = ref(themeStore.backgroundOpacity || 100);

const presetColors = [
    '#18a058',
    '#2080f0',
    '#f5222d',
    '#fa541c',
    '#faad14',
    '#13c2c2',
    '#52c41a',
    '#eb2f96',
    '#722ed1',
    '#2f54eb',
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

const setAutoTheme = (isAuto: boolean) => {
    isAutoTheme.value = isAuto;
    themeStore.setAutoTheme(isAuto);
};

const setRGBMode = (isRGB: boolean) => {
    isRGBMode.value = isRGB;
    themeStore.setRGBMode(isRGB);
};

const setDialogBoxHairGlass = (isDBH: boolean) => {
    isDialogBoxHairGlass.value = isDBH;
    themeStore.setDialogBoxHairGlass(isDBH);
};

watch(isDialogBoxHairGlass, (newVal) => {
    setDialogBoxHairGlass(newVal);
    if (newVal) {
        document.documentElement.style.setProperty('--modal-filter', '10px');
    } else {
        document.documentElement.style.setProperty('--modal-filter', '0px');
    }
});

watch(isDarkTheme, (newIsDark) => {
    if (!isAutoTheme.value) {
        changeTheme(newIsDark);
    }
});

watch(primaryColor, (newColor) => {
    changePrimaryColor(newColor);
});

watch(isAutoTheme, (newVal) => {
    setAutoTheme(newVal);
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

watch(isRGBMode, (newVal) => {
    setRGBMode(newVal);
});

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
    const style: CSSProperties = {};
    if (checked) {
        style.background = '#000000';
        if (focused) {
            style.boxShadow = '0 0 0 2px #00000040';
        }
    }
    return style;
};

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    isDarkTheme.value = e.matches;
    changeTheme(isDarkTheme.value);
};

const handleFileChange = (options: { fileList: any[] }) => {
    const file = options.fileList[0]?.file;
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            backgroundImageUrl.value = result;
            backgroundImage.value = result;
            themeStore.setBackgroundImage(result);
            updateBackgroundStyle();
        };
        reader.readAsDataURL(file);
    }
};

const handleImageUrlChange = (url: string) => {
    backgroundImageUrl.value = url;
    if (url && url.trim()) {
        backgroundImage.value = url.trim();
        themeStore.setBackgroundImage(url.trim());
    } else {
        backgroundImage.value = '';
        themeStore.setBackgroundImage('');
    }
    updateBackgroundStyle();
};

const handleBlurChange = (blur: number) => {
    backgroundBlur.value = blur;
    themeStore.setBackgroundBlur(blur);
    updateBackgroundStyle();
};

const handleOpacityChange = (opacity: number) => {
    backgroundOpacity.value = opacity;
    themeStore.setBackgroundOpacity(opacity);
    updateBackgroundStyle();
};

const clearBackgroundImage = () => {
    backgroundImageUrl.value = '';
    backgroundImage.value = '';
    themeStore.setBackgroundImage('');
    updateBackgroundStyle();
};

const updateBackgroundStyle = () => {
    const root = document.documentElement;
    if (backgroundImage.value) {
        const imageUrl = `url(${backgroundImage.value})`;
        root.style.setProperty('--background-image', imageUrl);
        root.style.setProperty('--background-blur', `${backgroundBlur.value}px`);
        const opacity = backgroundOpacity.value || 100;
        root.style.setProperty('--background-opacity', `${opacity / 100}`);
        // 调试信息
        console.log('背景图已设置:', imageUrl, '模糊:', backgroundBlur.value, '不透明度:', opacity);
    } else {
        // 移除 CSS 变量以恢复默认样式
        root.style.removeProperty('--background-image');
        root.style.removeProperty('--background-blur');
        root.style.removeProperty('--background-opacity');
        console.log('背景图已清除');
    }
};

// 监听 themeStore 的变化
watch(
    () => themeStore.backgroundImage,
    (newImage) => {
        if (newImage !== backgroundImage.value) {
            backgroundImage.value = newImage;
            backgroundImageUrl.value = newImage;
            updateBackgroundStyle();
        }
    }
);

watch(
    () => themeStore.backgroundBlur,
    (newBlur) => {
        if (newBlur !== backgroundBlur.value) {
            backgroundBlur.value = newBlur;
            updateBackgroundStyle();
        }
    }
);

watch(
    () => themeStore.backgroundOpacity,
    (newOpacity) => {
        if (newOpacity !== backgroundOpacity.value) {
            backgroundOpacity.value = newOpacity;
            updateBackgroundStyle();
        }
    }
);

// 初始化背景样式
onMounted(() => {
    // 确保 backgroundOpacity 有默认值
    if (!backgroundOpacity.value || isNaN(backgroundOpacity.value)) {
        backgroundOpacity.value = 100;
        themeStore.setBackgroundOpacity(100);
    }
    updateBackgroundStyle();
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
    max-width: 250px;
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

.background-settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}
</style>
