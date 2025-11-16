<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <UserGreetingCard
            :greeting="greeting"
            :api-text="apiText"
            :loading="yiyanLoading"
            :user-info="userInfoForGreeting"
        >
            <SignInCard
                :loading="signInLoading"
                :loading-button="signInLoadingButton"
                :qian-dao-text="qianDaoText"
                :signed-in-success="signedInSuccess"
                :sign-in-info="signInInfo"
                :on-sign-button-click="onSignButtonClick"
            />
        </UserGreetingCard>

        <StatsCards :cards="cards" />

        <n-grid style="margin-top: 15px" cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <TrafficChart />
                <PanelInfoCard :loading="panelInfoLoading" :panel-info="panelInfo" />
            </n-gi>
            <n-gi :span="2">
                <UserAlertsCard ref="userAlertsCardRef" :user-info="userInfoForAlerts" />
                <FAQCard />
            </n-gi>
        </n-grid>
    </n-flex>

    <n-modal
        v-model:show="showDialog"
        preset="dialog"
        title="第一次使用？"
        content="那不妨来看看ChmlFrp使用教程！"
        positive-text="确认"
        negative-text="算了"
        @positive-click="watchTutorial"
        @negative-click="closeDialog"
    />
    <n-modal v-model:show="showWxGroup" preset="dialog" title="请扫描二维码加入微信群">
        <n-image :src="wxImage" />
    </n-modal>

    <!-- 模糊遮罩 -->
    <div v-show="showBlurOverlay" :style="blurOverlayStyle"></div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import {
    LinkOutline,
    ServerOutline,
    ArrowUpCircleOutline,
    ArrowDownCircleOutline,
} from '@vicons/ionicons5';
import wxImage from '@/assets/wx.jpg';

// Components
import UserGreetingCard from './components/UserGreetingCard.vue';
import SignInCard from './components/SignInCard.vue';
import StatsCards from './components/StatsCards.vue';
import TrafficChart from './components/TrafficChart.vue';
import PanelInfoCard from './components/PanelInfoCard.vue';
import UserAlertsCard from './components/UserAlertsCard.vue';
import FAQCard from './components/FAQCard.vue';

// Composables
import { useGreeting } from './composables/useGreeting';
import { useYiyan } from './composables/useYiyan';
import { useSignIn } from './composables/useSignIn';
import { usePanelInfo } from './composables/usePanelInfo';

// Utils & Constants
import { formatBytes } from '@/utils/formatBytes';
import { COUNTDOWN_DURATION, TIME_UPDATE_INTERVAL, TUTORIAL_URL } from './constants';

const userStore = useUserStore();
const userInfo = userStore.userInfo;
const message = useMessage();

// 将 null 转换为 undefined 以匹配组件类型
const userInfoForGreeting = computed(() => userInfo?.userimg ? { userimg: userInfo.userimg } : undefined);
const userInfoForAlerts = computed(() => 
    userInfo ? { usergroup: userInfo.usergroup, realname: userInfo.realname } : undefined
);

// Composables
const { greeting, startTimer } = useGreeting(userInfo?.username);
const { apiText, loading: yiyanLoading, fetchYiyan } = useYiyan();
const {
    loading: signInLoading,
    loadingButton: signInLoadingButton,
    qianDaoText,
    signedInSuccess,
    showBlurOverlay,
    signInInfo,
    fetchSignInInfo,
    onSignButtonClick,
} = useSignIn(userInfo || {});
const { loading: panelInfoLoading, panelInfo, fetchPanelInfo } = usePanelInfo();

// 计算卡片数据
const cards = computed(() => {
    const uploadFormatted = formatBytes(userInfo?.total_upload || 0);
    const downloadFormatted = formatBytes(userInfo?.total_download || 0);

    return [
        { title: '连接数', value: userInfo?.totalCurConns || 0, icon: markRaw(LinkOutline), precision: 0 },
    {
        title: '总上传',
            value: uploadFormatted.value,
        icon: markRaw(ArrowUpCircleOutline),
        precision: 2,
            suffix: uploadFormatted.suffix,
    },
    {
        title: '总下载',
            value: downloadFormatted.value,
        icon: markRaw(ArrowDownCircleOutline),
        precision: 2,
            suffix: downloadFormatted.suffix,
    },
        { title: '积分数', value: userInfo?.integral || 0, icon: markRaw(ServerOutline), precision: 0 },
    ];
});

// 模糊遮罩样式
const blurOverlayStyle = computed(() => ({
    position: 'fixed' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(var(--modal-filter))',
    zIndex: 9998,
    pointerEvents: 'all' as const,
}));

// 对话框和倒计时
const showDialog = ref(false);
const showWxGroup = ref(false);
const countdown = ref(COUNTDOWN_DURATION);
let countdownTimer: ReturnType<typeof setInterval> | null = null;
const userAlertsCardRef = ref<InstanceType<typeof UserAlertsCard>>();

// 检查是否第一次访问
const checkFirstVisit = () => {
    const hasVisited = localStorage.getItem('hasVisitedPage');
    const isRecentRegistration = () => {
        if (!userInfo?.regtime) return false;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        return userInfo.regtime === todayStr || userInfo.regtime === yesterdayStr;
    };

    if (!hasVisited && userInfo?.regtime && isRecentRegistration()) {
        showDialog.value = true;
        localStorage.setItem('hasVisitedPage', 'true');
    }
};

// 关闭教程弹窗
const closeDialog = () => {
    showDialog.value = false;
    countdown.value = COUNTDOWN_DURATION;

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    countdownTimer = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
        } else {
            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
        }
    }, TIME_UPDATE_INTERVAL);

    message.info(
        () => `您后续可以从 菜单的"其他信息->帮助文档" 查看所有有关ChmlFrp的教程！（${countdown.value}秒后关闭）`,
        {
            duration: 10000,
            onClose: () => {
                if (countdownTimer) {
                    clearInterval(countdownTimer);
                    countdownTimer = null;
                }
            },
        }
    );
};

const watchTutorial = () => {
    window.open(TUTORIAL_URL, '_blank');
};

// 监听微信群的显示状态
watch(
    () => userAlertsCardRef.value?.showWxGroup,
    (val) => {
        if (val !== undefined) {
            showWxGroup.value = val;
        }
    }
);

onMounted(() => {
    fetchYiyan();
    fetchPanelInfo();
    fetchSignInInfo();
    startTimer();
    checkFirstVisit();
});

onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
});
</script>
