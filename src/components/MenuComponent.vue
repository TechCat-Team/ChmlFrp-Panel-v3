<template>
  <n-menu style="text-align: left;" v-model:value="activeKey" :collapsed="collapsed" :collapsed-width="64"
    :collapsed-icon-size="22" :options="menuOptions" @update:value="handleUpdateValue" />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLayoutStore } from '@/stores/useLayout';
import { menuOptions } from '@/components/Options/Menu';  // 导入菜单选项数组

export default defineComponent({
  setup() {
    const layoutStore = useLayoutStore();
    const collapsed = computed(() => layoutStore.collapsed);

    const route = useRoute();
    const router = useRouter();
    const activeKey = ref(route.name as string);

    const handleUpdateValue = (key: string) => {
      activeKey.value = key;
      const targetOption = menuOptions.find(option => option.key === key);
      if (targetOption && typeof targetOption.label === 'function') {
        const labelVNode = targetOption.label();
        const to = (labelVNode.props).to;
        router.push(to);
      }
    };

    watch(route, () => {
      activeKey.value = route.name as string;
    });

    return {
      menuOptions,
      activeKey,
      handleUpdateValue,
      collapsed
    };
  }
});
</script>