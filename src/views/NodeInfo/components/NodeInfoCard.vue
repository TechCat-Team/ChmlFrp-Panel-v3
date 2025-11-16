<template>
    <n-card :style="{ minHeight: CARD_MIN_HEIGHT }">
        <n-space vertical>
            <span>{{ nodeDetails?.cpu_info }}</span>
            <n-progress v-if="latestStatus" :percentage="latestStatus.cpu_usage" status="info" />
            <n-divider />
            <n-grid cols="5" item-responsive responsive="screen">
                <n-grid-item span="4">
                    <n-descriptions :column="4">
                        <n-descriptions-item label="核数">
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    {{ nodeDetails?.num_cores }}
                                </template>
                                CPU的核心数量
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="空闲">
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    {{ latestStatus ? (100 - latestStatus.cpu_usage).toFixed(2) : 'N/A' }}%
                                </template>
                                CPU剩余占用百分比
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="运行时间">
                            {{ uptimeDays !== null ? `${uptimeDays}天` : 'N/A' }}
                        </n-descriptions-item>
                        <n-descriptions-item label="负荷">
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    {{ nodeDetails?.load1 }},{{ nodeDetails?.load5 }},{{ nodeDetails?.load15 }}
                                </template>
                                近1分钟、5分钟、15分钟的负荷
                            </n-tooltip>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-grid-item>
                <n-grid-item span="1" style="display: flex; justify-content: center; align-items: center">
                    <n-progress
                        style="width: 40px; height: 40px"
                        type="multiple-circle"
                        :stroke-width="10"
                        :circle-gap="1"
                        :percentage="[percentage, (percentage + 4) % 100, (percentage + 10) % 100]"
                        :color="['var(--success-color)', 'var(--success-color)', 'var(--success-color)']"
                        :rail-style="[{ opacity: 0.6 }, { opacity: 0.6 }, { opacity: 0.6 }]"
                    />
                </n-grid-item>
            </n-grid>
        </n-space>
    </n-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { NodeDetails, Status } from '../types';
import { CARD_MIN_HEIGHT } from '../constants';

interface Props {
    nodeDetails?: NodeDetails;
    latestStatus: Status | null;
    uptimeDays: number | null;
}

defineProps<Props>();

const percentage = ref(3);
</script>

