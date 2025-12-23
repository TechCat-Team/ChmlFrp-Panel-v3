import { ref, onUnmounted, nextTick } from 'vue';
import { useMessage } from 'naive-ui';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import api from '@/api';
import { useStyleStore } from '@/stores/style';

echarts.use([BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

/**
 * 隧道流量图表 composable
 */
export function useTunnelChart(userInfo: { usertoken?: string }, getChartRef: () => HTMLElement | null) {
    const message = useMessage();
    const styleStore = useStyleStore();
    const showModal = ref(false);
    const loading = ref(false);
    let chartInstance: echarts.ECharts | null = null;

    const getTunnelLast7days = async (tunnelId: number, state: string) => {
        if (state === 'false') {
            message.warning('隧道不在线，无法获取数据');
            return;
        }

        loading.value = true;
        showModal.value = true;

        try {
            const response = await api.v2.tunnel.getTunnelLast7days(userInfo?.usertoken || '', tunnelId);
            const { traffic_in, traffic_out } = response.data;

            if (traffic_in && traffic_out && traffic_in.length > 0) {
                const trafficIn = traffic_in.map((item: number) => Number(item) || 0);
                const trafficOut = traffic_out.map((item: number) => Number(item) || 0);

                await nextTick();
                initChart(trafficIn, trafficOut);
            } else {
                message.warning('暂无流量数据');
            }
        } catch (error) {
            console.error('获取近七日流量数据失败:', error);
            message.error('获取近七日流量数据失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    const initChart = (trafficIn: number[], trafficOut: number[]) => {
        const chartRef = getChartRef();
        if (!chartRef) {
            console.error('[隧道列表]找不到图表容器元素');
            return;
        }

        if (chartInstance) {
            chartInstance.dispose();
        }

        chartInstance = echarts.init(chartRef);
        const textColor = styleStore.getTheme() === 'dark' ? '#fff' : '#000';

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: (params: any) => {
                    let result = `${params[0].axisValue}<br>`;
                    params.forEach((item: any) => {
                        result += `${item.seriesName}: ${(item.value / (1024 * 1024)).toFixed(2)} MB<br>`;
                    });
                    return result;
                },
            },
            legend: {
                data: ['下载流量 (入)', '上传流量 (出)'],
                right: 10,
                top: 10,
                textStyle: {
                    color: textColor,
                },
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: (() => {
                    const dates = [];
                    const now = new Date();
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date(now);
                        date.setDate(now.getDate() - i);
                        dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
                    }
                    return dates;
                })(),
                axisLabel: {
                    rotate: 45,
                    color: textColor,
                },
            },
            yAxis: {
                type: 'value',
                name: '流量 (MB)',
                axisLine: {
                    show: true,
                },
                axisLabel: {
                    formatter: (value: number) => (value / 1024 / 1024).toFixed(0),
                    color: textColor,
                },
            },
            series: [
                {
                    name: '下载流量 (入)',
                    type: 'bar',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: '#5d8ff0' },
                    data: trafficIn,
                },
                {
                    name: '上传流量 (出)',
                    type: 'bar',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: '#63e2b7' },
                    data: trafficOut,
                },
            ],
        };

        chartInstance.setOption(option);

        // 监听主题变化
        const unwatchTheme = styleStore.$subscribe(() => {
            if (chartInstance && getChartRef()) {
                const newTextColor = styleStore.getTheme() === 'dark' ? '#fff' : '#000';
                option.legend.textStyle.color = newTextColor;
                option.xAxis.axisLabel.color = newTextColor;
                option.yAxis.axisLabel.color = newTextColor;
                chartInstance.setOption(option, true);
            }
        });

        // 监听窗口大小变化
        const resizeHandler = () => {
            chartInstance && chartInstance.resize();
        };
        window.addEventListener('resize', resizeHandler);

        // 清理函数
        onUnmounted(() => {
            unwatchTheme();
            window.removeEventListener('resize', resizeHandler);
            if (chartInstance) {
                chartInstance.dispose();
                chartInstance = null;
            }
        });
    };

    return {
        showModal,
        loading,
        getTunnelLast7days,
    };
}
