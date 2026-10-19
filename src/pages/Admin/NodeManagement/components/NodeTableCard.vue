<template>
    <n-space vertical :size="16" style="margin-bottom: 16px">
        <n-input
            v-model:value="searchValue"
            placeholder="搜索节点名、域名或真实IP...（支持拼音搜索）"
            clearable
            @input="emit('search')"
        >
            <template #prefix>
                <n-icon :component="SearchIcon" />
            </template>
        </n-input>
    </n-space>
    <n-watermark
        :content="`禁止截图\n${username}`"
        cross
        selectable
        :font-size="16"
        :line-height="16"
        :width="192"
        :height="128"
        :x-offset="12"
        :y-offset="28"
        :rotate="-15"
        :font-color="'rgba(128, 128, 128, 0.1)'"
    >
        <n-data-table
            :columns="columns"
            :data="data"
            :loading="loading"
            :pagination="pagination"
            :scroll-x="1400"
            striped
            :single-line="false"
            size="medium"
            :row-props="rowProps"
        />
    </n-watermark>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { NIcon } from 'naive-ui';
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { Search as SearchIcon } from '@vicons/ionicons5';
import { useUserStore } from '@/stores/user';
import type { Node } from '../types';

const props = defineProps<{
    searchQuery: string;
    columns: DataTableColumns<Node>;
    data: Node[];
    loading?: boolean;
    pagination: PaginationProps;
    rowProps: (row: Node) => HTMLAttributes;
}>();

const emit = defineEmits<{
    'update:searchQuery': [value: string];
    search: [];
}>();

const searchValue = computed({
    get: () => props.searchQuery,
    set: (value: string) => emit('update:searchQuery', value),
});

const userStore = useUserStore();
const username = computed(() => userStore.userInfo?.username ?? '');
</script>
