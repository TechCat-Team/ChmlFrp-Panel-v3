<template>
    <n-card :title="title" :bordered="false">
        <n-data-table
            :columns="columns"
            :data="data"
            :bordered="false"
            :loading="loading"
            :row-key="rowKey"
            :scroll-x="1260"
            :pagination="pagination"
            striped
        />
    </n-card>
</template>

<script lang="ts" setup>
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import type { AppealRecord } from '../constants';

withDefaults(
    defineProps<{
        title: string;
        data: AppealRecord[];
        columns: DataTableColumns<AppealRecord>;
        pagination?: PaginationProps;
        loading?: boolean;
    }>(),
    {
        pagination: () => ({ pageSize: 10 }),
    }
);

const rowKey = (row: AppealRecord) => row.id;
</script>

<style scoped lang="scss">
:deep(.n-data-table) {
    .n-data-table-th {
        font-weight: 600;
    }
}
</style>
