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
                    <n-number-animation :from="0" show-separator :to="42124" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item>
                <n-statistic label="当前总连接数" tabular-nums>
                    <template #prefix>
                        <n-icon :component="LinkOutline" />
                    </template>
                    <n-number-animation :from="0" show-separator :to="1203924" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="今日上传总流量" tabular-nums>
                    <template #prefix>
                        <n-icon :component="ArrowUpOutline" />
                    </template>
                    <n-number-animation :from="0" :to="120.39" :precision="2" />
                    <template #suffix>
                        TiB
                    </template>
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="今日下载总流量" tabular-nums>
                    <template #prefix>
                        <n-icon :component="ArrowDownOutline" />
                    </template>
                    <n-number-animation :from="0" :to="421.26" :precision="2" />
                    <template #suffix>
                        TiB
                    </template>
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="数据更新时间" tabular-nums>
                    2024-6-2 18:56
                </n-statistic>
            </n-grid-item>
        </n-grid>
        <div v-else style="font-size: 32px; font-weight:bold; display: flex; align-items: center;">
            <div class="circle"></div>
            <span>所有节点均<span style="color: rgb(59, 214, 113)">正常</span>运行</span>
        </div>
    </n-card>
    <n-grid v-if="!available" cols="1 m:2 l:3 xl:4 2xl:5" style="margin-top: 20px;" :x-gap="12" :y-gap="12"
        responsive="screen">
        <n-grid-item v-for="(nodeStatusCard, index) in nodeStatusCards" :key="index">
            <n-card size="small" hoverable @click="goToNodeInfo">
                <template #header>
                    {{ nodeStatusCard.title }}
                    <span style="color: gray; font-size: 14px;">{{ nodeStatusCard.id }}</span>
                </template>
                <template #header-extra>
                    <n-flex>
                        <n-tag round :bordered="false" type="warning" v-if="nodeStatusCard.group === 'vip'">
                            VIP
                        </n-tag>
                        <n-tag round :bordered="false" v-if="nodeStatusCard.state === false">
                            离线
                        </n-tag>
                    </n-flex>
                </template>
                <n-flex justify="space-around" size="large" align="center">
                    <n-progress type="circle" :percentage="nodeStatusCard.bandwidthOccupation"
                        :color="progressColor(nodeStatusCard.bandwidthOccupation)" />
                    <n-descriptions label-placement="left" :column="1">
                        <n-descriptions-item label="上传">
                            {{ nodeStatusCard.uploadTraffic }}
                        </n-descriptions-item>
                        <n-descriptions-item label="下载">
                            {{ nodeStatusCard.downloadTraffic }}
                        </n-descriptions-item>
                        <n-descriptions-item label="连接数">
                            {{ nodeStatusCard.numberOfConnections }}
                        </n-descriptions-item>
                        <n-descriptions-item label="CPU占用">
                            {{ nodeStatusCard.CPU }}
                        </n-descriptions-item>
                    </n-descriptions>
                </n-flex>
            </n-card>
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
import { useRouter } from 'vue-router';

const available = ref(false)

const router = useRouter();
const goToNodeInfo = () => {
    const url = router.resolve({ path: '/node/info' }).href;
    window.open(url, '_blank');
}

const nodeStatusCards = ref([
    {
        id: '#1',
        title: '火星CN2-1',
        group: 'vip',
        uploadTraffic: 12.21,
        downloadTraffic: 24.12,
        numberOfConnections: 1244,
        CPU: '24%',
        bandwidthOccupation: 20,
        state: false
    },
    {
        id: '#3',
        title: '金星CN2-1',
        group: 'user',
        uploadTraffic: 12.21,
        downloadTraffic: 24.12,
        numberOfConnections: 1244,
        CPU: '24%',
        bandwidthOccupation: 32,
        state: true
    },
    {
        id: '#2',
        title: '月球直连',
        group: 'user',
        uploadTraffic: 12.21,
        downloadTraffic: 24.12,
        numberOfConnections: 1244,
        CPU: '24%',
        bandwidthOccupation: 52,
        state: true
    },
    {
        id: '#4',
        title: '中国香港',
        group: 'vip',
        uploadTraffic: 12.21,
        downloadTraffic: 24.12,
        numberOfConnections: 1244,
        CPU: '24%',
        bandwidthOccupation: 86,
        state: true
    },
    {
        id: '#5',
        title: '中国北京',
        group: 'user',
        uploadTraffic: 12.21,
        downloadTraffic: 24.12,
        numberOfConnections: 1244,
        CPU: '152%',
        bandwidthOccupation: 2512,
        state: true
    },
])


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