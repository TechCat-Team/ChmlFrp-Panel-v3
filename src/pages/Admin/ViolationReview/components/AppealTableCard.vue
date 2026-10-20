<template>
    <n-card :title="title" :bordered="false">
        <n-data-table
            remote
            :columns="columns"
            :data="data"
            :pagination="pagination"
            :loading="loading"
            :bordered="false"
            :row-key="rowKey"
            :scroll-x="1260"
            striped
            @update:page="emit('update:page', $event)"
            @update:page-size="emit('update:page-size', $event)"
            @update:sorter="emit('update:sorter', $event)"
        />
    </n-card>
</template>

<script lang="ts" setup>
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import type { ViolationAppealRecord } from '@/api/v2/admin/violation';
import type { TableSorterState } from '../composables/useViolationList';

defineProps<{
    title: string;
    data: ViolationAppealRecord[];
    columns: DataTableColumns<ViolationAppealRecord>;
    pagination: PaginationProps;
    loading?: boolean;
}>();

const emit = defineEmits<{
    'update:page': [page: number];
    'update:page-size': [pageSize: number];
    'update:sorter': [sorter: TableSorterState];
}>();

const rowKey = (row: ViolationAppealRecord) => row.id;
</script>

<style scoped lang="scss">
:deep(.n-data-table) {
    .n-data-table-th {
        font-weight: 600;
    }
}
</style>
