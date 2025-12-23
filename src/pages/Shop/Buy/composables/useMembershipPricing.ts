import { computed } from 'vue';
import type { MembershipType } from '../types';
import { BASE_MONTHLY_COST, LIFETIME_MEMBER_PRICE, LIFETIME_TERM_DATE } from '../constants';

/**
 * 会员价格计算 composable
 */
export function useMembershipPricing(userInfo: { usergroup?: string; term?: string; integral?: number } | undefined) {
    const baseMonthlyCost = BASE_MONTHLY_COST;

    const getPrice = (group: MembershipType): number => {
        return LIFETIME_MEMBER_PRICE[group] || 0;
    };

    const isTemporaryUser = computed(() => {
        return userInfo?.usergroup !== '免费用户' && userInfo?.term !== LIFETIME_TERM_DATE;
    });

    const isFreeUser = computed(() => {
        return userInfo?.usergroup === '免费用户' || isTemporaryUser.value;
    });

    const calculateRemainingDays = (): number => {
        if (userInfo?.term === LIFETIME_TERM_DATE) return Infinity;
        if (!userInfo?.term) return 0;
        const today = new Date();
        const termDate = new Date(userInfo.term);
        const diffTime = termDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const remainingDays = computed(() => calculateRemainingDays());

    return {
        baseMonthlyCost,
        getPrice,
        isFreeUser,
        isTemporaryUser,
        remainingDays,
    };
}
