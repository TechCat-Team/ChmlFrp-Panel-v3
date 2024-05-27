<template>
  <n-menu style="text-align: left;" v-model:value="activeKey" :collapsed="collapsed" :collapsed-width="64"
    :collapsed-icon-size="22" :options="menuOptions" @update:value="handleUpdateValue" />
</template>

<script lang="ts">
import { defineComponent, ref, h, watch, computed, Component } from 'vue';
import { NIcon, MenuOption } from 'naive-ui';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useLayoutStore } from '@/stores/useLayout';
import {
  StatsChartOutline as StatsChartIcon,
  DocumentTextOutline as DocumentTextIcon,
  CloudDownloadOutline as CloudDownloadIcon,
  GridOutline as GridIcon,
  ListOutline as ListIcon,
  HomeOutline as HomeIcon,
  PersonCircleOutline
} from '@vicons/ionicons5';

// 菜单图标渲染函数
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// 菜单选项数组
const menuOptions: MenuOption[] = [
  {
    label: () => h(
      RouterLink,
      {
        to: { name: '首页' }
      },
      { default: () => '首页' }
    ),
    key: '首页',
    icon: renderIcon(HomeIcon)
  },
  {
    type: 'divider',
    props: {
      style: { marginLeft: '32px' }
    }
  },
  {
    label: () => h(
      RouterLink,
      {
        to: { name: '个人资料' }
      },
      { default: () => '个人资料' }
    ),
    key: '个人资料',
    icon: renderIcon(PersonCircleOutline)
  },
  {
    label: '隧道管理',
    key: 'dance-dance-dance',
    icon: renderIcon(ListIcon),
    children: [
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '隧道列表' }
          },
          { default: () => '隧道列表' }
        ),
        key: '隧道列表',
        icon: renderIcon(GridIcon)
      },
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '配置文件' }
          },
          { default: () => '配置文件' }
        ),
        key: '配置文件',
        icon: renderIcon(DocumentTextIcon)
      },
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '节点状态' }
          },
          { default: () => '节点状态' }
        ),
        key: '节点状态',
        icon: renderIcon(StatsChartIcon)
      },
      {
        label: () => h(
          RouterLink,
          {
            to: { name: '软件下载' }
          },
          { default: () => '软件下载' }
        ),
        key: '软件下载',
        icon: renderIcon(CloudDownloadIcon)
      }
    ]
  }
];

export default defineComponent({
  setup() {
    // 使用 Pinia store 管理 collapsed 状态
    const layoutStore = useLayoutStore();
    const collapsed = computed(() => layoutStore.collapsed);

    // 获取当前路由对象
    const route = useRoute();
    // 获取路由实例
    const router = useRouter();
    // 定义一个响应式变量保存当前活动的菜单键
    const activeKey = ref(route.name as string);

    // 定义处理菜单选项更新的函数
    const handleUpdateValue = (key: string) => {
      activeKey.value = key; // 更新菜单键
      const targetOption = menuOptions.find(option => option.key === key); // 查找对应的菜单选项
      if (targetOption && typeof targetOption.label === 'function') {
        const labelVNode = targetOption.label() as any;
        const to = (labelVNode.props as any).to; // 访问 VNode 的 props
        router.push(to); // 导航到对应的路由
      }
    };

    // 监听路由变化，更新选中菜单
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