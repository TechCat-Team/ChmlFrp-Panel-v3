<template>
    <n-drawer :show="show" @update:show="$emit('update:show', $event)" :width="502" style="max-width: 100%">
        <n-drawer-content title="会员购买" closable>
            <n-tabs type="segment" animated>
                <n-tab-pane name="1" tab="会员购买">
                    <n-space vertical size="large">
                        <n-card title="选择会员类型">
                            <n-radio-group :value="selectedMembership" @update:value="$emit('update:selectedMembership', $event)">
                                <n-space justify="space-between" size="large">
                                    <n-radio value="普通会员" label="普通会员">
                                        <n-space align="center">
                                            <n-tag type="info" size="small">普通会员</n-tag>
                                        </n-space>
                                    </n-radio>
                                    <n-radio value="高级会员" label="高级会员">
                                        <n-space align="center">
                                            <n-tag type="success" size="small">高级会员</n-tag>
                                        </n-space>
                                    </n-radio>
                                    <n-radio value="超级会员" label="超级会员">
                                        <n-space align="center">
                                            <n-tag type="warning" size="small">超级会员</n-tag>
                                        </n-space>
                                    </n-radio>
                                </n-space>
                            </n-radio-group>
                        </n-card>

                        <n-card title="选择购买时长">
                            <n-radio-group :value="selectedDuration" @update:value="$emit('update:selectedDuration', $event)">
                                <n-space justify="space-between">
                                    <n-radio value="1" label="1个月"></n-radio>
                                    <n-radio value="3" label="3个月"></n-radio>
                                    <n-radio value="6" label="6个月"></n-radio>
                                    <n-radio value="12" label="1年"></n-radio>
                                </n-space>
                            </n-radio-group>
                        </n-card>

                        <n-card title="积分详情" hoverable>
                            <n-space vertical size="small">
                                <n-space justify="space-between">
                                    <n-text>当前积分：</n-text>
                                    <n-text strong>{{ currentPoints }}</n-text>
                                </n-space>
                                <n-space justify="space-between">
                                    <n-text>本次消费：</n-text>
                                    <n-text strong type="error">{{ costPoints }}</n-text>
                                </n-space>
                                <n-divider />
                                <n-space justify="space-between">
                                    <n-text>购买后剩余：</n-text>
                                    <n-text strong type="success">{{ remainingPoints }}</n-text>
                                </n-space>
                            </n-space>
                        </n-card>

                        <n-button
                            type="primary"
                            block
                            @click="$emit('purchase')"
                            :loading="loading"
                            :disabled="!selectedMembership || !selectedDuration"
                        >
                            {{ costPoints > currentPoints ? '前往充值积分' : '确认购买' }}
                        </n-button>
                    </n-space>
                </n-tab-pane>

                <n-tab-pane name="2" tab="会员升级">
                    <n-space vertical size="large">
                        <n-alert
                            v-if="showUpgradeAlert"
                            type="info"
                            title="会员升级说明"
                        >
                            您当前是{{ userGroup }}，剩余 {{ remainingDays }} 天，升级可享受更多权益
                        </n-alert>

                        <n-card title="可升级选项">
                            <n-space vertical size="large">
                                <template v-if="userGroup === '免费用户'">
                                    <n-text>您当前为免费用户，无法升级，如需会员请先购买</n-text>
                                </template>
                                <template v-else-if="isLifetime">
                                    <n-text>您当前为终身会员，无法进行常规升级</n-text>
                                </template>
                                <template v-else-if="userGroup === '普通会员'">
                                    <n-radio-group :value="upgradeOption" @update:value="$emit('update:upgradeOption', $event)">
                                        <n-space justify="space-between">
                                            <n-radio value="高级会员" label="升级到高级会员">
                                                <n-space align="center">
                                                    <n-tag type="success" size="small">高级会员</n-tag>
                                                </n-space>
                                            </n-radio>
                                            <n-radio value="超级会员" label="升级到超级会员">
                                                <n-space align="center">
                                                    <n-tag type="warning" size="small">超级会员</n-tag>
                                                </n-space>
                                            </n-radio>
                                        </n-space>
                                    </n-radio-group>
                                </template>
                                <template v-else-if="userGroup === '高级会员'">
                                    <n-radio-group :value="upgradeOption" @update:value="$emit('update:upgradeOption', $event)">
                                        <n-space justify="space-between">
                                            <n-radio value="超级会员" label="升级到超级会员">
                                                <n-space align="center">
                                                    <n-tag type="warning" size="small">超级会员</n-tag>
                                                </n-space>
                                            </n-radio>
                                        </n-space>
                                    </n-radio-group>
                                </template>
                                <template v-else>
                                    <n-text>您已经是最高级会员，无需升级</n-text>
                                </template>
                            </n-space>
                        </n-card>

                        <n-card title="积分详情" hoverable>
                            <n-space vertical size="small">
                                <n-space justify="space-between">
                                    <n-text>当前积分：</n-text>
                                    <n-text strong>{{ currentPoints }}</n-text>
                                </n-space>
                                <n-space justify="space-between">
                                    <n-text>升级费用：</n-text>
                                    <n-text strong type="error">{{ upgradeCost }}</n-text>
                                </n-space>
                                <n-divider />
                                <n-space justify="space-between">
                                    <n-text>升级后剩余：</n-text>
                                    <n-text strong type="success">{{ remainingPointsAfterUpgrade }}</n-text>
                                </n-space>
                            </n-space>
                        </n-card>

                        <n-button
                            type="primary"
                            block
                            :disabled="!upgradeOption"
                            @click="$emit('upgrade')"
                            :loading="loading"
                        >
                            {{ upgradeCost > currentPoints ? '前往充值积分' : '确认升级' }}
                        </n-button>
                    </n-space>
                </n-tab-pane>
            </n-tabs>
        </n-drawer-content>
    </n-drawer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { MembershipType, DurationType } from '../types';

interface Props {
    show: boolean;
    selectedMembership: MembershipType | '';
    selectedDuration: DurationType | null;
    upgradeOption: MembershipType | '';
    currentPoints: number;
    costPoints: number;
    remainingPoints: number;
    upgradeCost: number;
    remainingPointsAfterUpgrade: number;
    remainingDays: number;
    userGroup?: string;
    isLifetime?: boolean;
    loading: boolean;
}

const props = defineProps<Props>();

const showUpgradeAlert = computed(() => {
    return !props.isLifetime && props.userGroup !== '免费用户' && props.userGroup !== '超级会员';
});

defineEmits<{
    'update:show': [value: boolean];
    'update:selectedMembership': [value: MembershipType | ''];
    'update:selectedDuration': [value: DurationType | null];
    'update:upgradeOption': [value: MembershipType | ''];
    purchase: [];
    upgrade: [];
}>();
</script>

