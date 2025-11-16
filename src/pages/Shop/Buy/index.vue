<template>
    <n-back-top :right="100" />
    <n-card size="small">
        <n-alert title="购买须知" type="warning">
            {{ PURCHASE_NOTICE }}
        </n-alert>
    </n-card>
    <n-grid style="margin-top: 12px" :x-gap="12" :y-gap="12" cols="1 s:2 m:3 l:4" responsive="screen">
        <n-grid-item>
            <MembershipCard
                membership-type="免费用户"
                :features="MEMBERSHIP_FEATURES['免费用户']"
                :price-text="MEMBERSHIP_PRICE_TEXT['免费用户']"
                :button-text="BUTTON_TEXT.REGISTER_FREE"
                disabled
            />
            <AnniversaryCard />
        </n-grid-item>
        <n-grid-item v-for="membershipType in MEMBERSHIP_TYPES" :key="membershipType">
            <MembershipCard
                :membership-type="membershipType"
                :features="MEMBERSHIP_FEATURES[membershipType]"
                :price-text="MEMBERSHIP_PRICE_TEXT[membershipType]"
                :button-text="BUTTON_TEXT.PURCHASE_NOW"
                button-type="primary"
                @purchase="handlePurchaseClick(membershipType)"
            />
            <PerkCard
                :perk-message="getPerkMessage(membershipType)"
                :can-purchase="canPurchase(membershipType)"
                :membership-type="membershipType"
                @upgrade="openUpgradeModal(membershipType)"
            />
        </n-grid-item>
    </n-grid>
    <LifetimeMemberModal
        v-model:show="lifetimeShowModal"
        :target-group="lifetimeTargetGroup"
        :user-group="userInfo?.usergroup"
        :is-lifetime="userInfo?.term === LIFETIME_TERM_DATE"
        :pay-amount="lifetimePayAmount"
        :loading="lifetimeLoading"
        @pay="handleLifetimePayAction"
    />
    <PurchaseDrawer
        v-model:show="purchaseDrawerShow"
        v-model:selected-membership="selectedMembership"
        v-model:selected-duration="selectedDuration"
        v-model:upgrade-option="upgradeOption"
        :current-points="currentPoints"
        :cost-points="costPoints"
        :remaining-points="remainingPoints"
        :upgrade-cost="upgradeCost"
        :remaining-points-after-upgrade="remainingPointsAfterUpgrade"
        :remaining-days="remainingDays"
        :user-group="userInfo?.usergroup"
        :is-lifetime="userInfo?.term === LIFETIME_TERM_DATE"
        :loading="purchaseLoading || upgradeLoading"
        @purchase="handlePurchase"
        @upgrade="handleUpgrade"
    />
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import { useMembershipPricing } from './composables/useMembershipPricing';
import { useMembershipPurchase } from './composables/useMembershipPurchase';
import { useMembershipUpgrade } from './composables/useMembershipUpgrade';
import { useLifetimePurchase } from './composables/useLifetimePurchase';
import { useTradeStatus } from './composables/useTradeStatus';
import MembershipCard from './components/MembershipCard.vue';
import AnniversaryCard from './components/AnniversaryCard.vue';
import PerkCard from './components/PerkCard.vue';
import LifetimeMemberModal from './components/LifetimeMemberModal.vue';
import PurchaseDrawer from './components/PurchaseDrawer.vue';
import type { MembershipType } from './types';
import {
    PURCHASE_NOTICE,
    MEMBERSHIP_FEATURES,
    MEMBERSHIP_TYPES,
    PAYMENT_CONFIG,
    MEMBERSHIP_PRICE_TEXT,
    BUTTON_TEXT,
    LIFETIME_TERM_DATE,
} from './constants';

const userStore = useUserStore();
const userInfo = userStore.userInfo;
const router = useRouter();
const message = useMessage();

// 检查支付回调状态
useTradeStatus();

// 价格计算
const { baseMonthlyCost, remainingDays } = useMembershipPricing(userInfo || undefined);

// 会员购买
const {
    loading: purchaseLoading,
    selectedMembership,
    selectedDuration,
    handlePurchase: handlePurchaseAction,
} = useMembershipPurchase(userInfo || undefined);

// 会员升级
const { loading: upgradeLoading, upgradeOption, upgradeCost, handleUpgrade: handleUpgradeAction } =
    useMembershipUpgrade(userInfo || undefined);

// 终身会员购买
const {
    showModal: lifetimeShowModal,
    loading: lifetimeLoading,
    targetGroup: lifetimeTargetGroup,
    payAmount: lifetimePayAmount,
    getPerkMessage,
    canPurchase,
    openUpgradeModal,
    handlePay: handleLifetimePayAction,
} = useLifetimePurchase(userInfo || undefined);

// 当前积分
const currentPoints = userInfo?.integral || 0;

// 计算本次消费积分
const costPoints = computed(() => {
    if (!selectedMembership.value || !selectedDuration.value) return 0;
    const membership = selectedMembership.value as MembershipType;
    if (membership === '免费用户') return 0;
    const monthlyCost = baseMonthlyCost[membership];
    const months = Number(selectedDuration.value);
    return monthlyCost * months;
});

// 计算购买后剩余积分
const remainingPoints = computed(() => {
    return currentPoints - costPoints.value;
});

// 升级后剩余积分
const remainingPointsAfterUpgrade = computed(() => {
    return currentPoints - upgradeCost.value;
});

// 购买抽屉状态
const purchaseDrawerShow = ref(false);

// 同步购买抽屉中的选择到 composable
watch(
    () => purchaseDrawerShow.value,
    (val) => {
        if (!val) {
            selectedMembership.value = '';
            selectedDuration.value = null;
            upgradeOption.value = '';
        }
    }
);

// 处理购买点击
const handlePurchaseClick = (membershipType: MembershipType) => {
    selectedMembership.value = membershipType;
    purchaseDrawerShow.value = true;
};

// 处理购买
const handlePurchase = async () => {
    if (costPoints.value > currentPoints) {
        goToTopUp('purchase');
        return;
    }
    await handlePurchaseAction();
    purchaseDrawerShow.value = false;
};

// 处理升级
const handleUpgrade = async () => {
    if (upgradeCost.value > currentPoints) {
        goToTopUp('upgrade');
        return;
    }
    await handleUpgradeAction();
    purchaseDrawerShow.value = false;
};

// 前往充值积分
const goToTopUp = (type: 'purchase' | 'upgrade') => {
    const missingPoints = type === 'purchase' ? costPoints.value - currentPoints : upgradeCost.value - currentPoints;
    const requiredAmount = Math.max(
        Math.ceil(missingPoints / PAYMENT_CONFIG.POINTS_PER_YUAN),
        PAYMENT_CONFIG.MIN_TOP_UP_AMOUNT
    );
    
    message.warning('积分不足，正在跳转到充值页面...(已自动填入缺失金额)');
    router.push({
        path: '/shop/top-up',
        query: {
            points: missingPoints.toString(),
            amount: requiredAmount.toString(),
        },
    });
};
</script>

<style>
.perk-card {
    margin-top: 12px;
}

.perk-btn {
    width: 100%;
}

.perk-desc {
    font-size: 14px;
}
</style>

