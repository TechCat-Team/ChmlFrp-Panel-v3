<template>
    <div class="container">
        <!-- 主题设置卡片 -->
        <n-card class="setting-card" size="small">
            <template #header>
                <div class="card-header">
                    <n-icon :component="ColorPaletteOutline" :size="20" />
                    <span>主题设置</span>
                </div>
            </template>
            <div class="setting-content">
                <div class="setting-item">
                    <div class="setting-label">
                        <n-icon :component="SyncOutline" :size="18" />
                        <span>自动切换主题</span>
                    </div>
                    <n-switch 
                        size="large" 
                        v-model:value="isAutoTheme" 
                        :checked-value="true" 
                        :unchecked-value="false"
                    >
                <template #checked>自动切换</template>
                <template #unchecked>手动切换</template>
            </n-switch>
                </div>
                <div class="setting-item" v-if="!isAutoTheme">
                    <div class="setting-label">
                        <n-icon :component="isDarkTheme ? Sparkles : Sunny" :size="18" />
                        <span>主题模式</span>
        </div>
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
                </div>
            </div>
        </n-card>

        <!-- 主题色设置卡片 -->
        <n-card class="setting-card" size="small">
            <template #header>
                <div class="card-header">
                    <n-icon :component="BrushOutline" :size="20" />
                    <span>主题色</span>
                </div>
            </template>
            <div class="setting-content">
                <div class="color-picker-wrapper">
                    <n-color-picker 
                        v-model:value="primaryColor" 
                        :show-preview="true"
                        :modes="['hex']"
                        size="large"
                    />
        </div>
        <div class="preset-colors">
            <div
                v-for="color in presetColors"
                :key="color"
                :style="{ backgroundColor: color }"
                class="preset-color"
                        :class="{ active: primaryColor === color }"
                @click="setPresetColor(color)"
                    >
                        <n-icon 
                            v-if="primaryColor === color" 
                            :component="CheckmarkCircleOutline" 
                            :size="16"
                            color="#fff"
                        />
                    </div>
                </div>
            </div>
        </n-card>

        <!-- 视觉效果设置卡片 -->
        <n-card class="setting-card" size="small">
            <template #header>
                <div class="card-header">
                    <n-icon :component="EyeOutline" :size="20" />
                    <span>视觉效果</span>
        </div>
            </template>
            <div class="setting-content">
                <div class="setting-item">
                    <div class="setting-label">
                        <n-icon :component="ColorFilterOutline" :size="18" />
                <span>RGB模式</span>
                    </div>
                    <n-switch 
                        size="large" 
                        v-model:value="isRGBMode" 
                        :checked-value="true" 
                        :unchecked-value="false"
                    />
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <n-icon :component="LayersOutline" :size="18" />
                <span>对话框模糊</span>
                    </div>
                <n-switch
                    size="large"
                    v-model:value="isDialogBoxHairGlass"
                    :checked-value="true"
                    :unchecked-value="false"
                />
                </div>
            </div>
        </n-card>

        <!-- 无障碍设置卡片 -->
        <n-card class="setting-card" size="small">
            <template #header>
                <div class="card-header">
                    <n-icon :component="AccessibilityOutline" :size="20" />
                    <span>无障碍</span>
                </div>
            </template>
            <div class="setting-content">
                <div class="setting-item">
                    <div class="setting-label">
                        <n-icon :component="ColorWandOutline" :size="18" />
                        <span>色弱模式</span>
                    </div>
                    <n-switch
                        size="large"
                        v-model:value="colorBlindMode"
                        :checked-value="true"
                        :unchecked-value="false"
                    />
                </div>
                <div class="setting-item">
                    <div class="setting-label">
                        <n-icon :component="ContrastOutline" :size="18" />
                        <span>高对比度模式</span>
                    </div>
                    <n-switch
                        size="large"
                        v-model:value="highContrastMode"
                        :checked-value="true"
                        :unchecked-value="false"
                    />
                </div>
            </div>
        </n-card>

        <!-- 背景图设置卡片 -->
        <n-card class="setting-card" size="small">
            <template #header>
                <div class="card-header">
                    <n-icon :component="ImageOutline" :size="20" />
                    <span>背景图</span>
                </div>
            </template>
            <div class="setting-content">
                <div class="background-settings">
                    <n-upload
                        :file-list="[]"
                        :show-file-list="false"
                        accept="image/*"
                        @change="handleFileChange"
                        :max="1"
                    >
                        <n-button block type="primary" ghost>
                            <template #icon>
                                <n-icon :component="CloudUploadOutline" />
                            </template>
                            选择本地图片
                        </n-button>
                    </n-upload>
                    <n-input
                        v-model:value="backgroundImageUrl"
                        placeholder="输入网络图片链接"
                        class="background-input"
                        @update:value="handleImageUrlChange"
                        clearable
                    >
                        <template #prefix>
                            <n-icon :component="LinkOutline" />
                        </template>
                    </n-input>
                    <div v-if="backgroundImageUrl || backgroundImage" class="image-preview">
                        <div class="preview-wrapper">
                            <img
                                :src="backgroundImageUrl || backgroundImage"
                                alt="背景预览"
                                class="preview-image"
                            />
                            <div class="preview-overlay">
                                <n-button
                                    size="small"
                                    type="error"
                                    @click="clearBackgroundImage"
                                >
                                    <template #icon>
                                        <n-icon :component="TrashOutline" />
                                    </template>
                                    清除
                                </n-button>
                            </div>
                        </div>
                        <div class="slider-control">
                            <div class="slider-label">
                                <n-icon :component="LayersOutline" :size="16" />
                                <span>模糊深度: {{ backgroundBlur }}px</span>
                            </div>
                            <n-slider
                                v-model:value="backgroundBlur"
                                :min="0"
                                :max="20"
                                :step="1"
                                @update:value="handleBlurChange"
                            />
                        </div>
                        <div class="slider-control" v-if="!frostedGlassMode">
                            <div class="slider-label">
                                <n-icon :component="WaterOutline" :size="16" />
                                <span>元素不透明度: {{ backgroundOpacity || 100 }}%</span>
                            </div>
                            <n-slider
                                v-model:value="backgroundOpacity"
                                :min="20"
                                :max="100"
                                :step="1"
                                @update:value="handleOpacityChange"
                            />
                        </div>
                        <div class="setting-item" style="margin-top: 12px">
                            <div class="setting-label">
                                <n-icon :component="LayersOutline" :size="18" />
                                <span>毛玻璃模式</span>
                            </div>
                            <n-switch
                                size="large"
                                v-model:value="frostedGlassMode"
                                :checked-value="true"
                                :unchecked-value="false"
                                @update:value="handleFrostedGlassChange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </n-card>
    </div>
</template>

<script lang="ts" setup>
import { CSSProperties } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { 
    Sparkles, 
    Sunny,
    ColorPaletteOutline,
    SyncOutline,
    BrushOutline,
    EyeOutline,
    ColorFilterOutline,
    LayersOutline,
    AccessibilityOutline,
    ColorWandOutline,
    ContrastOutline,
    ImageOutline,
    CloudUploadOutline,
    LinkOutline,
    TrashOutline,
    WaterOutline,
    CheckmarkCircleOutline
} from '@vicons/ionicons5';

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
const colorBlindMode = ref(themeStore.colorBlindMode);
const highContrastMode = ref(themeStore.highContrastMode);
const frostedGlassMode = ref(themeStore.frostedGlassMode);

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

const setColorBlindMode = (enabled: boolean) => {
    colorBlindMode.value = enabled;
    themeStore.setColorBlindMode(enabled);
    updateAccessibilityStyles();
};

const setHighContrastMode = (enabled: boolean) => {
    highContrastMode.value = enabled;
    themeStore.setHighContrastMode(enabled);
    updateAccessibilityStyles();
};

const updateAccessibilityStyles = () => {
    const root = document.documentElement;
    if (colorBlindMode.value) {
        // 应用色弱模式滤镜（红绿色盲辅助）
        root.style.setProperty('--color-blind-filter', 'url(#colorblind)');
        root.classList.add('color-blind-mode');
    } else {
        root.style.removeProperty('--color-blind-filter');
        root.classList.remove('color-blind-mode');
    }
    
    if (highContrastMode.value) {
        root.classList.add('high-contrast-mode');
    } else {
        root.classList.remove('high-contrast-mode');
    }
};

const updateFrostedGlassStyle = () => {
    const root = document.documentElement;
    if (frostedGlassMode.value && backgroundImage.value) {
        root.classList.add('frosted-glass-mode');
    } else {
        root.classList.remove('frosted-glass-mode');
    }
};

watch(colorBlindMode, (newVal) => {
    setColorBlindMode(newVal);
});

watch(highContrastMode, (newVal) => {
    setHighContrastMode(newVal);
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

// 压缩图片函数
const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 计算压缩后的尺寸
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                // 创建 canvas 进行压缩
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    reject(new Error('无法创建 canvas 上下文'));
                    return;
                }
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为 base64
                const compressedBase64 = canvas.toDataURL(file.type, quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
};

const handleFileChange = async (options: { fileList: any[] }) => {
    const file = options.fileList[0]?.file;
    if (file && file.type.startsWith('image/')) {
        try {
            // 压缩图片（最大 1920x1080，质量 0.8）
            const compressedBase64 = await compressImage(file, 1920, 1080, 0.8);
            
            // 检查 base64 字符串长度（localStorage 限制约 5-10MB，但为了安全我们限制在 2MB）
            if (compressedBase64.length > 2 * 1024 * 1024) {
                // 如果还是太大，进一步压缩
                const furtherCompressed = await compressImage(file, 1280, 720, 0.7);
                backgroundImageUrl.value = furtherCompressed;
                backgroundImage.value = furtherCompressed;
                themeStore.setBackgroundImage(furtherCompressed);
            } else {
                backgroundImageUrl.value = compressedBase64;
                backgroundImage.value = compressedBase64;
                themeStore.setBackgroundImage(compressedBase64);
            }
            
            updateBackgroundStyle();
        } catch (error) {
            console.error('图片处理失败:', error);
            // 如果压缩失败，尝试直接使用原图（但可能不工作）
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result.length > 5 * 1024 * 1024) {
                    console.warn('图片太大，可能无法正常显示。建议使用较小的图片。');
                }
                backgroundImageUrl.value = result;
                backgroundImage.value = result;
                themeStore.setBackgroundImage(result);
                updateBackgroundStyle();
            };
            reader.readAsDataURL(file);
        }
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
    // 如果启用了毛玻璃模式，不允许修改不透明度
    if (frostedGlassMode.value) {
        backgroundOpacity.value = 100;
        return;
    }
    // 确保不透明度不低于20%
    const clampedOpacity = Math.max(20, opacity);
    backgroundOpacity.value = clampedOpacity;
    themeStore.setBackgroundOpacity(clampedOpacity);
    updateBackgroundStyle();
};

const handleFrostedGlassChange = (enabled: boolean) => {
    frostedGlassMode.value = enabled;
    themeStore.setFrostedGlassMode(enabled);
    // 启用毛玻璃模式时，强制不透明度为100%
    if (enabled) {
        backgroundOpacity.value = 100;
        themeStore.setBackgroundOpacity(100);
    }
    updateBackgroundStyle();
    updateFrostedGlassStyle();
};

const clearBackgroundImage = () => {
    backgroundImageUrl.value = '';
    backgroundImage.value = '';
    themeStore.setBackgroundImage('');
    // 清除背景图时，如果启用了毛玻璃模式，也要禁用
    if (frostedGlassMode.value) {
        frostedGlassMode.value = false;
        themeStore.setFrostedGlassMode(false);
    }
    updateBackgroundStyle();
    updateFrostedGlassStyle();
};

const updateBackgroundStyle = () => {
    const root = document.documentElement;
    if (backgroundImage.value) {
        try {
            const imageUrl = `url(${backgroundImage.value})`;
            // 确保不透明度不低于20%
            const opacity = Math.max(20, backgroundOpacity.value || 100);
            
            // 设置 CSS 变量
            root.style.setProperty('--background-image', imageUrl);
            root.style.setProperty('--background-blur', `${backgroundBlur.value}px`);
            root.style.setProperty('--background-opacity', `${opacity / 100}`);
            
            // 验证是否设置成功
            const setValue = root.style.getPropertyValue('--background-image');
            if (!setValue || setValue === 'none') {
                console.warn('背景图 CSS 变量设置可能失败，图片可能太大');
            }
            
            // 调试信息
            console.log('背景图已设置:', {
                length: backgroundImage.value.length,
                blur: backgroundBlur.value,
                opacity: opacity
            });
        } catch (error) {
            console.error('设置背景图失败:', error);
        }
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
            // 确保不透明度不低于20%
            const clampedOpacity = Math.max(20, newOpacity);
            backgroundOpacity.value = clampedOpacity;
            if (clampedOpacity !== newOpacity) {
                themeStore.setBackgroundOpacity(clampedOpacity);
            }
            updateBackgroundStyle();
        }
    }
);

watch(
    () => themeStore.frostedGlassMode,
    (newMode) => {
        if (newMode !== frostedGlassMode.value) {
            frostedGlassMode.value = newMode;
            updateFrostedGlassStyle();
        }
    }
);

watch(
    () => backgroundImage.value,
    () => {
        // 当背景图变化时，更新毛玻璃样式
        updateFrostedGlassStyle();
    }
);

// 初始化背景样式
onMounted(() => {
    // 确保 backgroundOpacity 有默认值，且不低于20%
    if (!backgroundOpacity.value || isNaN(backgroundOpacity.value)) {
        backgroundOpacity.value = 100;
        themeStore.setBackgroundOpacity(100);
    } else if (backgroundOpacity.value < 20) {
        // 如果值小于20%，自动调整为20%
        backgroundOpacity.value = 20;
        themeStore.setBackgroundOpacity(20);
    }
    // 如果启用了毛玻璃模式，确保不透明度为100%
    if (frostedGlassMode.value) {
        backgroundOpacity.value = 100;
        themeStore.setBackgroundOpacity(100);
    }
    updateBackgroundStyle();
    updateAccessibilityStyles();
    updateFrostedGlassStyle();
});
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
}

.setting-card {
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
}

.setting-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px 0;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    transition: all 0.2s ease;
    
    &:hover {
        padding-left: 4px;
    }
}

.setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-color-1);
}

.color-picker-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
}

.preset-colors {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    justify-content: center;
    max-width: 100%;
    padding: 8px 0;
}

.preset-color {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        padding: 2px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0.1));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    &:hover {
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        
        &::before {
            opacity: 1;
        }
    }
    
    &.active {
        border-color: var(--primary-color, #18a058);
        box-shadow: 0 0 0 2px var(--primary-color, #18a058), 0 4px 12px rgba(0, 0, 0, 0.25);
    transform: scale(1.1);
    }
}

.background-settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.background-input {
    margin-top: 0;
}

.image-preview {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    margin-top: 8px;
}

.preview-wrapper {
    position: relative;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        
        .preview-overlay {
            opacity: 1;
        }
    }
}

.preview-image {
    width: 100%;
    max-height: 180px;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
    
    .preview-wrapper:hover & {
        transform: scale(1.02);
    }
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.slider-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.slider-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-color-2);
    font-weight: 500;
}

// 响应式设计
@media (max-width: 768px) {
    .preset-colors {
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
    }
    
    .preset-color {
        width: 32px;
        height: 32px;
    }
}
</style>
