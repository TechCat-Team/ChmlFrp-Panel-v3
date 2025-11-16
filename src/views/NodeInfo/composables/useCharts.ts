import { onMounted, onUnmounted, watch, type Ref, type ComputedRef } from 'vue';
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
import { useThemeVars } from 'naive-ui';
import type { Status } from '../types';
import { CHART_IDS } from '../constants';
import type { EChartsOption } from 'echarts';

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

export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour12: false });
}

const bytesToGB = (bytes: number): number => {
    return bytes / 1024 ** 3;
};

export function useCharts(
    sortedStatusList: Ref<Status[]> | ComputedRef<Status[]>,
    latestStatus: Ref<Status | null> | ComputedRef<Status | null>
) {
    const themeVars = useThemeVars();
    const chartInstances: Record<string, echarts.ECharts | null> = {};

    const initCharts = () => {
        CHART_IDS.forEach((id) => {
            if (chartInstances[id]) {
                chartInstances[id]?.dispose();
                chartInstances[id] = null;
            }
            const dom = document.getElementById(id);
            if (dom) {
                chartInstances[id] = echarts.init(dom);
            }
        });
    };

    const updateCharts = () => {
        const statusList = sortedStatusList.value;
        const latest = latestStatus.value;
        if (statusList.length === 0) return;

        const tunnelTypeData = latest
            ? {
                  TCP: latest.proxy_tcp,
                  UDP: latest.proxy_udp,
                  HTTP: latest.proxy_http,
                  HTTPS: latest.proxy_https,
              }
            : { TCP: 0, UDP: 0, HTTP: 0, HTTPS: 0 };

        const cpuData = statusList.map((status) => [
            formatTimestamp(status.timestamp),
            status.cpu_usage.toFixed(2),
        ]);
        const CPUDateList = cpuData.map((item) => item[0]);
        const cpuValueList = cpuData.map((item) => item[1]);

        const networkDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const uploadValueList = statusList.map((status) => status.upload_bandwidth_usage_percent);
        const downloadValueList = statusList.map((status) => status.download_bandwidth_usage_percent);

        const memoryDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const memoryValueList = statusList.map((status) => bytesToGB(status.memory_used).toFixed(2));

        const proxyDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const proxyTcpValueList = statusList.map((status) => status.proxy_tcp);
        const proxyUdpValueList = statusList.map((status) => status.proxy_udp);
        const proxyHttpValueList = statusList.map((status) => status.proxy_http);
        const proxyHttpsValueList = statusList.map((status) => status.proxy_https);

        const clientCountsDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const clientCountsValueList = statusList.map((status) => status.client_counts);

        const curCountsDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const curCountsValueList = statusList.map((status) => status.cur_conns);

        const packetsDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const sentPacketsValueList = statusList.map((status) => status.sent_packets);
        const recvPacketsValueList = statusList.map((status) => status.recv_packets);

        const connDateList = statusList.map((status) => formatTimestamp(status.timestamp));
        const activeConnValueList = statusList.map((status) => status.active_conn);
        const passiveConnValueList = statusList.map((status) => status.passive_conn);

        const frpOption: EChartsOption = {
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

        const cpuOption: EChartsOption = {
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

        const networkOption: EChartsOption = {
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

        const memoryOption: EChartsOption = {
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

        const proxyOption: EChartsOption = {
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

        const curConnsOption: EChartsOption = {
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

        const clientCountsOption: EChartsOption = {
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

        const packetsOption: EChartsOption = {
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

        const connOption: EChartsOption = {
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

        chartTasks.forEach((task) => {
            requestAnimationFrame(() => {
                task();
            });
        });
    };

    const resizeCharts = () => {
        CHART_IDS.forEach((id) => {
            requestAnimationFrame(() => {
                chartInstances[id]?.resize();
            });
        });
    };

    const handleResize = () => {
        resizeCharts();
    };

    onMounted(() => {
        initCharts();
        updateCharts();
        window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        CHART_IDS.forEach((id) => {
            chartInstances[id]?.dispose();
            chartInstances[id] = null;
        });
    });

    watch(
        [() => sortedStatusList.value, () => latestStatus.value, themeVars],
        () => {
            updateCharts();
        },
        { deep: true }
    );

    return {
        updateCharts,
    };
}

