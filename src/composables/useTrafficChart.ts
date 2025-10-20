import { ref, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

export function useTrafficChart() {
    const chartRef = ref<HTMLElement | null>(null);
    let chartInstance: echarts.ECharts | null = null;

    /**
     * 初始化图表
     */
    const initChart = (trafficIn: number[], trafficOut: number[]) => {
        if (!chartRef.value) return;

        // 销毁旧图表实例
        if (chartInstance) {
            chartInstance.dispose();
        }

        // 创建新图表实例
        chartInstance = echarts.init(chartRef.value);

        // 生成日期标签
        const dates = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }

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
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45,
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

        // 响应式调整
        const resizeHandler = () => {
            chartInstance && chartInstance.resize();
        };
        window.addEventListener('resize', resizeHandler);
    };

    /**
     * 销毁图表
     */
    const destroyChart = () => {
        if (chartInstance) {
            chartInstance.dispose();
            chartInstance = null;
        }
    };

    /**
     * 调整图表大小
     */
    const resizeChart = () => {
        if (chartInstance) {
            chartInstance.resize();
        }
    };

    return {
        chartRef,
        initChart,
        destroyChart,
        resizeChart,
    };
}

