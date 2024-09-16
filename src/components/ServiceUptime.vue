<template>
    <n-flex justify="space-between">
        <div>
            <n-tag style="margin-right: 8px" round :bordered="false" type="warning" size="small">
                {{ group }}
                <template #icon>
                    <n-icon :component="DiamondOutline" />
                </template>
            </n-tag>
            <span style="font-size: 16px">{{ serverName }}</span>
        </div>
        <div class="container">
            <span :style="{ color: getDynamicColor(averageUptime) }" style="font-size: 16px; margin-right: 18px" v-if="screenWidth >= 700">
                {{ averageUptime }}%
            </span>
            <n-popover trigger="hover" v-for="(uptime, index) in displayedUptimeHistory" :key="index">
                <template #trigger>
                    <div class="bar" :style="{ backgroundColor: getDynamicColor(uptime) }">
                    </div>
                </template>
                <span>
                    <span style="color: gray; font-size: 12px">{{ formattedDate(index) }}</span>
                    <br />
                    {{ uptime !== null ? `${uptime}%` : 'No Data' }}
                </span>
            </n-popover>
            <div class="upContainer" v-if="screenWidth >= 700">
                <div :class="['circle', state === 'online' ? 'online' : 'offline']"></div>
                <span :class="['text', state === 'offline' ? 'down' : '']">
                    {{ state === 'online' ? 'Up' : 'Down' }}
                </span>
            </div>
        </div>
        <div v-if="screenWidth <= 700">
            <n-flex justify="space-between">
                <span style="font-size: 16px; margin-right: 18px" :style="{ color: getDynamicColor(averageUptime) }">{{ averageUptime }}%</span>
                <div class="upContainer">
                    <div :class="['circle', state === 'online' ? 'online' : 'offline']"></div>
                    <span :class="['text', state === 'offline' ? 'down' : '']">
                        {{ state === 'online' ? 'Up' : 'Down' }}
                    </span>
                </div>
            </n-flex>
        </div>
    </n-flex>
</template>

<script setup lang="ts">
import { DiamondOutline } from '@vicons/ionicons5'
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { defineProps } from 'vue';
import { format, subDays } from 'date-fns';

// 接收外部传递的 props，包括 uptime、group、serverName、uptimeHistory 和显示天数
const props = defineProps({
    uptime: {
        type: Number,
        default: 100
    },
    group: {
        type: String,
        default: 'VIP'
    },
    serverName: {
        type: String,
        default: '月球CN2-1'
    },
    uptimeHistory: {
        type: Array as () => (number | null)[],
        default: () => Array(90).fill(null)
    },
    daysToShow: {
        type: Number,
        default: 90
    },
    state: {
        type: String,
        default: 'online'
    }
});

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 获取截取的 uptime 数据，只显示指定的天数
const displayedUptimeHistory = computed(() => props.uptimeHistory.slice(0, props.daysToShow));

// 格式化日期
const formattedDate = (index: number) => {
    const date = subDays(new Date(), index);
    return format(date, 'yyyy-MM-dd');
};

// 计算所有有效的uptime平均值
const averageUptime = computed(() => {
    const validUptime = props.uptimeHistory.filter(uptime => uptime !== null);
    if (validUptime.length === 0) return 0;
    
    const totalUptime = validUptime.reduce((sum, uptime) => sum + (uptime as number), 0);
    const average = totalUptime / validUptime.length;
    return parseFloat(average.toFixed(4));
});

// 动态计算颜色 - 通过线性插值根据uptime值动态生成从红色到绿色的过渡颜色
const getDynamicColor = (uptime: number | null) => {
    if (uptime === null) return 'gray'; // 如果没有数据，显示为灰色

    // 定义红色和绿色的RGB值
    const red = [255, 0, 0];
    const green = [59, 214, 113];

    // 计算当前uptime值对应的颜色（线性插值）
    const ratio = uptime / 100; // uptime 是百分比，范围 0-100
    const interpolatedColor = red.map((start, index) => {
        const end = green[index];
        return Math.round(start + (end - start) * ratio);
    });

    // 返回RGB颜色值
    return `rgb(${interpolatedColor.join(',')})`;
};
</script>

<style scoped>
.upContainer {
    display: flex;
    align-items: center;
    margin-left: 36px;
}

.circle {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    position: relative;
}

.online {
    background-color: rgb(59, 214, 113);
    /* 在线状态的绿色 */
}

.offline {
    background-color: rgb(255, 0, 0);
    /* 离线状态的红色 */
}

.circle::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ripple 2s infinite;
    opacity: 0;
}

.online::before {
    background-color: rgba(59, 214, 113, 0.8);
    /* 在线时的涟漪效果 */
}

.offline::before {
    background-color: rgba(255, 0, 0, 0.8);
    /* 离线时的涟漪效果 */
}

@keyframes ripple {
    0% {
        width: 15px;
        height: 15px;
        opacity: 1;
    }

    100% {
        width: 40px;
        height: 40px;
        opacity: 0;
    }
}

.text {
    margin-left: 10px;
    color: rgb(59, 214, 113);
}

.down {
    color: red;
}

.container {
    display: flex;
    flex-direction: row;
    gap: 3px;
}

.bar {
    background-color: rgb(59, 214, 113);
    width: 4px;
    height: 15px;
    border-radius: 2px;
    transition: transform 0.3s ease, background-color 0.3s ease;
}

.bar:hover {
    transform: scale(1.2);
    background-color: rgb(34, 139, 34);
}
</style>