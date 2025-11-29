<template>
    <n-menu
        style="text-align: left"
        v-model:value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="computedMenuOptions"
        @update:value="handleUpdateValue"
    />
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLayoutStore } from '@/stores/useLayout';
import { computedMenuOptions } from '@/components/Options/Menu';

const layoutStore = useLayoutStore();
const collapsed = computed(() => layoutStore.collapsed);

const route = useRoute();
const router = useRouter();
const activeKey = ref(route.name as string);

const handleUpdateValue = (key: string) => {
    activeKey.value = key;
    const targetOption = computedMenuOptions.value.find((option) => option.key === key);
    if (targetOption && typeof targetOption.label === 'function') {
        const labelVNode = targetOption.label();
        const props = labelVNode.props as Partial<Record<string, unknown>> & { to?: string };
        if (props.to) {
            router.push(props.to);
        }
    }
};

watch(route, () => {
    activeKey.value = route.name as string;
});
</script>
