<template>
    <n-card hoverable>
        <template #header>{{ membershipType }}</template>
        <n-ul>
            <n-li>{{ features.nodeAccess }}</n-li>
            <n-tooltip trigger="hover">
                <template #trigger>
                    <n-li>{{ features.domesticSpeed }}</n-li>
                </template>
                单位Mbps
            </n-tooltip>
            <n-tooltip trigger="hover">
                <template #trigger>
                    <n-li>{{ features.overseasSpeed }}</n-li>
                </template>
                单位Mbps
            </n-tooltip>
            <n-li>{{ features.tunnelCount }}</n-li>
            <n-li>{{ features.trafficLimit }}</n-li>
            <n-li>{{ features.subdomainCount }}</n-li>
            <n-tooltip v-if="features.supportTooltip" trigger="hover">
                <template #trigger>
                    <n-li>{{ features.support }}</n-li>
                </template>
                {{ features.supportTooltip }}
            </n-tooltip>
            <n-li v-else>{{ features.support }}</n-li>
        </n-ul>
        <template #action>
            <n-flex justify="space-between">
                <n-p>{{ priceText }}</n-p>
                <n-button
                    v-if="!disabled"
                    @click="$emit('purchase')"
                    round
                    :type="buttonType"
                    size="small"
                >
                    {{ buttonText }}
                </n-button>
                <n-button v-else round disabled type="error" size="small">{{ buttonText }}</n-button>
            </n-flex>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import type { MembershipType } from '../types';

interface Props {
    membershipType: MembershipType;
    features: {
        nodeAccess: string;
        domesticSpeed: string;
        overseasSpeed: string;
        tunnelCount: string;
        trafficLimit: string;
        subdomainCount: string;
        support: string;
        supportTooltip?: string;
    };
    priceText: string;
    buttonText: string;
    buttonType?: 'primary' | 'error';
    disabled?: boolean;
}

defineProps<Props>();
defineEmits<{
    purchase: [];
}>();
</script>

