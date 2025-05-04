<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-card>
            <n-space justify="space-between">
                <div style="display: flex; align-items: center;">
                    <n-avatar :size="72" round :style="{ display: isHidden ? 'none' : 'flex' }" style="flex-shrink: 0;"
                        :src="userInfo?.userimg" />
                    <div :style="textStyle">
                        <h3 style="margin: 0;">{{ greeting }}</h3>
                        <n-skeleton v-if="loadingTest" width="100%" style="margin-top: 8px" :sharp="false" text />
                        <p v-else style="margin: 0; margin-top: 4px;">{{ apiText }}</p>
                    </div>
                </div>
                <n-space justify="end" style="margin-top: 15px;">
                    <n-skeleton v-if="loadingQianDao" :width="56" :sharp="false" size="medium" />
                    <div v-else>
                        <n-button v-if="!is_signed_in_today" :loading="loadingQianDaoButton && !signedInSuccess"
                            type="primary" strong secondary @click="onSignButtonClick">
                            <template v-if="signedInSuccess">
                                <n-icon>
                                    <CheckmarkCircle />
                                </n-icon>
                            </template>
                            <template v-else>
                                {{ QianDaoTest }}
                            </template>
                        </n-button>
                        <n-tooltip v-else>
                            <template #trigger>
                                <n-button type="primary" strong secondary disabled tag="div">
                                    签到
                                </n-button>
                            </template>
                            您今天已经签到过啦
                        </n-tooltip>
                    </div>
                    <n-popover trigger="hover" style="border-radius: 8px;">
                        <template #trigger>
                            <n-skeleton v-if="loadingQianDao" :width="84" :sharp="false" size="medium" />
                            <n-button v-else strong secondary>签到信息</n-button>
                        </template>
                        <n-thing title="统计信息" content-style="margin-top: 10px;">
                            上次签到时间：{{ last_sign_in_time || "暂无数据" }}<br>
                            累计签到积分：{{ total_points || "暂无数据" }}<br>
                            累计签到次数：{{ total_sign_ins || "暂无数据" }}<br>
                            今日签到人数：{{ count_of_matching_records || 0 }}
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
                    <div v-if="loadingTrafficInfo">
                        <n-skeleton text style="width: 40%" />
                        <n-skeleton text :repeat="16" />
                        <n-skeleton text style="width: 60%" />
                    </div>
                    <div v-else id="main" style="width: 100%; height: 400px;"></div>
                </n-card>
                <n-card style="margin-top: 15px">
                    <n-result status="success" title="ChmlFrp - Panel v3.0" description="简约 大气 开源">
                        <n-descriptions label-placement="left" :column="screenWidth >= 600 ? 3 : 1">
                            <n-descriptions-item label="隧道数">
                                <n-skeleton v-if="loadingPanelInfo" text :width="40" />
                                <n-p v-else>{{ tunnel_amount }}</n-p>
                            </n-descriptions-item>
                            <n-descriptions-item label="用户数">
                                <n-skeleton v-if="loadingPanelInfo" text :width="40" />
                                <n-p v-else>{{ user_amount }}</n-p>
                            </n-descriptions-item>
                            <n-descriptions-item label="节点数">
                                <n-skeleton v-if="loadingPanelInfo" text :width="16" />
                                <n-p v-else>{{ node_amount }}</n-p>
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-result>
                    <n-divider />
                    <n-skeleton v-if="loadingPanelInfo" text :repeat="2" />
                    <n-space v-else style="margin-top: 24px">
                        <n-tooltip trigger="hover" v-for="(links, index) in friendLinks" :key="index">
                            <template #trigger>
                                <n-button text tag="a" :href="links.url" target="_blank">
                                    {{ links.name }}
                                </n-button>
                            </template>
                            {{ links.description || "暂无介绍" }}
                        </n-tooltip>
                    </n-space>
                </n-card>
            </n-gi>
            <n-gi :span="2">
                <n-card>
                    <n-alert v-if="userInfo?.usergroup === '封禁'" title="您的账户已被封禁" type="error" @click="goToUserPage"
                        style="margin-bottom: 10px;">
                        您的账号因为违规被封禁，具体原因可以点击此提示前往个人主页查看消息，如有异议可前往交流群申述。
                    </n-alert>
                    <n-alert v-if="userInfo?.realname === '未实名'" title="您尚未实名" style="margin-bottom: 10px"
                        type="warning" @click="goToUserPage">
                        不实名则无法使用ChmlFrp提供的服务，点击此提示可前往个人中心实名，我们允许未成年实名。
                    </n-alert>
                    <n-alert title="提示" type="info" style="margin-bottom: 10px">
                        如果这里没有您想了解的，可以前往
                        <n-button text tag="a" href="https://docs.chcat.cn" target="_blank" type="primary">
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
                </n-card>
                <n-card style="margin-top: 16px;" title="常见问题">
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
    <n-modal v-model:show="showDialog" preset="dialog" title="第一次使用？" content="那不妨来看看ChmlFrp使用教程！" positive-text="确认"
        negative-text="算了" @positive-click="WatchTutorial" @negative-click="closeDialog" />

    <!-- 模糊遮罩 -->
    <div v-show="showBlurOverlay"
        style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(var(--modal-filter)); z-index: 9998; pointer-events: all;">
    </div>
</template>

<script lang="ts" setup>
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { useThemeVars } from 'naive-ui';
import * as echarts from 'echarts';
import { LinkOutline, ServerOutline, ArrowUpCircleOutline, ArrowDownCircleOutline, CheckmarkCircle } from '@vicons/ionicons5';
import axios from 'axios';
// 根据主题自适应样式背景颜色
import { useStyleStore } from '@/stores/style';
import { useRouter } from 'vue-router';
// 获取登录信息
import { useUserStore } from '@/stores/user';

import api from '@/api'

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const loadingTest = ref(true)
const loadingPanelInfo = ref(true)
const loadingQianDao = ref(true)
const loadingQianDaoButton = ref(false)
const loadingTrafficInfo = ref(true)
const QianDaoTest = ref('签到')
const signedInSuccess = ref(false);
const showDialog = ref(false);
const showBlurOverlay = ref(false);

const countdown = ref(10);

const dialog = useDialog()
const message = useMessage()

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());

const router = useRouter();
const goToUserPage = () => {
    router.push('/user')
}

// 流量单位换算
function formatBytes(bytes: number) {
    const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    let index = 0;
    while (bytes >= 1024 && index < units.length - 1) {
        bytes /= 1024;
        index++;
    }
    return { value: parseFloat(bytes.toFixed(2)), suffix: units[index] };
}

const cards = ref([
    { title: '连接数', value: userInfo?.totalCurConns, icon: markRaw(LinkOutline), precision: 0 },
    {
        title: '总上传',
        value: formatBytes(userInfo?.total_upload || 0).value,
        icon: markRaw(ArrowUpCircleOutline),
        precision: 2,
        suffix: formatBytes(userInfo?.total_upload || 0).suffix
    },
    {
        title: '总下载',
        value: formatBytes(userInfo?.total_download || 0).value,
        icon: markRaw(ArrowDownCircleOutline),
        precision: 2,
        suffix: formatBytes(userInfo?.total_download || 0).suffix
    },
    { title: '积分数', value: userInfo?.integral, icon: markRaw(ServerOutline), precision: 0 },
]);

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
        return `夜深了，${userInfo?.username}，夜晚依然静谧，但新的希望已经开始萌芽。`;
    }
    else if (hour >= 6 && hour < 11) {
        return `早上好，${userInfo?.username}，今天又是充满活力的一天。`;
    }
    else if (hour >= 11 && hour < 14) {
        return `中午好，${userInfo?.username}，享受这温暖的阳光和美味的午餐吧。`;
    }
    else if (hour >= 14 && hour < 15) {
        return `饮茶先啦，${userInfo?.username}，做那么多都没用的，老板不会喜欢你的，喂喝一下茶先吧`;
    }
    else if (hour >= 15 && hour < 17) {
        return `下午好，${userInfo?.username}，午后的时光总是最适合专注与思考。`;
    }
    else if (hour >= 17 && hour < 22) {
        return `晚上好，${userInfo?.username}，夜幕降临，是时候享受片刻宁静了。`;
    }
    else {
        return `少熬夜，${userInfo?.username}，愿你有一个宁静而甜美的梦境。`;
    }
});

onMounted(() => {
    yiyan(); //加载一言
    panelinfo(); //加载面板信息
    qiandaoinfo(); //加载签到信息
    trafficInfo(); //加载流量信息

    // 检查是不是第一次访问网页
    const hasVisited = localStorage.getItem('hasVisitedPage');

    if (!hasVisited) {
        // 如果没有记录，则弹出使用教程
        showDialog.value = true;
        // 设置访问状态
        localStorage.setItem('hasVisitedPage', 'true');
    }
});

const timer = setInterval(() => {
    if (countdown.value > 0) {
        countdown.value--;
    }
}, 1000);

// 关闭教程弹窗
const closeDialog = () => {
    showDialog.value = false;
    countdown.value = 10;
    message.info(
        () => `您后续可以从 菜单的"其他信息->帮助文档" 查看所有有关ChmlFrp的教程！（${countdown.value}秒后关闭）`,
        {
            duration: 10000,
            onClose: () => {
                clearInterval(timer);
            }
        }
    );
};

const WatchTutorial = () => {
    window.open('https://docs.chcat.cn/docs/chmlfrp/%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3/tutorial', '_blank');
}

// 一言
const apiText = ref('');
const yiyan = async () => {
    try {
        const response = await axios.get('https://v1.hitokoto.cn/?c=i&encode=text');
        apiText.value = response.data;
        loadingTest.value = false;
    } catch (error) {
        console.error('一言API调用失败：', error);
    }
};


interface FriendLinks {
    name: string;
    url: string;
    description: string | null;
}

const friendLinks = ref<FriendLinks[]>([]);
const tunnel_amount = ref('');
const node_amount = ref('');
const user_amount = ref('');
const panelinfo = async () => {
    loadingPanelInfo.value = true
    try {
        const response = await api.v2.panel.getPanelInfo()
        if (response.code === 200) {
            tunnel_amount.value = response.data.tunnel_amount.toString();
            node_amount.value = response.data.node_amount.toString();
            user_amount.value = response.data.user_amount.toString();
            friendLinks.value = response.data.friend_links!.map((links: FriendLinks) => ({
                name: links.name,
                url: links.url,
                description: links.description || '',
            }))
        }
    } catch (error) {
        message.error('面板信息API调用失败: ' + error);
    }
    loadingPanelInfo.value = false
};

const last_sign_in_time = ref('');
const total_points = ref(0);
const total_sign_ins = ref(0);
const count_of_matching_records = ref(0);
const is_signed_in_today = ref(false);
const qiandaoinfo = async () => {
    loadingQianDao.value = true
    try {
        const response = await axios.get(`https://cf-v1.uapis.cn/api/qdxx.php?userid=${userInfo?.id}`);
        if (response.data.code === 200) {
            last_sign_in_time.value = response.data.last_sign_in_time;
            total_points.value = response.data.total_points;
            total_sign_ins.value = response.data.total_sign_ins;
            count_of_matching_records.value = response.data.count_of_matching_records;
            is_signed_in_today.value = response.data.is_signed_in_today;
        }
    } catch (error) {
        console.error('签到信息API调用失败', error);
    }
    loadingQianDao.value = false
}

const onSignButtonClick = () => {
    loadingQianDaoButton.value = true;
    QianDaoTest.value = '初始化验证[1/3]';
    window.initGeetest4(
        {
            product: 'bind',
            captchaId: '3891b578aa85e4866c5f8205b02b165a',
            width: '100%',
        },
        (captchaObj: CaptchaObj) => {
            captchaObj.onNextReady(function () {
                QianDaoTest.value = '验证码验证[2/3]';
            });
            captchaObj.showCaptcha();

            showBlurOverlay.value = true;

            captchaObj.onClose(function () {
                message.warning('签到验证关闭，此次签到未成功');
                showBlurOverlay.value = false;
                loadingQianDaoButton.value = false;
                QianDaoTest.value = '签到';
            });
            captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate();
                if (result) {
                    console.log('Geetest 验证成功:', result);
                    // 调用签到API
                    signIn(result);
                }
            });
        }
    );
};

const signIn = async (geetestResult: GeetestResult) => {
    QianDaoTest.value = '调用签到API[3/3]';

    try {
        const data = await api.v2.user.signIn(
            userInfo?.usertoken || '',
            geetestResult.lot_number,
            geetestResult.captcha_output,
            geetestResult.pass_token,
            geetestResult.gen_time);
        showBlurOverlay.value = false;
        loadingQianDaoButton.value = false;
        signedInSuccess.value = true;
        dialog.success({
            title: '签到成功',
            content: data.msg,
            positiveText: '哇'
        });
    } catch (error) {
        showBlurOverlay.value = false;
        signedInSuccess.value = false;
        loadingQianDaoButton.value = false;
        QianDaoTest.value = '签到';
        message.error("签到失败：" + (error as Error).message);
    }
    setTimeout(() => {
        showBlurOverlay.value = false;
        signedInSuccess.value = false;
        loadingQianDaoButton.value = false;
        QianDaoTest.value = '签到';
        qiandaoinfo();
    }, 3000);
};

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

const trafficInfo = async () => {
    loadingTrafficInfo.value = true;
    try {
        const response = await axios.get(`https://cf-v1.uapis.cn/api/flow_zong.php?usertoken=${userInfo?.usertoken}`);
        const apiData = response.data;

        if (apiData.status === 'success') {
            loadingTrafficInfo.value = false;
            await nextTick();
            updateChart(apiData);
        } else {
            console.error('流量统计API返回状态不成功:', apiData);
        }
    } catch (error) {
        console.error('流量统计API调用错误:', error);
    } finally {
        loadingTrafficInfo.value = false;
    }
};

interface ApiDataItem {
    time: string;
    traffic_in: number;
    traffic_out: number;
}

interface ApiData {
    data: ApiDataItem[];
}

const updateChart = (apiData: ApiData) => {
    const chartDom = document.getElementById('main');
    if (chartDom) {
        const myChart = echarts.init(chartDom);

        // 将 API 返回的数据单位从字节转换为 MB
        const times = apiData.data.map(item => item.time);
        const trafficInMB = apiData.data.map(item => (Number(item.traffic_in) / (1024 * 1024)).toFixed(2));
        const trafficOutMB = apiData.data.map(item => (Number(item.traffic_out) / (1024 * 1024)).toFixed(2));

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
                data: times,
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
            series: [
                {
                    name: '上传',
                    type: 'line',
                    data: trafficOutMB,
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
                },
                {
                    name: '下载',
                    type: 'line',
                    data: trafficInMB,
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
                }
            ]
        };

        myChart.setOption(option);

        // 添加窗口大小变化监听器
        const resizeHandler = () => {
            myChart.resize();
        };
        window.addEventListener('resize', resizeHandler);


        // 明暗切换时重新渲染图表
        const unwatchTheme = watch(() => styleStore.getTheme(), () => {
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
                    data: times,
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
                series: [
                    {
                        name: '上传',
                        type: 'line',
                        data: trafficOutMB,
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
                    },
                    {
                        name: '下载',
                        type: 'line',
                        data: trafficInMB,
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
                    }
                ]
            };

            myChart.setOption(option);
        });

        // 在组件卸载时清理事件监听器和观察者
        onUnmounted(() => {
            window.removeEventListener('resize', resizeHandler);
            unwatchTheme();
            myChart.dispose();
        });
    } else {
        console.error('[首页]找不到id为“main”(流量统计面积折线图)的元素。');
    }
};

</script>