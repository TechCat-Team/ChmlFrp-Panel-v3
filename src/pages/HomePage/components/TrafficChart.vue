<template>
    <n-card>
        <div v-if="loading">
            <n-skeleton text style="width: 40%" />
            <n-skeleton text :repeat="16" />
            <n-skeleton text style="width: 60%" />
        </div>
        <div v-else ref="chartContainer" style="width: 100%; height: 400px"></div>
    </n-card>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useThemeVars } from 'naive-ui';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, TitleComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useStyleStore } from '@/stores/style';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { BYTES_TO_MB } from '../constants';
import type { ApiData, ApiDataItem } from '../types';

echarts.use([LineChart, TooltipComponent, LegendComponent, TitleComponent, GridComponent, CanvasRenderer]);

const userStore = useUserStore();
const userInfo = userStore.userInfo;
const themeVars = useThemeVars();
const styleStore = useStyleStore();
const chartContainer = ref<HTMLDivElement | null>(null);
const loading = ref(true);

let myChart: echarts.ECharts | null = null;
let unwatchTheme: (() => void) | null = null;
let resizeHandler: (() => void) | null = null;
let chartData: ApiData | null = null;

const getChartOption = (apiData: ApiData, reverse: boolean) => {
    const times = apiData.data.map((item) => item.time);
    const trafficInMB = apiData.data.map((item) => (Number(item.traffic_in) / BYTES_TO_MB).toFixed(2));
    const trafficOutMB = apiData.data.map((item) => (Number(item.traffic_out) / BYTES_TO_MB).toFixed(2));

    const textColor = reverse
        ? themeVars.value.textColorBase === '#000'
            ? '#fff'
            : '#000'
        : themeVars.value.textColorBase;

    return {
        title: {
            text: '流量统计',
            textStyle: {
                color: textColor,
            },
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            textStyle: {
                color: textColor,
            },
        },
        grid: {
            left: '2%',
            bottom: '2%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: times,
            axisLabel: {
                color: textColor,
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} MB',
                color: textColor,
            },
        },
        series: [
            {
                name: '上传',
                type: 'line',
                data: trafficOutMB,
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0,
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(0, 221, 255)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(77, 119, 255)',
                        },
                    ]),
                },
                emphasis: {
                    focus: 'series',
                },
            },
            {
                name: '下载',
                type: 'line',
                data: trafficInMB,
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0,
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(128, 255, 165)',
                        },
                        {
                            offset: 1,
                            color: 'rgb(1, 191, 236)',
                        },
                    ]),
                },
                emphasis: {
                    focus: 'series',
                },
            },
        ],
    };
};

const updateChart = (apiData: ApiData) => {
    if (!chartContainer.value) {
        console.error('[首页]找不到图表容器元素。');
        return;
    }

    if (myChart) {
        myChart.dispose();
    }

    myChart = echarts.init(chartContainer.value);
    let option = getChartOption(apiData, false);
    myChart.setOption(option);

    // 添加窗口大小变化监听器
    if (!resizeHandler) {
        resizeHandler = () => {
            myChart && myChart.resize();
        };
        window.addEventListener('resize', resizeHandler);
    }

    // 明暗切换时重新渲染图表
    if (!unwatchTheme) {
        unwatchTheme = watch(
            () => styleStore.getTheme(),
            () => {
                if (chartData) {
                    option = getChartOption(chartData, true);
                    myChart && myChart.setOption(option, true);
                }
            }
        );
    }
};

const fetchTrafficInfo = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`https://cf-v1.uapis.cn/api/flow_zong.php?usertoken=${userInfo?.usertoken}`);
        const apiData = response.data;

        if (apiData.status === 'success') {
            // 对 data 按日期排序
            apiData.data.sort((a: ApiDataItem, b: ApiDataItem) => {
                const year = new Date().getFullYear();
                const dateA = new Date(`${year}-${a.time}`);
                const dateB = new Date(`${year}-${b.time}`);
                return dateA.getTime() - dateB.getTime();
            });

            chartData = apiData;
            loading.value = false;
            await nextTick();
            updateChart(apiData);
        } else {
            console.error('流量统计API返回状态不成功:', apiData);
            loading.value = false;
        }
    } catch (error) {
        console.error('流量统计API调用错误:', error);
        loading.value = false;
    }
};

const cleanup = () => {
    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }
    if (unwatchTheme) {
        unwatchTheme();
        unwatchTheme = null;
    }
    if (myChart) {
        myChart.dispose();
        myChart = null;
    }
};

// 当 loading 变为 false 时，初始化图表
watch(
    () => loading.value,
    async (newLoading) => {
        if (!newLoading && chartData && chartContainer.value) {
            await nextTick();
            updateChart(chartData);
        }
    }
);

onMounted(() => {
    fetchTrafficInfo();
});

onUnmounted(() => {
    cleanup();
});
</script>

