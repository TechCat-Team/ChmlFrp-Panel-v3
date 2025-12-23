import { ref, computed } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import type { MembershipType } from '../types';
import { useMembershipPricing } from './useMembershipPricing';
import { LIFETIME_TERM_DATE } from '../constants';

/**
 * 会员升级 composable
 */
export function useMembershipUpgrade(
    userInfo: { usertoken?: string; integral?: number; usergroup?: string; term?: string } | undefined
) {
    const message = useMessage();
    const dialog = useDialog();
    const userStore = useUserStore();
    const { baseMonthlyCost, remainingDays } = useMembershipPricing(userInfo);

    const loading = ref(false);
    const upgradeOption = ref<MembershipType | ''>('');

    const upgradeCost = computed(() => {
        if (
            userInfo?.usergroup === '免费用户' ||
            userInfo?.term === LIFETIME_TERM_DATE ||
            userInfo?.usergroup === '超级会员'
        ) {
            return 0;
        }

        const remaining = remainingDays.value;
        if (remaining <= 0 || !userInfo?.usergroup) return 0;

        const dailyCost = {
            普通会员: baseMonthlyCost['普通会员'] / 30,
            高级会员: baseMonthlyCost['高级会员'] / 30,
            超级会员: baseMonthlyCost['超级会员'] / 30,
        } as Record<MembershipType, number>;

        const currentRemainingValue = dailyCost[userInfo.usergroup as MembershipType] * remaining;
        const targetMembership = upgradeOption.value;
        if (!targetMembership) return 0;

        const targetCost = dailyCost[targetMembership] * remaining;
        const cost = targetCost - currentRemainingValue;
        return cost > 0 ? Math.ceil(cost) : 0;
    });

    const handleUpgrade = async () => {
        if (!upgradeOption.value) return;

        loading.value = true;
        try {
            const response = await axios.get('https://cf-v1.uapis.cn/api/tcsj.php', {
                params: {
                    usertoken: userInfo?.usertoken,
                    package: upgradeOption.value,
                },
            });
            const data = response.data;
            if (data?.success === true) {
                userStore.setUser({ integral: (userInfo?.integral ?? 0) - data.xhjf });
                userStore.setUser({ usergroup: data.package });
                userStore.setUser({ tunnel: data.tunnel });
                userStore.setUser({ bandwidth: data.bandwidth });
                dialog.success({
                    title: '会员升级成功',
                    content: '您升级到了' + data.package + '，消耗了' + data.xhjf + '点积分，感谢您的支持！',
                    positiveText: '确认',
                    onPositiveClick: () => {
                        message.success('再次感谢您对ChmlFrp的支持！');
                    },
                });
            } else {
                message.error(data?.message);
            }
        } catch (error) {
            console.error('升级请求失败:', error);
            message.error('升级请求异常，请检查网络或稍后再试');
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        upgradeOption,
        upgradeCost,
        handleUpgrade,
    };
}
