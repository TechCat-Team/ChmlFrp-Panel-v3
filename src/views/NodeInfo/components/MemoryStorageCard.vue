<template>
    <n-card :style="{ minHeight: CARD_MIN_HEIGHT }">
        <n-grid cols="4" item-responsive responsive="screen">
            <n-grid-item span="3">
                <n-descriptions :column="3">
                    <n-descriptions-item label="可用内存">
                        {{ formatBytes(nodeDetails?.memory_total).value }}
                        {{ formatBytes(nodeDetails?.memory_total).suffix }}
                    </n-descriptions-item>
                    <n-descriptions-item v-if="latestStatus" label="已用内存">
                        {{ formatBytes(latestStatus.memory_used).value }}
                        {{ formatBytes(latestStatus.memory_used).suffix }}
                    </n-descriptions-item>
                    <n-descriptions-item v-if="latestStatus" label="页面缓存">
                        {{ formatBytes(latestStatus.page_tables).value }}
                        {{ formatBytes(latestStatus.page_tables).suffix }}
                    </n-descriptions-item>
                </n-descriptions>
            </n-grid-item>
            <n-grid-item span="1">
                <n-grid-item span="1" style="display: flex; justify-content: center; align-items: center">
                    <n-progress
                        v-if="latestStatus"
                        style="width: 50px; height: 50px"
                        type="circle"
                        :stroke-width="15"
                        :circle-gap="1"
                        :percentage="memoryUsedPercentage"
                        :rail-style="[{ opacity: 0.6 }]"
                    >
                        <div style="text-align: center; font-size: 8px">
                            {{ memoryUsedPercentage.toFixed(1) }}%
                        </div>
                    </n-progress>
                </n-grid-item>
            </n-grid-item>
        </n-grid>
        <n-divider />
        <n-grid cols="4" item-responsive responsive="screen">
            <n-grid-item span="3">
                <n-descriptions :column="4">
                    <n-descriptions-item label="所有储存">
                        {{ formatBytes(nodeDetails?.storage_total).value }}
                        {{ formatBytes(nodeDetails?.storage_total).suffix }}
                    </n-descriptions-item>
                    <n-descriptions-item label="已用储存">
                        {{ formatBytes(nodeDetails?.storage_used).value }}
                        {{ formatBytes(nodeDetails?.storage_used).suffix }}
                    </n-descriptions-item>
                    <n-descriptions-item label="剩余储存">
                        {{ formatBytes(storageRemaining).value }}
                        {{ formatBytes(storageRemaining).suffix }}
                    </n-descriptions-item>
                </n-descriptions>
            </n-grid-item>
            <n-grid-item span="1">
                <n-grid-item span="1" style="display: flex; justify-content: center; align-items: center">
                    <n-progress
                        style="width: 50px; height: 50px"
                        type="circle"
                        :stroke-width="15"
                        :circle-gap="1"
                        :percentage="storageUsedPercentage"
                        :rail-style="[{ opacity: 0.6 }]"
                    >
                        <div style="text-align: center; font-size: 8px">
                            {{ storageUsedPercentage.toFixed(1) }}%
                        </div>
                    </n-progress>
                </n-grid-item>
            </n-grid-item>
        </n-grid>
    </n-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { NodeDetails, Status } from '../types';
import { formatBytes } from '@/utils/formatBytes';
import { CARD_MIN_HEIGHT } from '../constants';

interface Props {
    nodeDetails?: NodeDetails;
    latestStatus: Status | null;
    memoryUsedPercentage: number;
    storageUsedPercentage: number;
}

const props = defineProps<Props>();

const storageRemaining = computed(() => {
    const total = props.nodeDetails?.storage_total || 0;
    const used = props.nodeDetails?.storage_used || 0;
    return total - used;
});
</script>

