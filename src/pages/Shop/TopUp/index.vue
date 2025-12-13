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
        </n-grid>
    </n-card>
</template>

<script lang="ts" setup>
import { LogoAlipay, LogoWechat } from '@vicons/ionicons5';
import { ref, computed, onMounted, watch, h } from 'vue';
import { useMessage, useThemeVars, useDialog, NQrCode } from 'naive-ui';
import { useLoadUserInfo } from '@/components/useLoadUser';
import api from '@/api/v2';

// 获取登录信息
import { useUserStore } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const dialog = useDialog();
const message = useMessage();
const themeVars = useThemeVars();

let pollingTimer: number | null = null;
let qrCodeDialog: any = null; // 保存二维码对话框实例

/**
 * 开始轮询订单状态
 */
const startPolling = (outTradeNo: string) => {
    let pollCount = 0;
    const maxPolls = 60; // 最多轮询60次（3分钟）
    const pollInterval = 3000; // 每3秒轮询一次

    const poll = async () => {
        try {
            pollCount++;
            const response = await api.payment.queryPayment({ outTradeNo });

        // 只有当 tradeStatus === 'success' 时才算支付成功
        if (response.success && response.tradeStatus === 'success') {
            // 支付成功
            stopPolling();
            
            // 先关闭二维码对话框
            if (qrCodeDialog) {
                qrCodeDialog.destroy();
                qrCodeDialog = null;
            }
            
            const points = (response.money || 0) * 1000;
            dialog.success({
                title: '支付成功',
                content: `积分充值成功！\n充值金额：${response.money}元\n获得积分：${points}\n支付时间：${response.payTime || '刚刚'}`,
                positiveText: '确定',
                onPositiveClick: () => {
                    message.success('ChmlFrp感谢您的支持！');
                    // 刷新用户信息
                    useLoadUserInfo();
                },
                maskClosable: false,
            });
        } else if (response.tradeStatus === 'closed' || response.tradeStatus === 'refund') {
            // 订单关闭或退款
            stopPolling();
            message.error(response.tradeStatus === 'closed' ? '订单已关闭' : '订单已退款');
        } else if (!response.success) {
            // API调用失败
            stopPolling();
            message.error(response.message || '查询订单失败');
        } else if (pollCount >= maxPolls) {
            // 超时
            stopPolling();
            message.warning('轮询超时，请手动刷新页面查看支付结果');
        } else {
            // 继续轮询 (pending状态或其他)
            pollingTimer = window.setTimeout(poll, pollInterval);
        }
        } catch (error) {
            console.error('轮询订单状态失败:', error);
            if (pollCount < maxPolls) {
                pollingTimer = window.setTimeout(poll, pollInterval);
            } else {
                stopPolling();
            }
        }
    };

    // 开始第一次轮询
    pollingTimer = window.setTimeout(poll, pollInterval);
};

/**
 * 停止轮询
 */
const stopPolling = () => {
    if (pollingTimer) {
        clearTimeout(pollingTimer);
        pollingTimer = null;
    }
};

// 检查订单状态
const checkTradeStatus = async () => {
    const outTradeNo = route.query.outTradeNo as string;
    
    if (!outTradeNo) {
        return;
    }

    try {
        // 查询订单状态
        const response = await api.payment.queryPayment({ outTradeNo });

        if (!response.success) {
            message.error(response.message || '查询订单状态失败');
            clearQueryParams();
            return;
        }

        // 只处理支付成功的情况
        if (response.tradeStatus === 'success') {
            showSuccessDialog(response.money || 0);
        } else if (response.tradeStatus === 'pending') {
            message.warning('订单尚未支付，请完成支付');
            clearQueryParams();
        } else {
            message.error('订单状态异常');
            clearQueryParams();
        }
    } catch (error: any) {
        console.error('查询订单状态失败:', error);
        message.error(error.message || '查询订单状态异常，请稍后再试');
        clearQueryParams();
    }
};

const showSuccessDialog = (money: number) => {
    dialog.success({
        title: '积分充值提示',
        content: `积分充值成功！您充值了 ${money} 元，共获得 ${money * 1000} 积分。`,
        positiveText: '确定',
        onPositiveClick: () => {
            clearQueryParams();
            message.success('ChmlFrp感谢您的支持！');
            useLoadUserInfo();
        },
        maskClosable: false,
        onMaskClick: () => {
            message.warning('请点击确定关闭此弹窗');
        },
        onEsc: () => {
            clearQueryParams();
            message.success('ChmlFrp感谢您的支持！');
            useLoadUserInfo();
        },
    });
};

const clearQueryParams = () => {
    router.replace({ path: route.path, query: {} });
};

onMounted(() => {
    checkTradeStatus();
    // 检查是否有传入的积分或金额参数
    const pointsParam = route.query.points as string;
    const amountParam = route.query.amount as string;
    
    if (amountParam) {
        // 如果传入了金额，直接使用（确保至少3元）
        const amount = Math.max(parseInt(amountParam) || 0, 3);
        customAmount.value = Math.min(amount, 9999).toString();
        // 清除查询参数，但保留 outTradeNo（用于支付回调）
        const newQuery: Record<string, string> = {};
        if (route.query.outTradeNo) {
            newQuery.outTradeNo = route.query.outTradeNo as string;
        }
        router.replace({ path: route.path, query: newQuery });
    } else if (pointsParam) {
        // 如果传入了积分，转换为金额（1元=1000积分，向上取整，至少3元）
        const points = parseInt(pointsParam) || 0;
        const amount = Math.max(Math.ceil(points / 1000), 3);
        customAmount.value = Math.min(amount, 9999).toString();
        // 清除查询参数，但保留 outTradeNo（用于支付回调）
        const newQuery: Record<string, string> = {};
        if (route.query.outTradeNo) {
            newQuery.outTradeNo = route.query.outTradeNo as string;
        }
        router.replace({ path: route.path, query: newQuery });
    }
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
const pay = async (ttype: 'wxpay' | 'alipay') => {
    const amount = parseInt(customAmount.value) || 3;
    if (amount < 3) {
        message.error('金额最少为3元');
        return;
    }
    if (amount > 9999) {
        message.error('金额最大为9999元');
        return;
    }

    loading.value = true;
    try {
        // 创建支付订单
        const response = await api.payment.createPayment({
            name: '积分充值',
            money: amount,
            usertoken: userInfo?.usertoken || '',
            type: ttype,
        });

        if (!response.success) {
            message.error(response.message || '创建订单失败');
            return;
        }

        // 保存订单号
        const outTradeNo = response.outTradeNo;

        // 根据支付类型处理
        if (ttype === 'wxpay') {
            // 微信支付：显示二维码
            if (!response.codeUrl) {
                message.error('获取微信支付二维码失败');
                return;
            }

        // 显示二维码对话框并保存实例
        qrCodeDialog = dialog.info({
                title: '微信支付',
                content: () => h('div', { style: 'display: flex; flex-direction: column; align-items: center;' }, [
                    h('div', { style: 'max-width: 300px; width: 100%; display: flex; justify-content: center;' }, [
                        h(NQrCode, {
                            value: response.codeUrl,
                            size: 300,
                            color: '#18a058',
                        }),
                    ]),
                    h('p', { style: 'margin-top: 10px;' }, `请使用微信扫码支付 ${response.money} 元`),
                    h('p', { style: 'font-size: 12px; color: #999;' }, `订单号：${outTradeNo}`),
                ]),
            positiveText: '我已支付',
            negativeText: '取消支付',
            onPositiveClick: () => {
                stopPolling();
                qrCodeDialog = null;
                message.success('ChmlFrp感谢您的支持！');
                useLoadUserInfo();
            },
            onNegativeClick: () => {
                stopPolling();
                qrCodeDialog = null;
            },
            onClose: () => {
                stopPolling();
                qrCodeDialog = null;
            },
            maskClosable: false,
        });

            // 开始轮询订单状态
            startPolling(outTradeNo!);
        } else if (ttype === 'alipay') {
            // 支付宝支付：提交表单跳转
            if (!response.payForm) {
                message.error('获取支付宝支付表单失败');
                return;
            }

            message.success('正在跳转到支付宝支付页面...');
            
            // 创建临时表单并提交
            const div = document.createElement('div');
            div.innerHTML = response.payForm;
            document.body.appendChild(div);
            
            const form = div.querySelector('form');
            if (form) {
                form.submit();
            } else {
                message.error('支付表单格式错误');
            }
        }
    } catch (error: any) {
        console.error('购买请求失败:', error);
        message.error(error.message || '购买请求异常，请检查网络或稍后再试');
    } finally {
        loading.value = false;
    }
};
</script>

<style lang="scss">
.n-flex {
    font-size: 16px;
}
</style>
