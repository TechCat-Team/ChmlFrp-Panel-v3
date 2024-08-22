<template>
  <n-menu style="text-align: left;" v-model:value="activeKey" :collapsed="collapsed" :collapsed-width="64"
    :collapsed-icon-size="22" :options="userInfo? menuOptions : menuOptionsGuest" @update:value="handleUpdateValue" />
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { useLayoutStore } from '@/stores/useLayout';
import { menuOptions } from '@/components/Options/Menu';  // 导入菜单选项数组
import { menuOptions as menuOptionsGuest } from '@/components/Options/MenuGuest' // 导入游客菜单数据
// 获取登录信息
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

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
</script>