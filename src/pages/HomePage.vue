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
                        <p v-else style="margin: 0; margin-top: 4px;">{{ apiText }}</p>
                    </div>
                </div>
                <n-space justify="end" style="margin-top: 15px;">
                    <n-button type="primary" strong secondary>签到</n-button>
                    <n-popover trigger="hover" style="border-radius: 8px;">
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
                    <n-result status="success" title="ChmlFrp - Panel v3.0" description="简约 大气 开源">
                        <n-descriptions label-placement="left" :column="screenWidth >= 600 ? 3 : 1">
                            <n-descriptions-item label="隧道数">
                                8420
                            </n-descriptions-item>
                            <n-descriptions-item label="用户数">
                                8354
                            </n-descriptions-item>
                            <n-descriptions-item label="节点数">
                                29
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-result>
                    <n-divider />
                    <n-space style="margin-top: 24px">
                        <n-button text tag="a" href="https://www.ixmu.net" target="_blank">
                            黑软小栈
                        </n-button>
                        <n-button text tag="a" href="https://cloud.fengidc.cn" target="_blank">
                            FENGIDC
                        </n-button>
                        <n-button text tag="a" href="https://www.axtn.net" target="_blank">
                            AxT
                        </n-button>
                        <n-button text tag="a" href="https://www.saivsi.com" target="_blank">
                            SAIVSI
                        </n-button>
                        <n-button text tag="a" href="https://dom.cloudery.cn" target="_blank">
                            云竹域名
                        </n-button>
                    </n-space>
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
                        如果这里没有您想了解的，可以前往
                        <n-button text tag="a" href="https://docs.chcat.cn" target="_blank"
                            type="primary">
                            TechCat Docs
                        </n-button>
                        或TechCatQQ交流群询问。
                    </n-alert>
                    <n-flex style="margin-top: 20px">
                        <n-button style="border-radius: 5px" tertiary type="primary"
                            @click="GoToQqGroup('https://qm.qq.com/q/ip5zGz1f9K')">
                            QQ交流群一群
                        </n-button>
                        <n-button style="border-radius: 5px" tertiary type="primary"
                            @click="GoToQqGroup('https://qm.qq.com/q/MJ0aeYCi8S')">
                            QQ交流群二群
                        </n-button>
                    </n-flex>
                    <n-collapse style="margin-top: 20px;">
                        <n-collapse-item title="数据安全" name="1">
                            <div>
                                <n-p>
                                    使用chmlfrp映射远程桌面、数据库等，映射后会暴露在公网环境。您应该注意您的数据安全，设置安全的密码。因此类问题造成的锁机·重要文件被盗，我们概不负责。
                                </n-p>
                                <n-p>
                                    除此之外，您需要注意不要泄露TOKEN，如果不小心泄露，请立刻重置TOKEN。
                                </n-p>
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="关于实名" name="2">
                            <div>
                                实名认证接口对接阿里云二要素接口。允许未成年认证，但是请不要使用非本人身份证。
                                <br />
                                如果实名认证接口出现实名认证失败等问题请加入交流群联系群主。或发送邮件至chaoji@chcat.cn
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="延迟问题" name="3">
                            <div>
                                节点请选择离你(开服者)最近的节点。您可以根据节点状态页中的节点负载选择负载较低的节点，这能够优化您的体验。
                                <br />
                                服务器卡顿不一定为映射的原因。这里使用mc服务器举例，您可以通过查看服务器TPS或MSPT查看是否为服务器硬件负载过高。若MSPT或TPS在正常范围内，但服务器延迟依旧很高，您可以考虑购买会员获得更高的带宽。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="端口问题" name="4">
                            <div>
                                内网端口选择你要映射的端口，外网端口推荐随机。
                                <br />
                                内网端口不受限制，外网端口不能与其他用户的外网端口重复(会自动检测)。
                                <br />
                                此外，端口类型选择HTTP则外网端口默认使用80，选择HTTPS则默认443。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="关于节点" name="5">
                            <div>
                                我们不能保证所有的节点都稳定可用。使用人数越多，带宽占用越大的节点越容易出现卡顿情况。
                                <br />
                                会员拥有会员专属节点，如果想要稳定且高速的节点，可以购买vip使用vip专属节点。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="关于带宽" name="6">
                            <div>
                                ChmlFrp的带宽分为境内、境外两种。境外节点的带宽速度为境内的四倍。假如您的境内带宽为8m，境外带宽则为8*4=32m。
                                <br />
                                我们带宽的计量单位为mbps，计算方式：8mbps=1MiB/s。此外，ChmlFrp的带宽为共享峰值带宽，不能保证高峰期能跑满应有的速度。
                                <br />
                                需要注意的是，一些特殊网络环境的节点，如：香港、台湾节点 会根据多个因素(如:线路优化/节点总带宽)判定计算国内还是国外带宽，具体请加入交流群询问。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="信息安全" name="7">
                            <div>
                                我们会保存用户的实名信息及用户数据，但是留存的用户数据全部采用业内标准的加密格式
                                <br />
                                实名信息采用AES 256 CBC加密。密码信息通过Bcrypt加密
                                <br />
                                我们承诺不会泄露用户的任何信息，也不会拿用户的信息开玩笑。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="禁止内容" name="8">
                            <div>
                                不能使用映射搭建关于赌博, 黄色, 血腥, 暴力, 爆破, 发包, 代刷网, 发卡网等任何违反中国法律的站点或服务
                                <br />
                                一旦发现，我们有权强行停止您的映射服务。并且上报给公安机关。
                                <br />
                                除此之外，部分节点有节点自己的规则，例如："禁止连续大带宽(如网盘、图床)/禁止攻击服务(遭受攻击频繁)"这类的限制，同样需要遵守。如多次违反，则直接封禁账户。
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="贡献节点" name="9">
                            <div>
                                <n-h3>
                                    贡献节点有两种形式
                                </n-h3>
                                <n-p>
                                    一种是您将您的家宽公网或vps服务器卖给我们作为节点使用，价格私聊商议，这种形式您不会获得任何积分等奖励，且节点权限组为会员节点或免费节点由我们决定。除此之外，您需要保证您服务器的稳定性。
                                </n-p>
                                <n-p>
                                    另一种是您将您的家宽公网或vps服务器无偿捐赠给我们作为节点使用，但是您每个月均可获得不固定积分报酬，且无偿捐赠的节点均为免费节点，提供给所有用户免费使用。
                                </n-p>
                                <n-h3>
                                    联系方式
                                </n-h3>
                                <n-p>
                                    您可以通过QQ：242247494或邮箱：chaoji@chcat.cn联系我们。
                                </n-p>
                            </div>
                        </n-collapse-item>
                        <n-collapse-item title="友链申请" name="10">
                            <div>我们目前允许添加友链，不过友情链接需要是不违反国家法律的网站。非盈利性网站可直接申请添加。盈利性网站需要附带网站备案号以及营业执照副本图片。
                                <br />
                                友链的期限不固定，如发现违规，我们有权直接删除友链。需要注意的是友链的期限不是永久，我们可能会在不通知您的情况下直接删除。
                                <br />
                                友链申请详情规则请前往：https://docs.chcat.cn/docs/chmlfrp/yl
                            </div>
                        </n-collapse-item>
                    </n-collapse>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
</template>

<script lang="ts" setup>
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { useThemeVars } from 'naive-ui';
import * as echarts from 'echarts';
import { LinkOutline, ServerOutline, ArrowUpCircleOutline, ArrowDownCircleOutline } from '@vicons/ionicons5';
import axios from 'axios';
// 根据主题自适应样式背景颜色
import { useStyleStore } from '@/stores/style';
import { useRouter } from 'vue-router';

const loadingTest = ref(true)

const dialog = useDialog()

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
const apiText = ref('');
onMounted(async () => {
    try {
        const response = await axios.get('https://uapis.cn/api/say?type=json');
        apiText.value = response.data.message;
        loadingTest.value = false;
    } catch (error) {
        console.error('一言API调用失败：', error);
    }
});

// 前往QQ群提示群规、提问准则
const GoToQqGroup = (Link: string) => {
    dialog.warning({
        title: '警告',
        content: 'QQ交流群提问前请一定要看群规，第二次违反规定将被禁言30天。',
        positiveText: '我知道了',
        negativeText: '取消',
        onPositiveClick: () => {
            knew(Link)
        },
    })
}

// 您真的知道了吗？
const knew = (Link: string) => {
    dialog.warning({
        title: '警告',
        content: '您真的知道了吗？',
        positiveText: '知道了',
        negativeText: '再看一眼',
        onPositiveClick: () => {
            window.open(Link, '_blank');
        },
        onNegativeClick: () => {
            GoToQqGroup(Link)
        }
    })
}


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
        console.error('[首页]找不到id为“main”(流量统计面积折线图)的元素。');
    }
};

onMounted(() => {
    updateChart();
});

watch(themeVars, () => {
    updateChart();
}, { deep: true });
</script>