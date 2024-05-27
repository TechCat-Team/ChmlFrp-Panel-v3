<template>
    <n-flex vertical>
        <n-card style="border-radius: 10px;">
            <n-space justify="space-between">
                <div style="display: flex; align-items: center;">
                    <n-avatar :size="72" round :style="{ display: isHidden ? 'none' : 'flex' }"
                        src="https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg" />
                    <div :style="textStyle">
                        <h3 style="margin: 0;">早上好，chaoji，今天又是充满活力的一天!</h3>
                        <p style="margin: 0; margin-top: 4px;">{{ apiText }}</p>
                    </div>
                </div>
                <n-space justify="end" style="margin-top: 15px;">
                    <n-button type="primary" strong secondary>签到</n-button>
                    <n-button strong secondary>签到信息</n-button>
                </n-space>
            </n-space>
        </n-card>
        <n-grid style="margin-top: 15px" cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card style="border-radius: 10px;">
                    <div id="main" style="width: 100%; height: 400px;"></div>
                </n-card>
            </n-gi>
            <n-gi :span="2">
                <n-card title="常见问题" style="border-radius: 10px;">
                    <n-alert title="提示" type="info">
                        如果这里没有您想了解的，可以前往<n-button text tag="a" href="https://docs.chcat.cn" target="_blank"
                            type="primary">
                            TechCat Docs
                        </n-button>或TechCatQQ交流群询问。
                    </n-alert>
                    <n-flex style="margin-top: 20px">
                        <n-button tertiary type="primary">
                            QQ交流群一群
                        </n-button>
                        <n-button tertiary type="primary">
                            QQ交流群二群
                        </n-button>
                    </n-flex>
                    <n-collapse style="margin-top: 20px;">
                        <n-collapse-item title="注意事项" name="1">
                            <div>使用chmlfrp映射远程桌面、数据库等，映射后会暴露在公网环境。您应该注意您的数据安全，设置安全的密码。因此类问题造成的锁机·重要文件被盗，我们概不负责。</div>
                        </n-collapse-item>
                        <n-collapse-item title="关于实名" name="2">
                            <div>实名认证接口对接阿里云二要素接口。允许未成年认证，但是请不要使用非本人身份证。
                                如果实名认证接口出现实名认证失败等问题请加入交流群联系群主。或发送邮件至chaoji@chcat.cn</div>
                        </n-collapse-item>
                        <n-collapse-item title="延迟问题" name="3">
                            <div>节点请选择离你(开服者)最近的节点。您可以根据节点状态页中的节点负载选择负载较低的节点，这能够优化您的体验。
                                服务器卡顿不一定为映射的原因。这里使用mc服务器举例，您可以通过查看服务器TPS或MSPT查看是否为服务器硬件负载过高。若MSPT或TPS在正常范围内，但服务器延迟依旧很高，您可以考虑购买会员获得更高的带宽。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="信息安全" name="4">
                            <div>我们会保存用户的实名信息及用户数据，但是留存的用户数据全部采用业内标准的加密格式
                                实名信息采用AES 256 CBC加密。密码信息通过MD5加密
                                我们承诺不会泄露用户的任何信息，也不会拿用户的信息开玩笑。API数据传递通过SSL加密，API也经过了一层混淆加密。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="禁止内容" name="5">
                            <div>不能使用映射搭建关于赌博, 黄色, 血腥, 暴力, 爆破, 发包, 代刷网, 发卡网等违反中国法律的站点或服务
                                一旦发现，我们有权强行停止您的映射服务。并且上报给公安机关。</div>
                        </n-collapse-item>
                        <n-collapse-item title="友链申请" name="6">
                            <div>我们目前允许添加友链，不过友情链接需要是不违反国家法律的网站。非盈利性网站可直接申请添加。盈利性网站需要附带网站备案号以及营业执照副本图片。
                                友链的期限不固定，如发现违规，我们有权直接删除友链。并且友链的期限不是永久，我们有权不通知你直接删除。
                                友链申请详情规则请前往：https://docs.chcat.cn/docs/chmlfrp/yl</div>
                        </n-collapse-item>
                    </n-collapse>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch, ref } from 'vue';
import { useScreenStore } from '@/stores/useScreen';
import { useThemeVars } from 'naive-ui';
import { storeToRefs } from 'pinia';
import * as echarts from 'echarts';
import axios from 'axios';

const screenStore = useScreenStore();
const { isHidden, screenWidth } = storeToRefs(screenStore);

const textStyle = computed(() => ({
    marginLeft: screenWidth.value >= 600 ? '16px' : '0',
    textAlign: 'left' as const
}));

// 一言
const apiText = ref('');
onMounted(async () => {
    try {
        const response = await axios.get('https://v1.hitokoto.cn');
        apiText.value = response.data.hitokoto;
    } catch (error) {
        console.error('API调用失败：', error);
    }
});

const themeVars = useThemeVars();

const updateChart = () => {
    const chartDom = document.getElementById('main');
    if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option: echarts.EChartsOption = {
            title: {
                text: '流量统计',
                textStyle: {
                    color: themeVars.value.textColorBase
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                textStyle: {
                    color: themeVars.value.textColorBase
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLabel: {
                    color: themeVars.value.textColorBase
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} MiB',
                    color: themeVars.value.textColorBase
                }
            },
            series: [
                {
                    name: '上传',
                    type: 'line',
                    data: [0, 11, 19, 0, 21, 12, 9],
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        width: 0
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgb(128, 255, 165)'
                            },
                            {
                                offset: 1,
                                color: 'rgb(1, 191, 236)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                },
                {
                    name: '下载',
                    type: 'line',
                    data: [0, 14, 19, 2, 21, 12, 9],
                    stack: 'Total',
                    smooth: true,
                    lineStyle: {
                        width: 0
                    },
                    showSymbol: false,
                    areaStyle: {
                        opacity: 0.8,
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgb(0, 221, 255)'
                            },
                            {
                                offset: 1,
                                color: 'rgb(77, 119, 255)'
                            }
                        ])
                    },
                    emphasis: {
                        focus: 'series'
                    },
                }
            ]
        };
        myChart.setOption(option);
    } else {
        console.error('Element with id "main" not found.');
    }
};

onMounted(() => {
    updateChart();
});

watch(themeVars, () => {
    updateChart();
}, { deep: true });
</script>