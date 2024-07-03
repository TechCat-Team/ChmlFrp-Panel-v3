<template>
    <n-layout style="height: 100vh">
        <n-layout-header bordered>
            <HeaderComponent />
        </n-layout-header>
        <n-layout-content content-style="padding: 24px;">
            <n-card>
                <ServiceUptime />
            </n-card>
            <n-grid :x-gap="12" :y-gap="12" cols="1 m:3" responsive="screen" style="margin-top: 24px">
                <n-grid-item>
                    <n-card style="min-height: 198px">
                        <n-space vertical>
                            <span>{{ cpuModel }}</span>
                            <n-progress :percentage="cpuUsage" status="info" />
                            <n-divider />
                            <n-grid cols="5" item-responsive responsive="screen">
                                <n-grid-item span="4">
                                    <n-descriptions :column="4">
                                        <n-descriptions-item label="核数">{{ cpuCores }}</n-descriptions-item>
                                        <n-descriptions-item label="空闲">{{ cpuUsage }}%</n-descriptions-item>
                                        <n-descriptions-item label="运行时间">{{ uptime }}</n-descriptions-item>
                                        <n-descriptions-item label="负荷">1,5,15m</n-descriptions-item>
                                    </n-descriptions>
                                </n-grid-item>
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 40px; height: 40px;" type="multiple-circle"
                                        :stroke-width="10" :circle-gap="1" :percentage="[
                percentage,
                (percentage + 4) % 100,
                (percentage + 10) % 100,
            ]" :color="[
                'var(--success-color)',
                'var(--success-color)',
                'var(--success-color)',
            ]" :rail-style="[
                { opacity: 0.6 },
                { opacity: 0.6 },
                { opacity: 0.6 },
            ]">
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
                                    <n-descriptions-item label="可用内存">{{ memoryTotal }} G</n-descriptions-item>
                                    <n-descriptions-item label="已用内存">{{ memoryAvailable }} G</n-descriptions-item>
                                    <n-descriptions-item label="页面缓存">{{ memoryUsage }} M</n-descriptions-item>
                                </n-descriptions>
                            </n-grid-item>
                            <n-grid-item span="1">
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 50px; height: 50px;" type="circle" :stroke-width="15"
                                        :circle-gap="1" :percentage="memoryAvailablePercentage" :rail-style="[
                { opacity: 0.6 },
            ]">
                                        <div style="text-align: center; font-size: 8px">
                                            {{ memoryAvailablePercentage }}%
                                        </div>
                                    </n-progress>
                                </n-grid-item>
                            </n-grid-item>
                        </n-grid>
                        <n-divider />
                        <n-grid cols="4" item-responsive responsive="screen">
                            <n-grid-item span="3">
                                <n-descriptions :column="4">
                                    <n-descriptions-item label="所有储存">4 TB</n-descriptions-item>
                                    <n-descriptions-item label="已用储存">215.2 GB</n-descriptions-item>
                                    <n-descriptions-item label="剩余储存">不知道 GB</n-descriptions-item>
                                </n-descriptions>
                            </n-grid-item>
                            <n-grid-item span="1">
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 50px; height: 50px;" type="circle" :stroke-width="15"
                                        :circle-gap="1" :percentage="12.4" :rail-style="[
                { opacity: 0.6 },
            ]">
                                        <div style="text-align: center; font-size: 8px">
                                            12.4 %
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
                            <n-grid-item span="3">
                                <n-descriptions :column="4">
                                    <n-descriptions-item label="上带宽">{{ uploadSpeed }}m</n-descriptions-item>
                                    <n-descriptions-item label="下带宽">{{ downloadSpeed }}m</n-descriptions-item>
                                    <n-descriptions-item label="上流量">21.5G</n-descriptions-item>
                                    <n-descriptions-item label="下流量">12.9G</n-descriptions-item>
                                </n-descriptions>
                            </n-grid-item>
                            <n-grid-item span="1">
                                <n-grid-item span="1"
                                    style="display: flex; justify-content: center; align-items: center;">
                                    <n-progress style="width: 50px; height: 50px;" type="circle" :stroke-width="15"
                                        :circle-gap="1" :percentage="memoryAvailablePercentage" :rail-style="[
                { opacity: 0.6 },
            ]">
                                        <div style="text-align: center; font-size: 8px">
                                            {{ memoryAvailablePercentage }}%
                                        </div>
                                    </n-progress>
                                </n-grid-item>
                            </n-grid-item>
                        </n-grid>
                        <n-divider />
                        <n-descriptions :column="4">
                            <n-descriptions-item label="重传率">0 %</n-descriptions-item>
                            <n-descriptions-item label="主动连接">12</n-descriptions-item>
                            <n-descriptions-item label="被动连接">42</n-descriptions-item>
                            <n-descriptions-item label="连接失败">0</n-descriptions-item>
                        </n-descriptions>
                    </n-card>
                </n-grid-item>
                <n-grid-item :span="2">
                    <n-card>
                        <MapComponent style="margin-top: 16px" :width="'100%'" :height="'500px'" :markers="markers" />
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card style="height: 556px">
                        <div id="frp-chart" style="width: 100%; height: 400px;"></div>
                        <n-descriptions label-placement="top">
                            <n-descriptions-item label="系统">
                                Windows Server 2077
                            </n-descriptions-item>
                            <n-descriptions-item label="FRP版本">
                                ChmlFrp-0.51.2
                            </n-descriptions-item>
                            <n-descriptions-item label="连接数">
                                115
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card>
                        <div id="network-chart" style="width: 100%; height: 400px;"></div>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card>
                        <div id="cpu-chart" style="width: 100%; height: 400px;"></div>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card>
                        <div id="memory-chart" style="width: 100%; height: 400px;"></div>
                    </n-card>
                </n-grid-item>
            </n-grid>
        </n-layout-content>
    </n-layout>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { useThemeVars } from 'naive-ui';

// 天地图
const markers = [
    { position: [104.87095, 28.65406], title: '我的位置' },
    { position: [116.407428, 39.91923], title: '节点位置' }
]

const themeVars = useThemeVars();
const updateCharts = () => {
    // 隧道类型饼图
    var frpChartDom = document.getElementById('frp-chart');
    var frpChart = echarts.init(frpChartDom);
    var frpOption;

    // CPU图表
    var cpuChartDom = document.getElementById('cpu-chart');
    var cpuChart = echarts.init(cpuChartDom);
    var cpuOption;

    // 网络图表
    var networkChartDom = document.getElementById('network-chart');
    var networkChart = echarts.init(networkChartDom);
    var networkOption;

    // 内存图表
    var memoryChartDom = document.getElementById('memory-chart');
    var memoryChart = echarts.init(memoryChartDom);
    var memoryOption;

    // 模拟CPU占用数据
    const cpuData = [
        ["18:08:20", 111], ["18:08:40", 64], ["18:09:00", 69], ["18:09:20", 88], ["18:09:40", 77],
        ["18:10:00", 83], ["18:10:20", 42], ["18:10:40", 57], ["18:11:00", 55], ["18:11:20", 60],
        ["18:11:40", 116], ["18:12:00", 129], ["18:12:20", 135], ["18:12:40", 86], ["18:13:00", 73],
        ["18:13:20", 85], ["18:13:40", 73], ["18:14:00", 68], ["18:14:20", 92], ["18:14:40", 130],
        ["18:15:00", 245], ["18:15:20", 139], ["18:15:40", 115], ["18:16:00", 111], ["18:16:20", 309],
        ["18:16:40", 206], ["18:17:00", 137], ["18:17:20", 128], ["18:17:40", 85], ["18:18:00", 94],
        ["18:18:20", 71], ["18:18:40", 106], ["18:19:00", 84], ["18:19:20", 93], ["18:19:40", 85],
        ["18:20:00", 73], ["18:20:20", 83], ["18:20:40", 125], ["18:21:00", 107], ["18:21:20", 82],
        ["18:21:40", 44], ["18:22:00", 72], ["18:22:20", 106], ["18:22:40", 107], ["18:23:00", 66],
        ["18:23:20", 91], ["18:23:40", 92], ["18:24:00", 113], ["18:24:20", 107], ["18:24:40", 131]
    ];

    // 数据加倍
    const doubledCpuData = cpuData.concat(cpuData);

    const CPUDateList = doubledCpuData.map(function (item) {
        return item[0];
    });
    const cpuValueList = doubledCpuData.map(function (item) {
        return item[1];
    });

    // 模拟网络数据
    const networkData = [
        ["18:08:20", 60, 100], ["18:08:40", 65, 110], ["18:09:00", 70, 120], ["18:09:20", 75, 130], ["18:09:40", 80, 140],
        ["18:10:00", 85, 150], ["18:10:20", 90, 160], ["18:10:40", 95, 170], ["18:11:00", 100, 180], ["18:11:20", 105, 190],
        ["18:11:40", 110, 200], ["18:12:00", 115, 210], ["18:12:20", 120, 220], ["18:12:40", 125, 230], ["18:13:00", 130, 240],
        ["18:13:20", 135, 250], ["18:13:40", 140, 260], ["18:14:00", 145, 270], ["18:14:20", 150, 280], ["18:14:40", 155, 290],
        ["18:15:00", 160, 300], ["18:15:20", 165, 310], ["18:15:40", 170, 320], ["18:16:00", 175, 330], ["18:16:20", 180, 340],
        ["18:16:40", 185, 350], ["18:17:00", 190, 360], ["18:17:20", 195, 370], ["18:17:40", 200, 380], ["18:18:00", 205, 390],
        ["18:18:20", 210, 400], ["18:18:40", 215, 410], ["18:19:00", 220, 420], ["18:19:20", 225, 430], ["18:19:40", 230, 440],
        ["18:20:00", 235, 450], ["18:20:20", 240, 460], ["18:20:40", 245, 470], ["18:21:00", 250, 480], ["18:21:20", 255, 490],
        ["18:21:40", 260, 500], ["18:22:00", 265, 510], ["18:22:20", 270, 520], ["18:22:40", 275, 530], ["18:23:00", 280, 540],
        ["18:23:20", 285, 550], ["18:23:40", 290, 560], ["18:24:00", 295, 570], ["18:24:20", 300, 580], ["18:24:40", 305, 590]
    ];

    const doubledNetworkData = networkData.concat(networkData);

    const networkDateList = doubledNetworkData.map(function (item) {
        return item[0];
    });
    const uploadValueList = doubledNetworkData.map(function (item) {
        return item[1];
    });
    const downloadValueList = doubledNetworkData.map(function (item) {
        return item[2];
    });

    // 模拟内存占用数据
    const memoryData = [
        ["18:08:20", 60], ["18:08:40", 65], ["18:09:00", 70], ["18:09:20", 75], ["18:09:40", 80],
        ["18:10:00", 85], ["18:10:20", 90], ["18:10:40", 95], ["18:11:00", 100], ["18:11:20", 105],
        ["18:11:40", 110], ["18:12:00", 115], ["18:12:20", 120], ["18:12:40", 125], ["18:13:00", 130],
        ["18:13:20", 135], ["18:13:40", 140], ["18:14:00", 145], ["18:14:20", 150], ["18:14:40", 155],
        ["18:15:00", 160], ["18:15:20", 165], ["18:15:40", 170], ["18:16:00", 175], ["18:16:20", 180],
        ["18:16:40", 185], ["18:17:00", 190], ["18:17:20", 195], ["18:17:40", 200], ["18:18:00", 205],
        ["18:18:20", 210], ["18:18:40", 215], ["18:19:00", 220], ["18:19:20", 225], ["18:19:40", 230],
        ["18:20:00", 235], ["18:20:20", 240], ["18:20:40", 245], ["18:21:00", 250], ["18:21:20", 255],
        ["18:21:40", 260], ["18:22:00", 265], ["18:22:20", 270], ["18:22:40", 275], ["18:23:00", 280],
        ["18:23:20", 285], ["18:23:40", 290], ["18:24:00", 295], ["18:24:20", 300], ["18:24:40", 305]
    ];

    // 数据加倍
    const doubledMemoryData = memoryData.concat(memoryData);

    const memoryDateList = doubledMemoryData.map(function (item) {
        return item[0];
    });
    const memoryValueList = doubledMemoryData.map(function (item) {
        return item[1];
    });

    frpOption = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: '隧道类型(条)',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 1048, name: 'TCP' },
                    { value: 735, name: 'UDP' },
                    { value: 580, name: 'HTTP' },
                    { value: 484, name: 'HTTPS' },
                ]
            }
        ]
    };

    cpuOption = {
        visualMap: {
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 400
        },
        title: {
            left: 'center',
            text: 'CPU占用',
            textStyle: {
                color: themeVars.value.textColorBase
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            data: CPUDateList,
            axisLabel: {
                color: themeVars.value.textColorBase
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} %',
                color: themeVars.value.textColorBase
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: cpuValueList,
                areaStyle: {}
            }
        ]
    };

    networkOption = {
        title: {
            text: '网络流量',
            textStyle: {
                color: themeVars.value.textColorBase
            }
        },
        legend: {
            textStyle: {
                color: themeVars.value.textColorBase
            },
            data: ['上传流量', '下载流量']
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            data: networkDateList,
            axisLabel: {
                color: themeVars.value.textColorBase
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} KB/s',
                color: themeVars.value.textColorBase
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: '上传流量',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: uploadValueList,
                stack: '流量',
                areaStyle: {},
                emphasis: {
                    focus: 'series'
                },
            },
            {
                name: '下载流量',
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: downloadValueList,
                stack: '流量',
                areaStyle: {},
                emphasis: {
                    focus: 'series'
                },
            }
        ]
    };

    memoryOption = {
        visualMap: {
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 400
        },
        title: {
            left: 'center',
            text: '内存占用',
            textStyle: {
                color: themeVars.value.textColorBase
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            data: memoryDateList,
            axisLabel: {
                color: themeVars.value.textColorBase
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} MB',
                color: themeVars.value.textColorBase
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: memoryValueList,
                areaStyle: {
                    color: 'rgba(173, 216, 230, 0.5)' // 淡蓝色，透明度50%
                },
                lineStyle: {
                    color: 'rgba(173, 216, 230, 1)' // 淡蓝色
                }
            }
        ]
    };

    frpOption && frpChart.setOption(frpOption);
    cpuOption && cpuChart.setOption(cpuOption);
    networkOption && networkChart.setOption(networkOption);
    memoryOption && memoryChart.setOption(memoryOption);
}

onMounted(() => {
    updateCharts();
});

watch(themeVars, () => {
    updateCharts();
}, { deep: true });

const percentage = ref(3)

const cpuModel = ref('Intel(R) Epyc(R) CPU i9 7950KF');
const cpuCores = ref(8);
const cpuUsage = ref(45);

const memoryTotal = ref(32); //总内存
const memoryUsage = ref(15.2); //已用内存
const memoryAvailable = ref(memoryTotal.value - memoryUsage.value) //可用内存
const memoryAvailablePercentage = ref((memoryUsage.value / memoryTotal.value) * 100);

const uptime = ref('321天');

const uploadSpeed = ref(73.5);
const downloadSpeed = ref(26.4);
</script>

<style scoped>
.n-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>