import { ref, h } from 'vue';
import { useMessage, useDialog, NQrCode } from 'naive-ui';
import { useLoadUserInfo } from '@/components/useLoadUser';
import api from '@/api/v2';
import type { MembershipType } from '../types';
import { useMembershipPricing } from './useMembershipPricing';
import { LIFETIME_MEMBER_PRICE, LIFETIME_TERM_DATE } from '../constants';

/**
 * 终身会员购买 composable
 */
export function useLifetimePurchase(userInfo: { usertoken?: string; usergroup?: string; term?: string } | undefined) {
    const message = useMessage();
    const dialog = useDialog();
    const { getPrice, isFreeUser } = useMembershipPricing(userInfo);

    const showModal = ref(false);
    const loading = ref(false);
    const targetGroup = ref<MembershipType>('普通会员');
    const payAmount = ref(0);
    let pollingTimer: number | null = null;
    let qrCodeDialog: any = null; // 保存二维码对话框实例

    /**
     * 开始轮询订单状态
     */
    const startPolling = (outTradeNo: string, onSuccess: () => void, onCancel: () => void) => {
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
                    onSuccess();

                    // 先关闭二维码对话框
                    if (qrCodeDialog) {
                        qrCodeDialog.destroy();
                        qrCodeDialog = null;
                    }

                    dialog.success({
                        title: '支付成功',
                        content: `恭喜您成功购买永久会员！\n支付金额：${response.money}元\n支付时间：${response.payTime || '刚刚'}`,
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
                    onCancel();
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

    const getPerkMessage = (target: MembershipType): string => {
        const current = userInfo?.usergroup || '免费用户';
        const currentTerm = userInfo?.term || '';
        const groups = ['免费用户', '普通会员', '高级会员', '超级会员', '封禁', '定制会员', '管理员'];
        const currentIdx = groups.indexOf(current);
        const targetIdx = groups.indexOf(target);

        if (current === target && currentTerm === LIFETIME_TERM_DATE) {
            return '您已购买此终身会员，感谢您的支持。';
        }
        if (currentIdx > targetIdx && currentTerm === LIFETIME_TERM_DATE) {
            return '您已购买更高等级终身会员，感谢您的支持。';
        }
        if (userInfo?.usergroup === '封禁') {
            return '您的账户已被封禁，无法购买或升级会员。';
        }
        return isFreeUser.value
            ? `终身会员仅需${getPrice(target)}元。一次性付费终生使用。`
            : `升级到此终身会员仅需${getPrice(target) - getPrice((userInfo?.usergroup ?? '普通会员') as MembershipType)}元。一次性付费终生使用。`;
    };

    const canPurchase = (target: MembershipType): boolean => {
        const current = userInfo?.usergroup || '免费用户';
        const currentTerm = userInfo?.term || '';
        const groups = ['免费用户', '普通会员', '高级会员', '超级会员', '封禁', '管理员', '定制会员'];
        const currentIdx = groups.indexOf(current);
        const targetIdx = groups.indexOf(target);
        return !(currentTerm === LIFETIME_TERM_DATE && currentIdx >= targetIdx);
    };

    const openUpgradeModal = (group: MembershipType) => {
        targetGroup.value = group;

        if (isFreeUser.value) {
            payAmount.value = LIFETIME_MEMBER_PRICE[group as keyof typeof LIFETIME_MEMBER_PRICE] ?? 0;
        } else if (userInfo?.usergroup === '普通会员') {
            const currentPrice = LIFETIME_MEMBER_PRICE['普通会员'] ?? 0;
            const targetPrice = LIFETIME_MEMBER_PRICE[group as keyof typeof LIFETIME_MEMBER_PRICE] ?? 0;
            payAmount.value = targetPrice > currentPrice ? targetPrice - currentPrice : 0;
        } else if (userInfo?.usergroup === '高级会员') {
            const currentPrice = LIFETIME_MEMBER_PRICE['高级会员'] ?? 0;
            const targetPrice = LIFETIME_MEMBER_PRICE[group as keyof typeof LIFETIME_MEMBER_PRICE] ?? 0;
            payAmount.value = targetPrice > currentPrice ? targetPrice - currentPrice : 0;
        } else {
            payAmount.value = 0;
        }

        if (payAmount.value === 0) {
            message.error('您当前会员无法升级为该会员或已是该会员');
            return;
        }

        showModal.value = true;
    };

    const handlePay = async (ttype: 'wechat' | 'alipay') => {
        // 转换支付类型
        const paymentType = ttype === 'wechat' ? 'wxpay' : 'alipay';

        loading.value = true;

        try {
            // 创建支付订单
            const response = await api.payment.createPayment({
                name: '永久会员购买',
                money: payAmount.value,
                usertoken: userInfo?.usertoken || '',
                type: paymentType,
            });

            if (!response.success) {
                message.error(response.message || '创建订单失败');
                return;
            }

            // 保存订单号
            const outTradeNo = response.outTradeNo;

            // 根据支付类型处理
            if (paymentType === 'wxpay') {
                // 微信支付：显示二维码
                if (!response.codeUrl) {
                    message.error('获取微信支付二维码失败');
                    return;
                }

                // 先关闭购买模态框
                showModal.value = false;

                // 使用 setTimeout 确保 modal 完全关闭后再显示 dialog
                setTimeout(() => {
                    // 显示二维码对话框并保存实例
                    qrCodeDialog = dialog.info({
                        title: '微信支付',
                        content: () => {
                            return h('div', { style: 'display: flex; flex-direction: column; align-items: center;' }, [
                                h(
                                    'div',
                                    { style: 'max-width: 300px; width: 100%; display: flex; justify-content: center;' },
                                    [
                                        h(NQrCode, {
                                            value: response.codeUrl,
                                            size: 300,
                                            color: '#18a058',
                                        }),
                                    ]
                                ),
                                h('p', { style: 'margin-top: 10px;' }, `请使用微信扫码支付 ${response.money} 元`),
                                h('p', { style: 'font-size: 12px; color: #999;' }, `订单号：${outTradeNo}`),
                            ]);
                        },
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
                    startPolling(
                        outTradeNo!,
                        () => {
                            // 支付成功回调已在 startPolling 中处理
                        },
                        () => {
                            // 支付取消回调
                        }
                    );
                }, 100);
            } else if (paymentType === 'alipay') {
                // 支付宝支付：提交表单跳转
                if (!response.payForm) {
                    message.error('获取支付宝支付表单失败');
                    return;
                }

                // 先关闭购买模态框
                showModal.value = false;

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

    return {
        showModal,
        loading,
        targetGroup,
        payAmount,
        getPerkMessage,
        canPurchase,
        openUpgradeModal,
        handlePay,
    };
}
