<template>
    <n-grid style="margin-top: 15px" cols="1 s:2 m:4" responsive="screen" :x-gap="15" :y-gap="20">
        <n-gi v-for="(card, index) in cards" :key="index">
            <n-card :style="cardStyle" :title="card.title" size="small">
                <n-flex justify="space-between" align="center">
                    <n-icon size="32">
                        <component :is="card.icon" />
                    </n-icon>
                    <n-statistic tabular-nums>
                        <n-number-animation :from="0" :to="card.value" :precision="card.precision" />
                        <template v-if="card.suffix" #suffix>
                            {{ card.suffix }}
                        </template>
                    </n-statistic>
                </n-flex>
            </n-card>
        </n-gi>
    </n-grid>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useStyleStore } from '@/stores/style';
import {
    LinkOutline,
    ServerOutline,
    ArrowUpCircleOutline,
    ArrowDownCircleOutline,
} from '@vicons/ionicons5';

interface Card {
    title: string;
    value: number;
    icon: any;
    precision: number;
    suffix?: string;
}

interface Props {
    cards: Card[];
}

defineProps<Props>();

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());
</script>

