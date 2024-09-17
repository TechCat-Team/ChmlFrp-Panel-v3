<template>
    <n-back-top :right="100" />
    <n-card title="统计信息">
        <template #header-extra>
            <n-switch v-model:value="available">
                <template #checked>
                    可用性
                </template>
                <template #unchecked>
                    状 态
                </template>
            </n-switch>
        </template>
        <n-grid cols="2 m:5 xl:7" responsive="screen" v-if="!available">
            <n-grid-item>
                <n-statistic label="当前总在线隧道" tabular-nums>
                    <template #prefix>
                        <n-icon :component="BarcodeOutline" />
                    </template>
                    <n-number-animation :from="0" show-separator :to="clientCounts" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item>
                <n-statistic label="当前总连接数" tabular-nums>
                    <template #prefix>
                        <n-icon :component="LinkOutline" />
                    </template>
                    <n-number-animation :from="0" show-separator :to="curCounts" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="今日上传总流量" tabular-nums>
                    <template #prefix>
                        <n-icon :component="ArrowUpOutline" />
                    </template>
                    <n-number-animation :from="0" :to="formatBytes(totalTrafficOut).value" :precision="2" />
                    <template #suffix>
                        {{ formatBytes(totalTrafficOut).suffix }}
                    </template>
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="今日下载总流量" tabular-nums>
                    <template #prefix>
                        <n-icon :component="ArrowDownOutline" />
                    </template>
                    <n-number-animation :from="0" :to="formatBytes(totalTrafficIn).value" :precision="2" />
                    <template #suffix>
                        {{ formatBytes(totalTrafficIn).suffix }}
                    </template>
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="统计粒度" tabular-nums>
                    20s
                </n-statistic>
            </n-grid-item>
        </n-grid>
        <div v-else style="font-size: 32px; font-weight:bold; display: flex; align-items: center;">
            <div class="circle"></div>
            <span>所有节点均<span style="color: rgb(59, 214, 113)">正常</span>运行</span>
        </div>
    </n-card>
    <n-grid v-if="loadingStatus" cols="1 m:2 l:3 xl:4 2xl:5" style="margin-top: 20px;" :x-gap="12" :y-gap="12"
        responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="191.2px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else-if="!available" cols="1 m:2 l:3 xl:4 2xl:5" style="margin-top: 20px;" :x-gap="12" :y-gap="12"
        responsive="screen">
        <n-grid-item v-for="(nodeStatusCard, index) in nodeStatusCards" :key="index">
            <n-card size="small" hoverable @click="goToNodeInfo">
                <template #header>
                    {{ nodeStatusCard.node_name }}
                    <span style="color: gray; font-size: 14px;">#{{ nodeStatusCard.id }}</span>
                </template>
                <template #header-extra>
                    <n-flex>
                        <n-tag round :bordered="false" type="warning" v-if="nodeStatusCard.nodegroup === 'vip'">
                            VIP
                        </n-tag>
                        <n-tag round :bordered="false" v-if="nodeStatusCard.state === 'offline'">
                            离线
                        </n-tag>
                    </n-flex>
                </template>
                <n-flex justify="space-around" size="large" align="center">
                    <n-progress type="circle" :percentage="nodeStatusCard.bandwidth_usage_percent"
                        :color="progressColor(nodeStatusCard.bandwidth_usage_percent)" />
                    <n-descriptions label-placement="left" :column="1">
                        <n-descriptions-item label="今日上传">
                            {{ formatBytes(nodeStatusCard.total_traffic_out).value }} {{
                                formatBytes(nodeStatusCard.total_traffic_out).suffix }}
                        </n-descriptions-item>
                        <n-descriptions-item label="今日下载">
                            {{ formatBytes(nodeStatusCard.total_traffic_in).value }} {{
                                formatBytes(nodeStatusCard.total_traffic_in).suffix }}
                        </n-descriptions-item>
                        <n-descriptions-item label="客户端数">
                            {{ nodeStatusCard.client_counts }}
                        </n-descriptions-item>
                        <n-descriptions-item label="CPU占用">
                            {{ nodeStatusCard.cpu_usage.toFixed(2) }}%
                        </n-descriptions-item>
                    </n-descriptions>
                </n-flex>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-grid v-else-if="loadingUptime" :cols="1" style="margin-top: 20px;" :x-gap="12" :y-gap="12"
        responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="65.6px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else :cols="1" style="margin-top: 20px;" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item>
            <n-card hoverable @click="goToNodeInfo">
                <ServiceUptime />
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable @click="goToNodeInfo">
                <ServiceUptime />
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable @click="goToNodeInfo">
                <ServiceUptime />
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import { LinkOutline, BarcodeOutline, ArrowUpOutline, ArrowDownOutline } from '@vicons/ionicons5'
import axios from 'axios';
import { useRouter } from 'vue-router';

const available = ref(false)
const loadingStatus = ref(true)
const loadingUptime = ref(true)

const router = useRouter();
const goToNodeInfo = () => {
    const url = router.resolve({ path: '/node/info' }).href;
    window.open(url, '_blank');
}

// 无限滚动
const count = ref(16)
const handleLoad = () => {
    count.value += 1
}

onMounted(() => {
    nodeStatus()
    setInterval(nodeStatus, 25000);
})


interface nodeStatusCard {
    id: number;
    total_traffic_in: number;
    total_traffic_out: number;
    node_name: string;
    state: string;
    bandwidth_usage_percent: number;
    cpu_usage: number;
    nodegroup: string;
    client_counts: number;
    cur_counts: number;
}

const nodeStatusCards = ref<nodeStatusCard[]>([])

const totalTrafficIn = ref(0);  // 总下载流量
const totalTrafficOut = ref(0); // 总上传流量
const clientCounts = ref(0); // 总连接数
const curCounts = ref(0); // 总在线隧道数
const onlineNodes = ref(0); // 当前总在线节点

const nodeStatus = async () => {
    try {
        const response = await axios.get('https://cf-v2.uapis.cn/node_stats');
        if (response.data.code === 200) {
            nodeStatusCards.value = response.data.data;
            // 节点排序
            nodeStatusCards.value.sort((a, b) => {
                if (a.state === 'offline' && b.state !== 'offline') return 1;
                if (a.nodegroup === 'vip' && b.nodegroup !== 'vip') return 1;
                return -1;
            });
            // 计算总流量、连接数和在线隧道数
            totalTrafficIn.value = nodeStatusCards.value.reduce((sum, card) => sum + card.total_traffic_in, 0);
            totalTrafficOut.value = nodeStatusCards.value.reduce((sum, card) => sum + card.total_traffic_out, 0);
            clientCounts.value = nodeStatusCards.value.reduce((sum, card) => sum + card.client_counts, 0);
            curCounts.value = nodeStatusCards.value.reduce((sum, card) => sum + card.cur_counts, 0);
            onlineNodes.value = nodeStatusCards.value.filter(card => card.state === 'online').length;
        } else {
            console.error('获取节点状态数据失败:', response.data.msg);
        }
    } catch (error) {
        console.error('获取节点状态API请求失败:', error);
    } finally {
        loadingStatus.value = false;
    }
};

// 流量单位换算
function formatBytes(bytes: string | number): { value: number; suffix: string } {
    let num: number;
    if (typeof bytes === 'string') {
        num = parseFloat(bytes);
    } else {
        num = bytes;
    }
    const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    if (num === 0) return { value: 0, suffix: 'Bytes' };
    let index = 0;
    while (num >= 1024 && index < units.length - 1) {
        num /= 1024;
        index++;
    }
    return { value: parseFloat(num.toFixed(2)), suffix: units[index] };
}

// 根据节点负载调整进度条颜色
const progressColor = (bandwidthOccupation: number) => {
    if (bandwidthOccupation >= 0 && bandwidthOccupation < 25) {
        return '#18a058'
    } else if (bandwidthOccupation >= 25 && bandwidthOccupation < 50) {
        return '#2080f0'
    } else if (bandwidthOccupation >= 50 && bandwidthOccupation < 75) {
        return '#faad14'
    } else if (bandwidthOccupation >= 75 && bandwidthOccupation < 100) {
        return '#fa541c'
    } else {
        return '#f5222d'
    }
}

</script>

<style scoped>
.circle {
    margin-right: 15px;
    margin-top: 3px;
    width: 30px;
    height: 30px;
    background-color: rgb(59, 214, 113);
    border-radius: 50%;
    position: relative;
}

.circle::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    background-color: rgba(59, 214, 113, 0.8);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ripple 2s infinite;
    opacity: 0;
}

@keyframes ripple {
    0% {
        width: 30px;
        height: 30px;
        opacity: 1;
    }

    100% {
        width: 60px;
        height: 60px;
        opacity: 0;
    }
}
</style>