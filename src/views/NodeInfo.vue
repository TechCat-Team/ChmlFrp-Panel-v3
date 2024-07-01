<template>
    <n-layout style="height: 100vh">
        <n-layout-header bordered>
            <HeaderComponent />
        </n-layout-header>
        <n-layout-content content-style="padding: 24px;">
            <n-card>
                <ServiceUptime />
            </n-card>
            <n-grid :x-gap="12" :y-gap="12" cols="1 m:3" responsive="screen" style="margin-top: 24px">
                <n-grid-item>
                    <n-card style="min-height: 198px">
                        <n-space vertical>
                            <span>{{cpuModel}}</span>
                            <n-progress :percentage="cpuUsage" status="info" />
                            <n-divider />
                            <n-grid cols="5" item-responsive responsive="screen">
                                <n-grid-item span="4">
                                    <n-descriptions :column="4">
                                        <n-descriptions-item label="核数">{{ cpuCores }}</n-descriptions-item>
                                        <n-descriptions-item label="空闲">{{ cpuUsage }}%</n-descriptions-item>
                                        <n-descriptions-item label="运行时间">{{ uptime }}</n-descriptions-item>
                                        <n-descriptions-item label="负荷">1,5,15m</n-descriptions-item>
                                    </n-descriptions>
                                </n-grid-item>
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 40px; height: 40px;" type="multiple-circle"
                                        :stroke-width="10" :circle-gap="1" :percentage="[
                                            percentage,
                                            (percentage + 4) % 100,
                                            (percentage + 10) % 100,
                                        ]" :color="[
                                            'var(--success-color)',
                                            'var(--success-color)',
                                            'var(--success-color)',
                                        ]" :rail-style="[
                                            { opacity: 0.6 },
                                            { opacity: 0.6 },
                                            { opacity: 0.6 },
                                        ]">
                                    </n-progress>
                                </n-grid-item>
                            </n-grid>
                        </n-space>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card style="min-height: 198px">
                        <n-grid cols="4" item-responsive responsive="screen">
                            <n-grid-item span="3">
                                <n-descriptions :column="3">
                                    <n-descriptions-item label="可用内存">{{ memoryTotal }} G</n-descriptions-item>
                                    <n-descriptions-item label="已用内存">{{ memoryAvailable }} G</n-descriptions-item>
                                    <n-descriptions-item label="页面缓存">{{ memoryUsage }} M</n-descriptions-item>
                                </n-descriptions>
                            </n-grid-item>
                            <n-grid-item span="1">
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 50px; height: 50px;" type="circle" :stroke-width="15"
                                        :circle-gap="1" :percentage="memoryAvailablePercentage" :rail-style="[
                                            { opacity: 0.6 },
                                        ]">
                                        <div style="text-align: center; font-size: 8px">
                                            {{ memoryAvailablePercentage }}%
                                        </div>
                                    </n-progress>
                                </n-grid-item>
                            </n-grid-item>
                        </n-grid>
                        <n-divider />
                        <n-grid cols="4" item-responsive responsive="screen">
                            <n-grid-item span="3">
                                <n-descriptions :column="4">
                                    <n-descriptions-item label="所有储存">4 TB</n-descriptions-item>
                                    <n-descriptions-item label="已用储存">215.2 GB</n-descriptions-item>
                                    <n-descriptions-item label="剩余储存">不知道 GB</n-descriptions-item>
                                </n-descriptions>
                            </n-grid-item>
                            <n-grid-item span="1">
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 50px; height: 50px;" type="circle" :stroke-width="15"
                                        :circle-gap="1" :percentage="12.4" :rail-style="[
                                            { opacity: 0.6 },
                                        ]">
                                        <div style="text-align: center; font-size: 8px">
                                            12.4 %
                                        </div>
                                    </n-progress>
                                </n-grid-item>
                            </n-grid-item>
                        </n-grid>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card style="min-height: 198px">
                        <n-grid cols="4" item-responsive responsive="screen">
                            <n-grid-item span="3">
                                <n-descriptions :column="4">
                                    <n-descriptions-item label="上带宽">{{ uploadSpeed }}m</n-descriptions-item>
                                    <n-descriptions-item label="下带宽">{{ downloadSpeed }}m</n-descriptions-item>
                                    <n-descriptions-item label="上流量">21.5G</n-descriptions-item>
                                    <n-descriptions-item label="下流量">12.9G</n-descriptions-item>
                                </n-descriptions>
                            </n-grid-item>
                            <n-grid-item span="1">
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 50px; height: 50px;" type="circle" :stroke-width="15"
                                        :circle-gap="1" :percentage="memoryAvailablePercentage" :rail-style="[
                                            { opacity: 0.6 },
                                        ]">
                                        <div style="text-align: center; font-size: 8px">
                                            {{ memoryAvailablePercentage }}%
                                        </div>
                                    </n-progress>
                                </n-grid-item>
                            </n-grid-item>
                        </n-grid>
                        <n-divider />
                        <n-descriptions :column="4">
                            <n-descriptions-item label="重传率">0 %</n-descriptions-item>
                            <n-descriptions-item label="主动连接">12</n-descriptions-item>
                            <n-descriptions-item label="被动连接">42</n-descriptions-item>
                            <n-descriptions-item label="连接失败">0</n-descriptions-item>
                        </n-descriptions>
                    </n-card>
                </n-grid-item>
            </n-grid>
        </n-layout-content>
    </n-layout>
</template>

<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NSpace, NCard, NProgress } from 'naive-ui';

const percentage = ref(3)

const cpuModel = ref('Intel(R) Epyc(R) CPU i9 7950KF');
const cpuCores = ref(8);
const cpuUsage = ref(45);

const memoryTotal = ref(32); //总内存
const memoryUsage = ref(15.2); //已用内存
const memoryAvailable = ref(memoryTotal.value - memoryUsage.value) //可用内存
const memoryAvailablePercentage = ref((memoryUsage.value / memoryTotal.value) * 100);

const uptime = ref('321天');

const uploadSpeed = ref(73.5);
const downloadSpeed = ref(26.4);
</script>

<style scoped>
.n-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>