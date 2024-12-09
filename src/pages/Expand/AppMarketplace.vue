<template>
    <n-back-top :right="100" />
    <n-carousel show-arrow autoplay style="width: 100%; height: 240px; border-radius: 8px">
        <div class="carousel-slide" :class="{ 'dark-mode-overlay': isDarkTheme }">
            <img class="carousel-img" src="https://www.chmlfrp.cn/image/1.png" />
            <div class="carousel-caption">
                <img class="carousel-favicon" :class="{ 'dark-favicon': isDarkTheme }"
                    src="https://www.mslmc.cn/logo.png" />
                <h3>MSL开服器</h3>
                <p>新一代服务器管理/联机工具</p>
            </div>
        </div>
        <div class="carousel-slide" :class="{ 'dark-mode-overlay': isDarkTheme }">
            <img class="carousel-img" src="https://www.chmlfrp.cn/image/2.png" />
            <div class="carousel-caption">
                <img class="carousel-favicon" :class="{ 'dark-favicon': isDarkTheme }"
                    src="https://chmlfrp.cn/favicon.ico" />
                <h3>ChmlFrp_WinUi启动器</h3>
                <p>来自ChmlFrp官方开发组，简洁美观，专为Win10以上设计</p>
            </div>
        </div>
        <template #arrow="{ prev, next }">
            <div class="custom-arrow">
                <button type="button" class="custom-arrow--left" @click="prev"
                    :class="{ 'dark-arrow': isDarkTheme, 'light-arrow': !isDarkTheme }">
                    <n-icon :style="{ color: isDarkTheme ? '#fff' : '#000' }">
                        <ArrowBack />
                    </n-icon>
                </button>
                <button type="button" class="custom-arrow--right" @click="next"
                    :class="{ 'dark-arrow': isDarkTheme, 'light-arrow': !isDarkTheme }">
                    <n-icon :style="{ color: isDarkTheme ? '#fff' : '#000' }">
                        <ArrowForward />
                    </n-icon>
                </button>
            </div>
        </template>
        <template #dots="{ total, currentIndex, to }">
            <ul class="custom-dots">
                <li v-for="index of total" :key="index"
                    :class="{ ['is-active']: currentIndex === index - 1, 'dark-dot': isDarkTheme, 'light-dot': !isDarkTheme }"
                    @click="to(index - 1)" :style="dotStyle(index, currentIndex)" />
            </ul>
        </template>
    </n-carousel>
    <n-grid cols="6" item-responsive responsive="screen" class="softwareModule">
        <!-- ChmlFrp官方应用 -->
        <n-grid-item span="6">
            <n-h3 style="margin-top: 32px;">
                ChmlFrp官方应用
            </n-h3>
            <n-grid x-gap="12" y-gap="12" cols="1 s:3 m:4 l:5 xl:5" responsive="screen" :collapsed-rows="1"
                :collapsed="true">
                <n-gi v-for="app in apps" :key="app.id">
                    <n-card size="small" hoverable>
                        <!-- 使用 cover 插槽来传递封面图 -->
                        <template #cover>
                            <img :src="app.coverImage" alt="cover"
                                style="width: 100%; height: 120px; border-radius: 8px;" />
                        </template>
                    </n-card>
                </n-gi>
            </n-grid>
        </n-grid-item>

        <!-- 热度排行
        <n-grid-item>
            <n-h3 style="margin-top: 32px;">
                热度排行
            </n-h3>
            <n-list :items="rankedApps">
                <n-list-item v-for="(app, index) in rankedApps" :key="app.id">
                    <n-card>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold;">{{ index + 1 }}. {{ app.name }}</div>
                                <p>{{ app.description }}</p>
                            </div>
                        </div>
                    </n-card>
                </n-list-item>
            </n-list>
        </n-grid-item> -->
    </n-grid>
    <n-card style="margin-top: 32px; width: 100%; height: 320px;">
        
    </n-card>
    <n-card style="margin-top: 32px;">
        如果您也想想让您的软件出现在这里，请邮件联系chaoji@chcat.cn
    </n-card>
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
        backgroundColor: currentIndex === index - 1 ? (isDarkTheme.value ? '#fff' : '#000') : (isDarkTheme.value ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'),
        width: currentIndex === index - 1 ? '40px' : '12px'
    }
}

// 示例应用数据
const apps = ref([
    {
        id: 1,
        name: 'WinUi启动器',
        description: 'win10以上的图形客户端',
        coverImage: 'https://via.placeholder.com/320x120',
    },
    {
        id: 2,
        name: 'EXUI启动器',
        description: 'win7以上的图形客户端',
        coverImage: 'https://via.placeholder.com/320x120',
    },
    {
        id: 3,
        name: 'MC插件端',
        description: '适用于MC插件服务器',
        coverImage: 'https://via.placeholder.com/320x120',
    },
    {
        id: 4,
        name: 'MCFabric模组端',
        description: '提供MC游戏内的隧道操控',
        coverImage: 'https://via.placeholder.com/320x120',
    },
    {
        id: 5,
        name: 'MCFabric模组端',
        description: '提供MC游戏内的隧道操控',
        coverImage: 'https://via.placeholder.com/320x120',
    },
    {
        id: 6,
        name: 'MCFabric模组端',
        description: '提供MC游戏内的隧道操控',
        coverImage: 'https://via.placeholder.com/320x120',
    },
    {
        id: 7,
        name: 'MCFabric模组端',
        description: '提供MC游戏内的隧道操控',
        coverImage: 'https://via.placeholder.com/320x120',
    }
])

// 热度排行数据
const rankedApps = ref([
    {
        id: 1,
        name: 'App A',
        description: '高热度应用A，广受欢迎。',
    },
    {
        id: 2,
        name: 'App B',
        description: '热度应用B，很多用户使用。',
    },
    {
        id: 3,
        name: 'App C',
        description: '热度应用C，有很好的评分。',
    },
])
</script>

<style lang="scss">
.softwareModule {
    .n-grid-item {
        margin-bottom: 20px;
    }

    .n-card {
        width: 100%;
    }

    .n-card img {
        border-radius: 8px;
    }
}


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
    background-color: rgba(0, 0, 0, 0.6);
    border-width: 0;
    border-radius: 8px;
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    color: #fff;
}

.dark-arrow {
    background-color: rgba(255, 255, 255, 0.4) !important;
}

.light-arrow {
    background-color: rgba(0, 0, 0, 0.4) !important;
}

.custom-arrow button:hover {
    background-color: rgba(0, 0, 0, 0.6) !important;
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

/* 暗色模式下的 dots 样式 */
.dark-dot {
    background-color: rgba(255, 255, 255, 0.6);
}

/* 亮色模式下的 dots 样式 */
.light-dot {
    background-color: rgba(0, 0, 0, 0.6);
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
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

/* 暗色模式下的 favicon 样式 */
.dark-favicon {
    background-color: rgba(255, 255, 255, 0.2);
}
</style>