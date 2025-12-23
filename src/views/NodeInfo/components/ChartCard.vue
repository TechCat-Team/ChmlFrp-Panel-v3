<template>
    <n-card>
        <div :id="chartId" :style="{ width: '100%', height: CHART_HEIGHT }"></div>
        <n-descriptions v-if="descriptions" label-placement="top">
            <n-descriptions-item v-for="(value, label) in descriptions" :key="label" :label="label">
                {{ value }}
            </n-descriptions-item>
        </n-descriptions>
    </n-card>
</template>

<script lang="ts" setup>
import { CHART_HEIGHT } from '../constants';

interface Props {
    chartId: string;
    descriptions?: Record<string, string | number | undefined>;
}

defineProps<Props>();
</script>
