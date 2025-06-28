<template>
    <n-back-top :right="100" />
    <n-card size="small">
        <n-alert title="提示" type="warning">
            充值后不支持退款，如果无法支付或支付后未到账，请联系客服QQ：242247494开通临时支付渠道或进行补发。
        </n-alert>
    </n-card>
    <n-card style="margin-top: 16px">
        <n-h3 prefix="bar">
            <n-text type="primary"> 预设金额 </n-text>
        </n-h3>
        <n-grid cols="2 s:3 m:4 l:5 xl:6 2xl:7" :x-gap="12" :y-gap="12" responsive="screen">
            <n-grid-item v-for="(item, index) in presetAmounts" :key="index">
                <n-card
                    size="small"
                    hoverable
                    @click="selectPresetAmount(item)"
                    :style="
                        selectedPresetAmount === item.amount ? { border: `2px solid ${themeVars.primaryColor}` } : {}
                    "
                >
                    <n-flex justify="space-between">
                        {{ item.points }}积分
                        <n-flex justify="end"> {{ item.amount }}￥ </n-flex>
                    </n-flex>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-h3 prefix="bar">
            <n-text type="primary"> 自定义金额 </n-text>
        </n-h3>
        <n-grid cols="5" item-responsive responsive="screen">
            <n-grid-item span="5 m:2">
                <n-input
                    v-model:value="customAmount"
                    round
                    clearable
                    type="text"
                    :allow-input="onlyAllowNumber"
                    placeholder="请输入整数金额(最少为3，最多为9999)"
                    @keydown.enter="validateAmount"
                    @blur="validateMaxAmount"
                    @input="onCustomAmountInput"
                >
                    <template #prefix> ￥ </template>
                </n-input>
            </n-grid-item>
            <n-grid-item span="5 m:3" style="display: flex; justify-content: flex-end; align-items: center">
                <n-text type="primary" style="margin-left: auto"> = {{ calculatedPoints }}积分 </n-text>
            </n-grid-item>
        </n-grid>
        <n-h3 prefix="bar">
            <n-text type="primary"> 支付方式 </n-text>
        </n-h3>
        <n-grid cols="2 s:3 l:4 xl:5 2xl:6" :x-gap="12" :y-gap="12" responsive="screen">
            <n-grid-item>
                <n-spin :show="loading">
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-card size="small" hoverable @click="pay('wxpay')" :disabled="!isAmountValid">
                                <n-space align="center">
                                    <n-icon size="40" color="#07C160">
                                        <LogoWechat />
                                    </n-icon>
                                    <span style="font-size: 24px">微信支付</span>
                                </n-space>
                            </n-card>
                        </template>
                        点击后会直接跳转至付款页面
                    </n-tooltip>
                </n-spin>
            </n-grid-item>
            <n-grid-item>
                <n-spin :show="loading">
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-card size="small" hoverable @click="pay('alipay')" :disabled="!isAmountValid">
                                <n-space align="center">
                                    <n-icon size="40" color="#1677FF">
                                        <LogoAlipay />
                                    </n-icon>
                                    <span style="font-size: 24px">支付宝</span>
                                </n-space>
                            </n-card>
                        </template>
                        点击后会直接跳转至付款页面
                    </n-tooltip>
                </n-spin>
            </n-grid-item>
            <n-grid-item>
                <n-spin :show="loading">
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-card size="small" hoverable @click="pay('qqpay')" :disabled="!isAmountValid">
                                <n-space align="center">
                                    <n-icon size="40" color="#12B7F5">
                                        <Qq />
                                    </n-icon>
                                    <span style="font-size: 24px">QQ支付</span>
                                </n-space>
                            </n-card>
                        </template>
                        点击后会直接跳转至付款页面
                    </n-tooltip>
                </n-spin>
            </n-grid-item>
        </n-grid>
    </n-card>
</template>

<script lang="ts" setup>
import { LogoAlipay, LogoWechat } from '@vicons/ionicons5';
import { Qq } from '@vicons/fa';
import { ref, computed, onMounted, watch } from 'vue';
import { useMessage, useThemeVars } from 'naive-ui';
import { useLoadUserInfo } from '@/components/useLoadUser';

// 获取登录信息
import { useUserStore } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const dialog = useDialog();
const message = useMessage();
const themeVars = useThemeVars();

// 检查 URL 是否包含 trade_status 参数
const checkTradeStatus = () => {
    if (route.query.trade_status === 'TRADE_SUCCESS') {
        showDialog(route.query.money as unknown as number);
    }
};
const showDialog = (money: number) => {
    dialog.success({
        title: '积分充值提示',
        content: `积分充值成功！您充值了 ${money} 元，共获得 ${money * 1000} 积分。`,
        positiveText: '确定',
        onPositiveClick: () => {
            router.replace({ path: route.path, query: {} });
            message.success('ChmlFrp感谢您的支持！');
            useLoadUserInfo();
        },
        maskClosable: false,
        onMaskClick: () => {
            message.warning('请点击确定关闭此弹窗');
        },
        onEsc: () => {
            router.replace({ path: route.path, query: {} });
            message.success('ChmlFrp感谢您的支持！');
            useLoadUserInfo();
        },
    });
};

onMounted(() => {
    checkTradeStatus();
});

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const loading = ref(false);

// 预设金额配置
const presetAmounts = [
    { amount: 3, points: 3000 },
    { amount: 6, points: 6000 },
    { amount: 8, points: 8000 },
    { amount: 12, points: 12000 },
    { amount: 16, points: 16000 },
    { amount: 30, points: 30000 },
    { amount: 60, points: 60000 },
    { amount: 80, points: 80000 },
    { amount: 120, points: 120000 },
    { amount: 160, points: 160000 },
];

const customAmount = ref('3');
const selectedPresetAmount = ref<number | null>(null);

// 计算积分
const calculatedPoints = computed(() => {
    const amount = parseInt(customAmount.value) || 0;
    return amount * 1000;
});

// 金额验证
const isAmountValid = computed(() => {
    const amount = parseInt(customAmount.value) || 0;
    return amount >= 3 && amount <= 9999;
});

// 验证最大金额
const validateMaxAmount = () => {
    const amount = parseInt(customAmount.value) || 0;
    if (amount > 9999) {
        message.error('金额最大为9999元');
        customAmount.value = '9999';
    }
};
// 只允许数字输入并限制最大长度
const onlyAllowNumber = (value: string) => {
    // 限制只能输入数字
    if (!/^\d*$/.test(value)) return false;
    // 限制最大长度为4位(9999)
    if (value.length > 4) return false;
    return true;
};

// 选择预设金额
const selectPresetAmount = (item: { amount: number }) => {
    customAmount.value = item.amount.toString();
    selectedPresetAmount.value = item.amount;
};

// 监听自定义金额变化，如果和预设金额匹配则自动高亮
watch(customAmount, (val) => {
    const match = presetAmounts.find((item) => item.amount.toString() === val);
    if (match) {
        selectedPresetAmount.value = match.amount;
    } else {
        selectedPresetAmount.value = null;
    }
});

const onCustomAmountInput = () => {
    selectedPresetAmount.value = null;
};

// 验证金额
const validateAmount = () => {
    if (!isAmountValid.value) {
        message.error('金额最少为3元');
    }
};

// 支付函数
const pay = async (ttype: 'wxpay' | 'alipay' | 'qqpay') => {
    const amount = parseInt(customAmount.value) || 3;
    if (amount < 3) {
        message.error('金额最少为3元');
        return;
    }
    if (amount > 9999) {
        message.error('金额最大为9999元');
        return;
    }

    const currentFullUrl = window.location.href;

    loading.value = true;
    try {
        const response = await axios.get('https://cf-v1.uapis.cn/api/pay.php', {
            params: {
                usertoken: userInfo?.usertoken,
                name: '积分充值',
                type: ttype,
                money: amount,
                return: currentFullUrl,
            },
        });
        const data = response.data;
        if (data?.success === true) {
            // 跳转到支付API
            message.success('获取付款链接成功，正在跳转至支付页面，请稍等。');
            window.location.href = data.url;
        } else {
            message.error(data?.message);
        }
    } catch (error) {
        console.error('购买请求失败:', error);
        message.error('购买请求异常，请检查网络或稍后再试');
    }
    loading.value = false;
};
</script>

<style lang="scss">
.n-flex {
    font-size: 16px;
}
</style>
