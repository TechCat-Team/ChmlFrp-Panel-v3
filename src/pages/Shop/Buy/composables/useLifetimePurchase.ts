import { ref, h, getCurrentInstance, resolveComponent } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
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
            payAmount.value = LIFETIME_MEMBER_PRICE[group] || 0;
        } else if (userInfo?.usergroup === '普通会员') {
            const currentPrice = LIFETIME_MEMBER_PRICE['普通会员'] || 0;
            const targetPrice = LIFETIME_MEMBER_PRICE[group] || 0;
            payAmount.value = targetPrice > currentPrice ? targetPrice - currentPrice : 0;
        } else if (userInfo?.usergroup === '高级会员') {
            const currentPrice = LIFETIME_MEMBER_PRICE['高级会员'] || 0;
            const targetPrice = LIFETIME_MEMBER_PRICE[group] || 0;
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
        loading.value = true;
        
        try {
            // 转换支付类型
            const paymentType = ttype === 'wechat' ? 'wxpay' : 'alipay';
            
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

                // 显示二维码对话框
                dialog.info({
                    title: '微信支付',
                    content: () => {
                        const QrCode = resolveComponent('n-qr-code');
                        return h('div', { style: 'text-align: center;' }, [
                            h(QrCode, {
                                value: response.codeUrl,
                                size: 300,
                            }),
                            h('p', { style: 'margin-top: 10px;' }, `请使用微信扫码支付 ${response.money} 元`),
                            h('p', { style: 'font-size: 12px; color: #999;' }, `订单号：${outTradeNo}`),
                        ]);
                    },
                    positiveText: '支付完成',
                    negativeText: '取消',
                    onPositiveClick: () => {
                        // 跳转到当前页面并带上订单号，用于查询订单状态
                        window.location.href = `${window.location.pathname}?outTradeNo=${outTradeNo}`;
                    },
                    maskClosable: false,
                });
            } else if (paymentType === 'alipay') {
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

