<template>
    <n-card>
        <n-space justify="space-between">
            <div style="display: flex; align-items: center">
                <n-avatar
                    :size="72"
                    round
                    :style="{ display: isHidden ? 'none' : 'flex' }"
                    style="flex-shrink: 0"
                    :src="userInfo?.userimg"
                />
                <div :style="textStyle">
                    <h3 style="margin: 0">{{ greeting }}</h3>
                    <n-skeleton v-if="loading" width="100%" style="margin-top: 8px" :sharp="false" text />
                    <p v-else style="margin: 0; margin-top: 4px">{{ apiText }}</p>
                </div>
            </div>
            <slot />
        </n-space>
    </n-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

interface Props {
    greeting: string;
    apiText: string;
    loading: boolean;
    userInfo?: {
        userimg?: string;
    };
}

defineProps<Props>();

const screenStore = useScreenStore();
const { isHidden, screenWidth } = storeToRefs(screenStore);

const textStyle = computed(() => ({
    marginLeft: screenWidth.value >= 600 ? '16px' : '0',
    textAlign: 'left' as const,
}));
</script>

