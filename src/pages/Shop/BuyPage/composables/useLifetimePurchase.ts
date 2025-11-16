import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import axios from 'axios';
import type { MembershipType } from '../types';
import { useMembershipPricing } from './useMembershipPricing';
import { LIFETIME_MEMBER_PRICE, LIFETIME_TERM_DATE } from '../constants';

/**
 * 终身会员购买 composable
 */
export function useLifetimePurchase(userInfo: { usertoken?: string; usergroup?: string; term?: string } | undefined) {
    const message = useMessage();
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
        const currentFullUrl = window.location.href;
        loading.value = true;
        try {
            const response = await axios.get('https://cf-v1.uapis.cn/api/pay.php', {
                params: {
                    usertoken: userInfo?.usertoken,
                    name: '终身会员购买',
                    type: ttype,
                    money: payAmount.value,
                    return: currentFullUrl,
                },
            });
            const data = response.data;
            if (data?.success === true) {
                message.success('获取付款链接成功，正在跳转至支付页面，请稍等。');
                window.location.href = data.url;
            } else {
                message.error(data?.message);
            }
        } catch (error) {
            console.error('购买请求失败:', error);
            message.error('购买请求异常，请检查网络或稍后再试');
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

