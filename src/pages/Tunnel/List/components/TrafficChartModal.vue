<template>
    <n-modal
        :show="show"
        @update:show="$emit('update:show', $event)"
        preset="card"
        title="近七日流量"
        style="max-width: 800px"
        :loading="loading"
    >
        <div ref="chartRefElement" style="width: 100%; height: 400px"></div>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Props {
    show: boolean;
    loading: boolean;
}

const props = defineProps<Props>();

defineEmits<{
    'update:show': [value: boolean];
}>();

const chartRefElement = ref<HTMLElement | null>(null);

// 暴露 chartRef 给父组件
defineExpose({
    chartRef: chartRefElement,
});
</script>
