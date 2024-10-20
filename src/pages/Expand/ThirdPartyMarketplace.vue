<template>
    <n-back-top :right="100" />
    <n-carousel show-arrow autoplay style="width: 100%; height: 240px; border-radius: 8px">
        <div class="carousel-slide" :class="{ 'dark-mode-overlay': isDarkTheme }">
            <img class="carousel-img" src="https://www.chmlfrp.cn/image/1.png" />
            <div class="carousel-caption">
                <img class="carousel-favicon" src="https://www.mslmc.cn/logo.png" />
                <h3>MSL开服器</h3>
                <p>新一代服务器管理/联机工具</p>
            </div>
        </div>
        <div class="carousel-slide" :class="{ 'dark-mode-overlay': isDarkTheme }">
            <img class="carousel-img" src="https://www.chmlfrp.cn/image/2.png" />
            <div class="carousel-caption">
                <img class="carousel-favicon" src="https://chmlfrp.cn/favicon.ico" />
                <h3>ChmlFrp_WinUi启动器</h3>
                <p>来自ChmlFrp官方开发组，简洁美观，专为Win10以上设计</p>
            </div>
        </div>
        <template #arrow="{ prev, next }">
            <div class="custom-arrow">
                <button type="button" class="custom-arrow--left" @click="prev" :class="{ 'dark-arrow': isDarkTheme }">
                    <n-icon>
                        <ArrowBack />
                    </n-icon>
                </button>
                <button type="button" class="custom-arrow--right" @click="next" :class="{ 'dark-arrow': isDarkTheme }">
                    <n-icon>
                        <ArrowForward />
                    </n-icon>
                </button>
            </div>
        </template>
        <template #dots="{ total, currentIndex, to }">
            <ul class="custom-dots">
                <li v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
                    @click="to(index - 1)" :style="dotStyle(index, currentIndex)" />
            </ul>
        </template>
    </n-carousel>
</template>

<script lang="ts" setup>
import { ArrowBack, ArrowForward } from '@vicons/ionicons5'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

// 获取主题状态
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.theme === 'dark')

// 自定义 dots 样式
const dotStyle = (index: number, currentIndex: number) => {
    return {
        backgroundColor: currentIndex === index - 1 ? '#fff' : 'rgba(255, 255, 255, 0.4)',
        width: currentIndex === index - 1 ? '40px' : '12px'
    }
}
</script>

<style>
.carousel-img {
    width: 100%;
    height: 240px;
    object-fit: cover;
    filter: blur(6px);
}

/* 暗色模式图片的深色遮罩 */
.dark-mode-overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 1;
}

.carousel-slide {
    position: relative;
    width: 100%;
    height: 100%;
}

.custom-arrow {
    display: flex;
    position: absolute;
    bottom: 25px;
    right: 10px;
}

.custom-arrow button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-right: 12px;
    background-color: rgba(255, 255, 255, 0.1);
    border-width: 0;
    border-radius: 8px;
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    color: #fff;
}

/* 暗色模式下的箭头样式 */
.dark-arrow {
    background-color: rgba(0, 0, 0, 0.4);
}

.custom-arrow button:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

.custom-arrow button:active {
    transform: scale(0.95);
    transform-origin: center;
}

.custom-dots {
    display: flex;
    margin: 0;
    padding: 0;
    position: absolute;
    bottom: 20px;
    left: 20px;
}

.custom-dots li {
    display: inline-block;
    height: 4px;
    margin: 0 3px;
    border-radius: 4px;
    transition:
        width 0.3s,
        background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.carousel-caption {
    position: absolute;
    bottom: 32px;
    left: 20px;
    z-index: 2;
}

.carousel-favicon {
    width: 48px;
    height: 48px;
    display: inline-block;
    margin: 0 3px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
}
</style>