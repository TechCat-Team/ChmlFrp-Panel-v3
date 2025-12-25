<template>
    <n-card hoverable class="perk-card">
        <n-flex vertical>
            <n-flex align="center">
                <n-icon size="20" color="#F56C6C">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                            fill="currentColor"
                        />
                    </svg>
                </n-icon>
                <n-text strong>四周年福利</n-text>
            </n-flex>
            <n-text depth="2" class="perk-desc">{{ perkMessage }}</n-text>
            <n-button v-if="canPurchase" tertiary type="error" size="small" class="perk-btn" @click="$emit('upgrade')">
                购买终身{{ membershipType }}
            </n-button>
        </n-flex>
    </n-card>
</template>

<script lang="ts" setup>
import type { MembershipType } from '../types';

interface Props {
    perkMessage: string;
    canPurchase: boolean;
    membershipType: MembershipType;
}

defineProps<Props>();
defineEmits<{
    upgrade: [];
}>();
</script>
