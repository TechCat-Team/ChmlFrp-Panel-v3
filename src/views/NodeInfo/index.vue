<template>
    <n-layout style="height: 100vh">
        <n-layout-header bordered>
            <HeaderComponent />
        </n-layout-header>
        <n-layout-content content-style="padding: 24px;">
            <ErrorState
                v-if="!node"
                status="404"
                title="缺少参数"
                description="您尚未传递节点参数"
            />
            <ErrorState
                v-else-if="whetherTheNodeExists"
                status="404"
                title="节点不存在"
                description="您选择的节点不存在"
            />
            <ErrorState
                v-else-if="apiError"
                status="500"
                title="API错误"
                description="请联系管理员提交问题并等待修复"
            />
            <div v-else>
                <n-grid :x-gap="12" :y-gap="12" cols="1 m:3" responsive="screen">
                    <n-grid-item>
                        <NodeInfoCard
                            :node-details="nodeDetails"
                            :latest-status="latestStatus"
                            :uptime-days="uptimeDays"
                        />
                    </n-grid-item>
                    <n-grid-item>
                        <MemoryStorageCard
                            :node-details="nodeDetails"
                            :latest-status="latestStatus"
                            :memory-used-percentage="memoryUsedPercentage"
                            :storage-used-percentage="storageUsedPercentage"
                        />
                    </n-grid-item>
                    <n-grid-item>
                        <NetworkCard :node-details="nodeDetails" :latest-status="latestStatus" />
                    </n-grid-item>
                    <n-grid-item :span="2">
                        <NodeMapCard :loading="loadingNodeMap" :markers="markers" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard
                            chart-id="frp-chart"
                            :descriptions="{
                                FRP版本: nodeDetails?.version,
                                客户端数: latestStatus?.client_counts,
                                连接数: latestStatus?.active_conn,
                            }"
                        />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="network-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="cpu-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="memory-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="proxy-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="cur-conns-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="client-counts-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="packets-chart" />
                    </n-grid-item>
                    <n-grid-item>
                        <ChartCard chart-id="conn-chart" />
                    </n-grid-item>
                </n-grid>
            </div>
        </n-layout-content>
    </n-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import ErrorState from './components/ErrorState.vue';
import NodeInfoCard from './components/NodeInfoCard.vue';
import MemoryStorageCard from './components/MemoryStorageCard.vue';
import NetworkCard from './components/NetworkCard.vue';
import NodeMapCard from './components/NodeMapCard.vue';
import ChartCard from './components/ChartCard.vue';
import { useNodeData } from './composables/useNodeData';
import { useNodeStatus } from './composables/useNodeStatus';
import { useNodeMap } from './composables/useNodeMap';
import { useNodeMetrics } from './composables/useNodeMetrics';
import { useCharts } from './composables/useCharts';

const route = useRoute();
const node = route.query.node;

const { apiResponse, whetherTheNodeExists, apiError, fetchNodeData } = useNodeData(node);

const nodeDetails = computed(() => apiResponse.value?.data.node_details);
const statusList = computed(() => apiResponse.value?.data.status_list);

const { latestStatus, sortedStatusList, updateLatestStatus } = useNodeStatus(statusList);

const { loadingNodeMap, markers, fetchLocalAddr } = useNodeMap();

const { storageUsedPercentage, memoryUsedPercentage, uptimeDays } = useNodeMetrics(
    nodeDetails,
    latestStatus
);

useCharts(sortedStatusList, latestStatus);

watch(
    [apiResponse, statusList],
    () => {
        if (statusList.value) {
            updateLatestStatus();
        }
        if (nodeDetails.value) {
            fetchLocalAddr(nodeDetails.value);
        }
    },
    { immediate: true }
);

onMounted(() => {
    fetchNodeData();
});
</script>

<style scoped>
.n-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
