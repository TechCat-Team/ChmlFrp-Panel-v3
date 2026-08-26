<template>
    <n-back-top :right="100" />
    <n-space vertical :size="16">
        <!-- 统计卡片 -->
        <ViolationStatsCards :stats="stats" />

        <!-- 复审列表 -->
        <n-card title="违规复审" :bordered="false">
            <n-space vertical :size="16">
                <!-- 筛选栏 -->
                <n-space justify="space-between">
                    <n-space>
                        <n-input
                            v-model:value="filters.keyword"
                            placeholder="搜索违规内容、用户或域名"
                            clearable
                            style="width: 260px"
                        >
                            <template #prefix>
                                <n-icon :component="SearchOutline" />
                            </template>
                        </n-input>
                        <n-select
                            v-model:value="filters.type"
                            placeholder="违规类型"
                            clearable
                            style="width: 140px"
                            :options="TYPE_OPTIONS"
                        />
                        <n-select
                            v-model:value="filters.status"
                            placeholder="复审状态"
                            clearable
                            style="width: 140px"
                            :options="STATUS_OPTIONS"
                        />
                        <n-date-picker
                            v-model:value="filters.timeRange"
                            type="datetimerange"
                            style="width: 320px"
                            clearable
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                        />
                        <n-button class="reset-btn" @click="handleReset">
                            <template #icon>
                                <n-icon :component="RefreshOutline" />
                            </template>
                            重置
                        </n-button>
                    </n-space>
                </n-space>

                <!-- 表格 -->
                <n-data-table
                    :columns="columns"
                    :data="filteredData"
                    :pagination="pagination"
                    :loading="false"
                    :bordered="false"
                    striped
                    :row-key="(row: Violation) => row.id"
                    :scroll-x="1200"
                />
            </n-space>
        </n-card>
    </n-space>

    <!-- 复审详情 -->
    <ViolationDetailModal
        :show="showDetailModal"
        :violation="current"
        @update:show="showDetailModal = $event"
        @review="handleReviewAction"
    />
</template>

<script lang="ts" setup>
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5';
import ViolationStatsCards from './components/ViolationStatsCards.vue';
import ViolationDetailModal from './components/ViolationDetailModal.vue';
import { useViolationList } from './composables/useViolationList';
import { useViolationDetail } from './composables/useViolationDetail';
import { useViolationTable } from './composables/useViolationTable';
import { STATUS_OPTIONS, TYPE_OPTIONS } from './constants';
import type { Violation } from './types';

const { filters, filteredData, stats, pagination, handleReset } = useViolationList();
const { showDetailModal, current, handleViewDetail, handleReviewAction } = useViolationDetail();
const columns = useViolationTable({
    onView: handleViewDetail,
    onReview: handleReviewAction,
});
</script>

<style scoped lang="scss">
.mono-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: var(--n-text-color-2);
}

:deep(.n-data-table) {
    .n-data-table-th {
        font-weight: 600;
    }
}
</style>
