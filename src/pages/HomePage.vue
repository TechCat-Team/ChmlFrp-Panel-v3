<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-card>
            <n-space justify="space-between">
                <div style="display: flex; align-items: center;">
                    <n-avatar :size="72" round :style="{ display: isHidden ? 'none' : 'flex' }"
                        src="https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg" />
                    <div :style="textStyle">
                        <h3 style="margin: 0;">{{ greeting }}</h3>
                        <n-skeleton v-if="loadingTest" width="100%" style="margin-top: 8px" :sharp="false" text />
                        <p v-else style="margin: 0; margin-top: 4px;">{{ aWordApiText }}</p>
                    </div>
                </div>
                <n-space justify="end" style="margin-top: 15px;">
                    <n-button type="primary" strong secondary>签到</n-button>
                    <n-popover trigger="hover">
                        <template #trigger>
                            <n-button strong secondary>签到信息</n-button>
                        </template>
                        <n-thing title="统计信息" content-style="margin-top: 10px;">
                            上次签到时间：2024-05-24<br>
                            累计签到积分：20842<br>
                            累计签到次数：121<br>
                            今日签到人数：2
                        </n-thing>
                    </n-popover>
                </n-space>
            </n-space>
        </n-card>
        <n-grid style="margin-top: 15px" cols="1 s:2 m:4" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi v-for="(card, index) in cards" :key="index">
                <n-card :style="cardStyle" :title="card.title" size="small">
                    <n-flex justify="space-between" align="center">
                        <n-icon size="32">
                            <component :is="card.icon" />
                        </n-icon>
                        <n-statistic tabular-nums>
                            <n-number-animation :from="0" :to="card.value" :precision="card.precision" />
                            <template v-if="card.suffix" #suffix>
                                {{ card.suffix }}
                            </template>
                        </n-statistic>
                    </n-flex>
                </n-card>
            </n-gi>
        </n-grid>
        <n-grid style="margin-top: 15px" cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card>
                    <div id="main" style="width: 100%; height: 400px;"></div>
                </n-card>
                <n-card style="margin-top: 15px">
                    <n-result status="success" title="ChmlFrp - Panel v3.0" description="总感觉怪怪的">
                    </n-result>
                </n-card>
            </n-gi>
            <n-gi :span="2">
                <n-card title="常见问题">
                    <n-alert title="您的账户已被封禁" type="error">
                        您的账号因为违规被封禁，具体原因请查看消息，如有异议可前往交流群申述。
                    </n-alert>
                    <n-alert title="您尚未实名" style="margin-top: 10px" type="warning" @click="goToUserPage">
                        不实名则无法使用ChmlFrp提供的服务，点击此提示可前往个人中心实名
                    </n-alert>
                    <n-alert title="提示" type="info" style="margin-top: 10px">
                        如果这里没有您想了解的，可以前往<n-button text tag="a" href="https://docs.chcat.cn" target="_blank"
                            type="primary">
                            TechCat Docs
                        </n-button>或TechCatQQ交流群询问。
                    </n-alert>
                    <n-flex style="margin-top: 20px">
                        <n-button style="border-radius: 5px" tertiary type="primary" tag="a"
                            href="https://qm.qq.com/q/ip5zGz1f9K" target="_blank">
                            QQ交流群一群
                        </n-button>
                        <n-button style="border-radius: 5px" tertiary type="primary" tag="a"
                            href="https://qm.qq.com/q/MJ0aeYCi8S" target="_blank">
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
                                实名信息采用AES 256 CBC加密。密码信息通过Bcrypt加密
                                我们承诺不会泄露用户的任何信息，也不会拿用户的信息开玩笑。
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
import api from '@/utils/apiClient';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { useThemeVars } from 'naive-ui';
import * as echarts from 'echarts';
import { LinkOutline, ServerOutline, ArrowUpCircleOutline, ArrowDownCircleOutline } from '@vicons/ionicons5';
// 根据主题自适应样式背景颜色
import { useStyleStore } from '@/stores/style';
import { useRouter } from 'vue-router';

const loadingTest = ref(true)

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());

const router = useRouter();
const goToUserPage = () => {
    router.push('/user')
}

const cards = [
    { title: '连接数', value: 214, icon: LinkOutline, precision: 0 },
    { title: '总上传', value: 12.43, icon: ArrowUpCircleOutline, precision: 2, suffix: 'TiB' },
    { title: '总下载', value: 31.79, icon: ArrowDownCircleOutline, precision: 2, suffix: 'TiB' },
    { title: '积分数', value: 241248, icon: ServerOutline, precision: 0 },
]

const screenStore = useScreenStore();
const { isHidden, screenWidth } = storeToRefs(screenStore);

const textStyle = computed(() => ({
    marginLeft: screenWidth.value >= 600 ? '16px' : '0',
    textAlign: 'left' as const
}));

// 根据时间设置欢迎文字
const currentTime = ref(new Date());

setInterval(() => {
    currentTime.value = new Date();
}, 1000);

const greeting = computed(() => {
    const hour = currentTime.value.getHours();
    if (hour >= 0 && hour < 6) {
        return "夜深了，chaoji，夜晚依然静谧，但新的希望已经开始萌芽。";
    }
    else if (hour >= 6 && hour < 11) {
        return "早上好，chaoji，今天又是充满活力的一天。";
    }
    else if (hour >= 11 && hour < 14) {
        return "中午好，chaoji，享受这温暖的阳光和美味的午餐吧。";
    }
    else if (hour >= 14 && hour < 15) {
        return "饮茶先啦，chaoji，做那么多都没用的，老板不会喜欢你的，喂喝一下茶先吧";
    }
    else if (hour >= 15 && hour < 17) {
        return "下午好，chaoji，午后的时光总是最适合专注与思考。";
    }
    else if (hour >= 17 && hour < 22) {
        return "晚上好，chaoji，夜幕降临，是时候享受片刻宁静了。";
    }
    else {
        return "少熬夜，chaoji，愿你有一个宁静而甜美的梦境。";
    }
});

// 一言
const aWordApiText = ref('');

const aWord = async () => {
    try {
        const responseUapi = await api.getDataFromUapi('/say?type=json');
        aWordApiText.value = responseUapi.data.message;
        loadingTest.value = false;
    } catch (error) {
        console.error('API调用失败：', error);
    }
};


onMounted(() => {
    aWord();
});

// ECharts
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
                    formatter: '{value} M',
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