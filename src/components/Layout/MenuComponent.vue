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

// 菜单项结构（兼容分组与分割线等非链接项）
interface MenuOption {
    key?: string;
    label?: unknown;
    children?: MenuOption[];
}

const menuOptions = computed(() => computedMenuOptions.value as MenuOption[]);

// 递归查找菜单项（支持多级子菜单）
const findOptionByKey = (options: MenuOption[], key: string): MenuOption | undefined => {
    for (const option of options) {
        if (option.key === key) {
            return option;
        }
        if (Array.isArray(option.children)) {
            const childOption = findOptionByKey(option.children, key);
            if (childOption) {
                return childOption;
            }
        }
    }
    return undefined;
};

// 判断菜单项是否为外部链接（如“帮助文档”）
const isExternalLink = (option: MenuOption): boolean => {
    if (typeof option.label !== 'function') {
        return false;
    }
    const vnode = (option.label as () => { props: { href?: string; to?: unknown } | null })();
    const props = vnode.props;
    return Boolean(props?.href) && !props?.to;
};

const handleUpdateValue = (key: string) => {
    const targetOption = findOptionByKey(menuOptions.value, key);
    // 外部链接点击后不会发生路由跳转，恢复为当前路由对应的选中项，避免高亮残留
    if (targetOption && isExternalLink(targetOption)) {
        activeKey.value = route.name as string;
        return;
    }
    activeKey.value = key;
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
