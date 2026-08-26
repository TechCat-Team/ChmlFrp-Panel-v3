<template>
    <n-card :title="title" :bordered="false">
        <n-data-table
            :columns="columns"
            :data="data"
            :pagination="pagination"
            :bordered="false"
            striped
            :row-key="(row: Violation) => row.id"
            :scroll-x="1200"
        />
    </n-card>
</template>

<script lang="ts" setup>
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import type { Violation } from '../types';

defineProps<{
    title: string;
    data: Violation[];
    columns: DataTableColumns<Violation>;
    pagination: PaginationProps;
}>();
</script>

<style scoped lang="scss">
:deep(.n-data-table) {
    .n-data-table-th {
        font-weight: 600;
    }
}
</style>
