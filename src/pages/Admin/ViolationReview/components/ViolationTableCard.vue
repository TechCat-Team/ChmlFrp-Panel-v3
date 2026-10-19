<template>
    <n-card :title="title" :bordered="false">
        <n-data-table
            remote
            :columns="columns"
            :data="data"
            :pagination="pagination"
            :loading="loading"
            :bordered="false"
            striped
            :row-key="rowKey"
            :scroll-x="1340"
            @update:page="emit('update:page', $event)"
            @update:page-size="emit('update:page-size', $event)"
        />
    </n-card>
</template>

<script lang="ts" setup>
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import type { ViolationRecord } from '@/api/v2/admin/violation';

defineProps<{
    title: string;
    data: ViolationRecord[];
    columns: DataTableColumns<ViolationRecord>;
    pagination: PaginationProps;
    loading?: boolean;
}>();

const emit = defineEmits<{
    'update:page': [page: number];
    'update:page-size': [pageSize: number];
}>();

const rowKey = (row: ViolationRecord) => row.id;
</script>

<style scoped lang="scss">
:deep(.n-data-table) {
    .n-data-table-th {
        font-weight: 600;
    }
}

:deep(.violation-mono) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: var(--n-text-color-2);
}
</style>
