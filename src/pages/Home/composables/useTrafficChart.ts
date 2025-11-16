import { ref, watch, onUnmounted, nextTick } from 'vue';
import { useThemeVars } from 'naive-ui';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, TitleComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useStyleStore } from '@/stores/style';
import axios from 'axios';
import { BYTES_TO_MB } from '../constants';
import type { ApiData, ApiDataItem } from '../types';

echarts.use([LineChart, TooltipComponent, LegendComponent, TitleComponent, GridComponent, CanvasRenderer]);

/**
 * 流量图表 composable
 */
export function useTrafficChart(userToken?: string) {
    const themeVars = useThemeVars();
    const styleStore = useStyleStore();
    const loading = ref(true);

    let myChart: echarts.ECharts | null = null;
    let unwatchTheme: (() => void) | null = null;
    let resizeHandler: (() => void) | null = null;

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
        const chartDom = document.getElementById('main');
        if (chartDom) {
            if (myChart) {
                myChart.dispose();
            }

            myChart = echarts.init(chartDom);
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
                        option = getChartOption(apiData, true);
                        myChart && myChart.setOption(option, true);
                    }
                );
            }
        } else {
            console.error('[首页]找不到id为"main"(流量统计面积折线图)的元素。');
        }
    };

    const fetchTrafficInfo = async () => {
        loading.value = true;
        try {
            const response = await axios.get(`https://cf-v1.uapis.cn/api/flow_zong.php?usertoken=${userToken}`);
            const apiData = response.data;

            if (apiData.status === 'success') {
                // 对 data 按日期排序
                apiData.data.sort((a: ApiDataItem, b: ApiDataItem) => {
                    const year = new Date().getFullYear();
                    const dateA = new Date(`${year}-${a.time}`);
                    const dateB = new Date(`${year}-${b.time}`);
                    return dateA.getTime() - dateB.getTime();
                });

                await nextTick();
                updateChart(apiData);
            } else {
                console.error('流量统计API返回状态不成功:', apiData);
            }
        } catch (error) {
            console.error('流量统计API调用错误:', error);
        } finally {
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

    onUnmounted(() => {
        cleanup();
    });

    return {
        loading,
        fetchTrafficInfo,
        cleanup,
    };
}

