<template>
    <n-layout style="height: 100vh">
        <n-layout-header bordered>
            <HeaderComponent />
        </n-layout-header>
        <n-layout-content content-style="padding: 24px;">
            <n-card v-if="!node">
                <n-result status="404" title="缺少参数" description="您尚未传递节点参数">
                    <template #footer>
                        <n-button tag="a" href="https://www.chmlfrp.cn" target="_blank">返回主页</n-button>
                    </template>
                </n-result>
            </n-card>
            <n-card v-else-if="whetherTheNodeExists">
                <n-result status="404" title="节点不存在" description="您选择的节点不存在">
                    <template #footer>
                        <n-button tag="a" href="https://www.chmlfrp.cn" target="_blank">返回主页</n-button>
                    </template>
                </n-result>
            </n-card>
            <n-card v-else-if="apiError">
                <n-result status="500" title="API错误" description="请联系管理员提交问题并等待修复">
                    <template #footer>
                        <n-button tag="a" href="https://www.chmlfrp.cn" target="_blank">返回主页</n-button>
                    </template>
                </n-result>
            </n-card>
            <div v-else>
                <n-grid :x-gap="12" :y-gap="12" cols="1 m:3" responsive="screen">
                    <n-grid-item>
                        <n-card style="min-height: 198px">
                            <n-space vertical>
                                <span>{{ apiResponse?.data.node_details.cpu_info }}</span>
                                <n-progress v-if="latestStatus" :percentage="latestStatus?.cpu_usage" status="info" />
                                <n-divider />
                                <n-grid cols="5" item-responsive responsive="screen">
                                    <n-grid-item span="4">
                                        <n-descriptions :column="4">
                                            <n-descriptions-item label="核数">
                                                <n-tooltip trigger="hover">
                                                    <template #trigger>
                                                        {{ apiResponse?.data.node_details.num_cores }}
                                                    </template>
                                                    CPU的核心数量
                                                </n-tooltip>
                                            </n-descriptions-item>
                                            <n-descriptions-item label="空闲">
                                                <n-tooltip trigger="hover">
                                                    <template #trigger>
                                                        {{
                                                            latestStatus
                                                                ? (100 - latestStatus.cpu_usage).toFixed(2)
                                                                : 'N/A'
                                                        }}%
                                                    </template>
                                                    CPU剩余占用百分比
                                                </n-tooltip>
                                            </n-descriptions-item>
                                            <n-descriptions-item label="运行时间"
                                                >{{
                                                    apiResponse?.data.node_details.uptime_seconds
                                                        ? Math.ceil(
                                                              apiResponse.data.node_details.uptime_seconds / 86400
                                                          )
                                                        : 'N/A'
                                                }}天
                                            </n-descriptions-item>
                                            <n-descriptions-item label="负荷">
                                                <n-tooltip trigger="hover">
                                                    <template #trigger>
                                                        {{ apiResponse?.data.node_details.load1 }},{{
                                                            apiResponse?.data.node_details.load5
                                                        }},{{ apiResponse?.data.node_details.load15 }}
                                                    </template>
                                                    近1分钟、5分钟、15分钟的负荷
                                                </n-tooltip>
                                            </n-descriptions-item>
                                        </n-descriptions>
                                    </n-grid-item>
                                    <n-grid-item
                                        span="1"
                                        style="display: flex; justify-content: center; align-items: center"
                                    >
                                        <n-progress
                                            style="width: 40px; height: 40px"
                                            type="multiple-circle"
                                            :stroke-width="10"
                                            :circle-gap="1"
                                            :percentage="[percentage, (percentage + 4) % 100, (percentage + 10) % 100]"
                                            :color="[
                                                'var(--success-color)',
                                                'var(--success-color)',
                                                'var(--success-color)',
                                            ]"
                                            :rail-style="[{ opacity: 0.6 }, { opacity: 0.6 }, { opacity: 0.6 }]"
                                        >
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
                                        <n-descriptions-item label="可用内存"
                                            >{{ formatBytes(apiResponse?.data.node_details.memory_total).value }}
                                            {{
                                                formatBytes(apiResponse?.data.node_details.memory_total).suffix
                                            }}</n-descriptions-item
                                        >
                                        <n-descriptions-item v-if="latestStatus" label="已用内存"
                                            >{{ formatBytes(latestStatus?.memory_used).value }}
                                            {{ formatBytes(latestStatus?.memory_used).suffix }}</n-descriptions-item
                                        >
                                        <n-descriptions-item v-if="latestStatus" label="页面缓存"
                                            >{{ formatBytes(latestStatus?.page_tables).value }}
                                            {{ formatBytes(latestStatus?.page_tables).suffix }}</n-descriptions-item
                                        >
                                    </n-descriptions>
                                </n-grid-item>
                                <n-grid-item span="1">
                                    <n-grid-item
                                        span="1"
                                        style="display: flex; justify-content: center; align-items: center"
                                    >
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
                                        <n-descriptions-item label="所有储存"
                                            >{{ formatBytes(apiResponse?.data.node_details.storage_total).value }}
                                            {{
                                                formatBytes(apiResponse?.data.node_details.storage_total).suffix
                                            }}</n-descriptions-item
                                        >
                                        <n-descriptions-item label="已用储存"
                                            >{{ formatBytes(apiResponse?.data.node_details.storage_used).value }}
                                            {{
                                                formatBytes(apiResponse?.data.node_details.storage_used).suffix
                                            }}</n-descriptions-item
                                        >
                                        <n-descriptions-item label="剩余储存">
                                            {{
                                                formatBytes(
                                                    (apiResponse?.data.node_details.storage_total || 0) -
                                                        (apiResponse?.data.node_details.storage_used || 0)
                                                ).value
                                            }}
                                            {{
                                                formatBytes(
                                                    (apiResponse?.data.node_details.storage_total || 0) -
                                                        (apiResponse?.data.node_details.storage_used || 0)
                                                ).suffix
                                            }}
                                        </n-descriptions-item>
                                    </n-descriptions>
                                </n-grid-item>
                                <n-grid-item span="1">
                                    <n-grid-item
                                        span="1"
                                        style="display: flex; justify-content: center; align-items: center"
                                    >
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
                    </n-grid-item>
                    <n-grid-item>
                        <n-card style="min-height: 198px">
                            <n-grid cols="4" item-responsive responsive="screen">
                                <n-grid-item span="4">
                                    <n-descriptions :column="4">
                                        <n-descriptions-item label="上传带宽">
                                            <n-tooltip trigger="hover">
                                                <template #trigger>
                                                    {{ latestStatus?.upload_bandwidth_usage_percent }}%
                                                </template>
                                                最近一次数据统计的上传带宽占用百分比
                                            </n-tooltip>
                                        </n-descriptions-item>
                                        <n-descriptions-item label="下载带宽">
                                            <n-tooltip trigger="hover">
                                                <template #trigger>
                                                    {{ latestStatus?.download_bandwidth_usage_percent }}%
                                                </template>
                                                最近一次数据统计的下载带宽占用百分比
                                            </n-tooltip>
                                        </n-descriptions-item>
                                        <n-descriptions-item label="上传流量">
                                            <n-tooltip trigger="hover">
                                                <template #trigger>
                                                    {{
                                                        formatBytes(apiResponse?.data.node_details.total_traffic_out)
                                                            .value
                                                    }}
                                                    {{
                                                        formatBytes(apiResponse?.data.node_details.total_traffic_out)
                                                            .suffix
                                                    }}
                                                </template>
                                                今日上传总流量(有较大误差)
                                            </n-tooltip>
                                        </n-descriptions-item>
                                        <n-descriptions-item label="下载流量">
                                            <n-tooltip trigger="hover">
                                                <template #trigger>
                                                    {{
                                                        formatBytes(apiResponse?.data.node_details.total_traffic_in)
                                                            .value
                                                    }}
                                                    {{
                                                        formatBytes(apiResponse?.data.node_details.total_traffic_in)
                                                            .suffix
                                                    }}
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
                                    {{
                                        latestStatus ? (latestStatus.sent_packets / 100000000).toFixed(2) + '亿' : 'N/A'
                                    }}
                                </n-descriptions-item>
                                <n-descriptions-item label="接收数据">
                                    {{
                                        latestStatus ? (latestStatus.recv_packets / 100000000).toFixed(2) + '亿' : 'N/A'
                                    }}
                                </n-descriptions-item>

                                <n-descriptions-item label="被动连接">{{
                                    latestStatus?.passive_conn
                                }}</n-descriptions-item>
                                <n-descriptions-item label="活跃连接">{{
                                    latestStatus?.active_conn
                                }}</n-descriptions-item>
                            </n-descriptions>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item :span="2">
                        <n-card>
                            <n-skeleton
                                v-if="loadingNodeMap"
                                text
                                style="width: 100%; margin-top: 16px"
                                height="500px"
                            />
                            <MapComponent
                                v-else
                                style="margin-top: 16px"
                                :width="'100%'"
                                :height="'500px'"
                                :markers="markers"
                            />
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card style="height: 556px">
                            <div id="frp-chart" style="width: 100%; height: 400px"></div>
                            <n-descriptions label-placement="top">
                                <n-descriptions-item label="FRP版本">
                                    {{ apiResponse?.data.node_details.version }}
                                </n-descriptions-item>
                                <n-descriptions-item label="客户端数">
                                    {{ latestStatus?.client_counts }}
                                </n-descriptions-item>
                                <n-descriptions-item label="连接数">
                                    {{ latestStatus?.active_conn }}
                                </n-descriptions-item>
                            </n-descriptions>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="network-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="cpu-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="memory-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="proxy-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="cur-conns-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="client-counts-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="packets-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card>
                            <div id="conn-chart" style="width: 100%; height: 400px"></div>
                        </n-card>
                    </n-grid-item>
                </n-grid>
            </div>
        </n-layout-content>
    </n-layout>
</template>

<script setup lang="ts">
import axios from 'axios';

import * as echarts from 'echarts/core';
import { LineChart, PieChart } from 'echarts/charts';
import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
    VisualMapComponent,
    TitleComponent,
    DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([
    LineChart,
    PieChart,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    VisualMapComponent,
    TitleComponent,
    DataZoomComponent,
    CanvasRenderer,
]);
import { useThemeVars } from 'naive-ui';
import { useRoute } from 'vue-router';

const route = useRoute();
// 接收node参数
const node = route.query.node;

const loadingNodeMap = ref(true);
const whetherTheNodeExists = ref(false);
const apiError = ref(false);

// 流量单位换算
function formatBytes(bytes: string | number | undefined): { value: number; suffix: string } {
    let num: number;
    if (bytes === undefined) {
        return { value: 0, suffix: 'B' };
    }
    if (typeof bytes === 'string') {
        num = parseFloat(bytes);
    } else {
        num = bytes;
    }
    const units = ['B', 'K', 'M', 'G', 'T', 'P'];
    if (num === 0) return { value: 0, suffix: 'B' };
    let index = 0;
    while (num >= 1024 && index < units.length - 1) {
        num /= 1024;
        index++;
    }
    return { value: parseFloat(num.toFixed(2)), suffix: units[index] };
}

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour12: false });
}

interface NodeDetails {
    total_traffic_in: number;
    cpu_info: string;
    num_cores: number;
    coordinates: string;
    storage_total: number;
    load5: number;
    version: string;
    load1: number;
    total_traffic_out: number;
    uptime_seconds: number;
    memory_total: number;
    storage_used: number;
    load15: number;
}

interface Status {
    proxy_https: number;
    download_bandwidth_usage_percent: number;
    cur_conns: number;
    sent_packets: number;
    memory_used: number;
    active_conn: number;
    recv_packets: number;
    proxy_tcp: number;
    proxy_udp: number;
    proxy_http: number;
    upload_bandwidth_usage_percent: number;
    cpu_usage: number;
    page_tables: number;
    passive_conn: number;
    timestamp: string;
    client_counts: number;
}

interface ApiResponse {
    msg: string;
    code: number;
    data: {
        node_details: NodeDetails;
        status_list: Status[];
    };
}

const apiResponse = ref<ApiResponse | null>(null);
const markers = ref<{ position: number[]; title: string }[]>([
    { position: [102.22092, 31.90059], title: '我的位置' },
    { position: [116.407428, 39.91923], title: '节点位置' },
]);

const latestStatus = ref<Status | null>(null); // 初始化为 null

let sortedStatusList: Status[] = [];

import api from '@/api';

// 判断状态是否全为0，即无效统计点
const isAllZero = (status: Status) => {
    // 只判断关键字段，按需调整
    return (
        status.cpu_usage === 0 &&
        status.memory_used === 0 &&
        status.active_conn === 0 &&
        status.passive_conn === 0 &&
        status.cur_conns === 0 &&
        status.client_counts === 0 &&
        status.proxy_tcp === 0 &&
        status.proxy_udp === 0 &&
        status.proxy_http === 0 &&
        status.proxy_https === 0 &&
        status.upload_bandwidth_usage_percent === 0 &&
        status.download_bandwidth_usage_percent === 0 &&
        status.sent_packets === 0 &&
        status.recv_packets === 0
    );
};

// 对 status_list 进行平滑处理
const smoothStatusList = (list: Status[], maxZeroCount = 10): Status[] => {
    const result = list.slice();
    let i = 1;
    while (i < result.length - 1) {
        // 找连续全0的区间
        if (isAllZero(result[i])) {
            let start = i;
            let end = i;
            while (end < result.length - 1 && isAllZero(result[end])) {
                end++;
                // 最多maxZeroCount个
                if (end - start + 1 > maxZeroCount) break;
            }
            // 前后都有正常点且长度<=maxZeroCount
            if (start > 0 && end < result.length - 1 && !isAllZero(result[start - 1]) && !isAllZero(result[end])) {
                const prev = result[start - 1];
                const next = result[end];
                for (let j = start; j < end; j++) {
                    result[j] = {
                        ...result[j],
                        cpu_usage: (prev.cpu_usage + next.cpu_usage) / 2,
                        memory_used: (prev.memory_used + next.memory_used) / 2,
                        active_conn: Math.round((prev.active_conn + next.active_conn) / 2),
                        passive_conn: Math.round((prev.passive_conn + next.passive_conn) / 2),
                        cur_conns: Math.round((prev.cur_conns + next.cur_conns) / 2),
                        client_counts: Math.round((prev.client_counts + next.client_counts) / 2),
                        proxy_tcp: Math.round((prev.proxy_tcp + next.proxy_tcp) / 2),
                        proxy_udp: Math.round((prev.proxy_udp + next.proxy_udp) / 2),
                        proxy_http: Math.round((prev.proxy_http + next.proxy_http) / 2),
                        proxy_https: Math.round((prev.proxy_https + next.proxy_https) / 2),
                        upload_bandwidth_usage_percent:
                            (prev.upload_bandwidth_usage_percent + next.upload_bandwidth_usage_percent) / 2,
                        download_bandwidth_usage_percent:
                            (prev.download_bandwidth_usage_percent + next.download_bandwidth_usage_percent) / 2,
                        sent_packets: Math.round((prev.sent_packets + next.sent_packets) / 2),
                        recv_packets: Math.round((prev.recv_packets + next.recv_packets) / 2),
                    };
                }
                i = end; // 跳过已处理区间
            } else {
                i = end;
            }
        } else {
            i++;
        }
    }
    return result;
};

const fetchNodeData = async () => {
    try {
        const response = await api.v2.node.getNodeStatusInfo(node as string);
        if (response.code === 200) {
            apiResponse.value = response;

            // 排序状态列表并获取最新状态
            sortedStatusList =
                apiResponse.value?.data.status_list?.slice().sort((a, b) => {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                }) || [];

            // 平滑处理
            sortedStatusList = smoothStatusList(sortedStatusList);

            latestStatus.value = sortedStatusList[0] || null; // 直接获取最新状态

            await updateCharts();
        } else if (response.code === 404) {
            whetherTheNodeExists.value = true;
        } else {
            apiError.value = true;
        }
    } catch (error) {
        console.error('获取数据失败:', error);
    }
};

// 获取本地地址
const fetchLocalAddr = async () => {
    loadingNodeMap.value = true;
    try {
        const response = await axios.get('https://uapis.cn/api/myip.php', { timeout: 5000 });
        const { latitude, longitude } = response.data;
        markers.value[0] = { position: [longitude, latitude], title: '我的位置' };

        const nodeCoordinates = apiResponse.value?.data.node_details.coordinates.split(',').map(Number);
        if (nodeCoordinates?.length === 2 && !isNaN(nodeCoordinates[0]) && !isNaN(nodeCoordinates[1])) {
            markers.value[1] = { position: nodeCoordinates, title: '节点位置' };
        } else {
            console.error('节点位置无效');
        }
    } catch (error) {
        console.error('获取位置失败:', error);
    } finally {
        loadingNodeMap.value = false;
    }
};

const themeVars = useThemeVars();

const chartIds = [
    'frp-chart',
    'cpu-chart',
    'network-chart',
    'memory-chart',
    'proxy-chart',
    'cur-conns-chart',
    'client-counts-chart',
    'packets-chart',
    'conn-chart',
];
const chartInstances: Record<string, echarts.ECharts | null> = {};

const updateCharts = () => {
    // 先销毁已有实例，防止内存泄漏
    chartIds.forEach((id) => {
        if (chartInstances[id]) {
            chartInstances[id]?.dispose();
            chartInstances[id] = null;
        }
    });

    // 重新初始化
    chartIds.forEach((id) => {
        const dom = document.getElementById(id);
        if (dom) {
            chartInstances[id] = echarts.init(dom);
        }
    });

    const bytesToGB = (bytes: number): number => {
        return bytes / 1024 ** 3;
    };

    const latestStatus = sortedStatusList[0];

    // 如果 latestStatus 存在，则提取隧道类型数据
    const tunnelTypeData = latestStatus
        ? {
              TCP: latestStatus.proxy_tcp,
              UDP: latestStatus.proxy_udp,
              HTTP: latestStatus.proxy_http,
              HTTPS: latestStatus.proxy_https,
          }
        : { TCP: 0, UDP: 0, HTTP: 0, HTTPS: 0 };

    // 提取CPU占用数据
    const cpuData =
        sortedStatusList?.map((status) => {
            return [formatTimestamp(status.timestamp), status.cpu_usage.toFixed(2)];
        }) || [];

    const CPUDateList = cpuData.map((item) => item[0]);
    const cpuValueList = cpuData.map((item) => item[1]);

    // 提取网络数据
    const networkData = sortedStatusList || [];
    const networkDateList = networkData.map((status) => formatTimestamp(status.timestamp));
    const uploadValueList = networkData.map((status) => status.upload_bandwidth_usage_percent);
    const downloadValueList = networkData.map((status) => status.download_bandwidth_usage_percent);

    // 提取内存占用数据
    const memoryData = sortedStatusList || [];
    const memoryDateList = memoryData.map((status) => formatTimestamp(status.timestamp));
    const memoryValueList = memoryData.map((status) => bytesToGB(status.memory_used).toFixed(2));

    // 提取映射端口数据
    const proxyData = sortedStatusList || [];
    const proxyDateList = proxyData.map((status) => formatTimestamp(status.timestamp));
    const proxyTcpValueList = proxyData.map((status) => status.proxy_tcp);
    const proxyUdpValueList = proxyData.map((status) => status.proxy_udp);
    const proxyHttpValueList = proxyData.map((status) => status.proxy_http);
    const proxyHttpsValueList = proxyData.map((status) => status.proxy_https);

    // 提取映射客户端数量数据
    const clientCountsData = sortedStatusList || [];
    const clientCountsDateList = clientCountsData.map((status) => formatTimestamp(status.timestamp));
    const clientCountsValueList = clientCountsData.map((status) => status.client_counts);

    // 提取映射连接数量数据
    const curCountsData = sortedStatusList || [];
    const curCountsDateList = curCountsData.map((status) => formatTimestamp(status.timestamp));
    const curCountsValueList = curCountsData.map((status) => status.cur_conns);

    // 提取发送、接收数据包数量数据
    const packetsData = sortedStatusList || [];
    const packetsDateList = packetsData.map((status) => formatTimestamp(status.timestamp));
    const sentPacketsValueList = packetsData.map((status) => status.sent_packets);
    const recvPacketsValueList = packetsData.map((status) => status.recv_packets);

    // 提取活跃、被动连接数数量数据
    const connData = sortedStatusList || [];
    const connDateList = connData.map((status) => formatTimestamp(status.timestamp));
    const activeConnValueList = connData.map((status) => status.active_conn);
    const passiveConnValueList = connData.map((status) => status.passive_conn);

    let frpOption = {
        tooltip: {
            trigger: 'item',
        },
        legend: {
            top: '5%',
            left: 'center',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        series: [
            {
                name: '隧道类型(条)',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderWidth: 2,
                },
                label: {
                    show: false,
                    position: 'center',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold',
                        color: themeVars.value.textColorBase,
                    },
                },
                labelLine: {
                    show: false,
                },
                data: [
                    { value: tunnelTypeData.TCP, name: 'TCP' },
                    { value: tunnelTypeData.UDP, name: 'UDP' },
                    { value: tunnelTypeData.HTTP, name: 'HTTP' },
                    { value: tunnelTypeData.HTTPS, name: 'HTTPS' },
                ],
            },
        ],
    };

    let cpuOption = {
        visualMap: {
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
        },
        title: {
            left: 'center',
            text: 'CPU占用',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: CPUDateList,
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: cpuValueList,
                areaStyle: {},
            },
        ],
    };

    let networkOption = {
        title: {
            text: '网络占用',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        legend: {
            textStyle: {
                color: themeVars.value.textColorBase,
            },
            data: ['上传占用', '下载占用'],
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: networkDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}%',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                name: '上传占用',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: uploadValueList,
                stack: '%',
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: '下载占用',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: downloadValueList,
                stack: '%',
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };

    let memoryOption = {
        title: {
            left: 'center',
            text: '内存占用',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: memoryDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}G',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: memoryValueList,
                areaStyle: {
                    color: 'rgba(173, 216, 230, 0.5)',
                },
                lineStyle: {
                    color: 'rgba(173, 216, 230, 1)',
                },
            },
        ],
    };

    let proxyOption = {
        title: {
            text: '端口类型',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        legend: {
            textStyle: {
                color: themeVars.value.textColorBase,
            },
            data: ['TCP', 'UDP', 'HTTP', 'HTTPS'],
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: proxyDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                name: 'TCP',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: proxyTcpValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: 'UDP',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: proxyUdpValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: 'HTTP',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: proxyHttpValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: 'HTTPS',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: proxyHttpsValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };

    let curConnsOption = {
        title: {
            left: 'center',
            text: '连接数',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: curCountsDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: curCountsValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };

    let clientCountsOption = {
        title: {
            left: 'center',
            text: '用户数',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: clientCountsDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: clientCountsValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };

    let packetsOption = {
        title: {
            text: '数据包',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        legend: {
            textStyle: {
                color: themeVars.value.textColorBase,
            },
            data: ['发送', '接收'],
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: packetsDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                name: '发送',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: sentPacketsValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: '接收',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: recvPacketsValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };

    let connOption = {
        title: {
            text: '连接数',
            textStyle: {
                color: themeVars.value.textColorBase,
            },
        },
        legend: {
            textStyle: {
                color: themeVars.value.textColorBase,
            },
            data: ['活跃连接', '被动连接'],
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: connDateList,
            axisLabel: {
                color: themeVars.value.textColorBase,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value}',
                color: themeVars.value.textColorBase,
            },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
        ],
        series: [
            {
                name: '活跃连接',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: activeConnValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: '被动连接',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: passiveConnValueList,
                areaStyle: {},
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };

    // 并行绘制
    const chartTasks = [
        () => chartInstances['frp-chart']?.setOption(frpOption),
        () => chartInstances['cpu-chart']?.setOption(cpuOption),
        () => chartInstances['network-chart']?.setOption(networkOption),
        () => chartInstances['memory-chart']?.setOption(memoryOption),
        () => chartInstances['proxy-chart']?.setOption(proxyOption),
        () => chartInstances['cur-conns-chart']?.setOption(curConnsOption),
        () => chartInstances['client-counts-chart']?.setOption(clientCountsOption),
        () => chartInstances['packets-chart']?.setOption(packetsOption),
        () => chartInstances['conn-chart']?.setOption(connOption),
    ];

    // 利用 requestAnimationFrame 并行调度
    chartTasks.forEach((task) => {
        requestAnimationFrame(() => {
            task();
        });
    });
};

// 计算储存使用百分比
const storageUsedPercentage = computed(() => {
    const total = apiResponse.value?.data.node_details.storage_total || 0;
    const used = apiResponse.value?.data.node_details.storage_used || 0;
    return total > 0 ? (used / total) * 100 : 0; // 确保总量大于0时才计算百分比
});

// 计算内存使用百分比
const memoryUsedPercentage = computed(() => {
    const total = apiResponse.value?.data.node_details.memory_total || 0;
    const used = latestStatus.value?.memory_used || 0;
    return total > 0 ? (used / total) * 100 : 0; // 确保总量大于0时才计算百分比
});

onMounted(() => {
    fetchNodeData();
    fetchLocalAddr();
});

watch(
    themeVars,
    () => {
        updateCharts();
    },
    { deep: true }
);

window.addEventListener('resize', () => {
    chartIds.forEach((id) => {
        requestAnimationFrame(() => {
            chartInstances[id]?.resize();
        });
    });
});

const percentage = ref(3);
</script>

<style scoped>
.n-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
