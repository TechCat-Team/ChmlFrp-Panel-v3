<template>
    <n-card :style="{ minHeight: CARD_MIN_HEIGHT }">
        <n-grid cols="4" item-responsive responsive="screen">
            <n-grid-item span="4">
                <n-descriptions :column="4">
                    <n-descriptions-item label="上传带宽">
                        <n-tooltip trigger="hover">
                            <template #trigger> {{ latestStatus?.upload_bandwidth_usage_percent }}% </template>
                            最近一次数据统计的上传带宽占用百分比
                        </n-tooltip>
                    </n-descriptions-item>
                    <n-descriptions-item label="下载带宽">
                        <n-tooltip trigger="hover">
                            <template #trigger> {{ latestStatus?.download_bandwidth_usage_percent }}% </template>
                            最近一次数据统计的下载带宽占用百分比
                        </n-tooltip>
                    </n-descriptions-item>
                    <n-descriptions-item label="上传流量">
                        <n-tooltip trigger="hover">
                            <template #trigger>
                                {{ formatBytes(nodeDetails?.total_traffic_out).value }}
                                {{ formatBytes(nodeDetails?.total_traffic_out).suffix }}
                            </template>
                            今日上传总流量(有较大误差)
                        </n-tooltip>
                    </n-descriptions-item>
                    <n-descriptions-item label="下载流量">
                        <n-tooltip trigger="hover">
                            <template #trigger>
                                {{ formatBytes(nodeDetails?.total_traffic_in).value }}
                                {{ formatBytes(nodeDetails?.total_traffic_in).suffix }}
                            </template>
                            今日下载总流量(有较大误差)
                        </n-tooltip>
                    </n-descriptions-item>
                </n-descriptions>
            </n-grid-item>
        </n-grid>
        <n-divider />
        <n-descriptions :column="4">
            <n-descriptions-item label="发送数据">
                {{ latestStatus ? (latestStatus.sent_packets / PACKETS_DIVISOR).toFixed(2) + '亿' : 'N/A' }}
            </n-descriptions-item>
            <n-descriptions-item label="接收数据">
                {{ latestStatus ? (latestStatus.recv_packets / PACKETS_DIVISOR).toFixed(2) + '亿' : 'N/A' }}
            </n-descriptions-item>
            <n-descriptions-item label="被动连接">{{ latestStatus?.passive_conn }}</n-descriptions-item>
            <n-descriptions-item label="活跃连接">{{ latestStatus?.active_conn }}</n-descriptions-item>
        </n-descriptions>
    </n-card>
</template>

<script lang="ts" setup>
import type { NodeDetails, Status } from '../types';
import { formatBytes } from '@/utils/formatBytes';
import { CARD_MIN_HEIGHT, PACKETS_DIVISOR } from '../constants';

interface Props {
    nodeDetails?: NodeDetails;
    latestStatus: Status | null;
}

defineProps<Props>();
</script>
