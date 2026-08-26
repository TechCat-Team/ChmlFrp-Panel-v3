<template>
    <n-back-top :right="100" />
    <n-space vertical :size="16">
        <!-- 全局筛选栏 -->
        <n-card :bordered="false">
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
        </n-card>

        <!-- 待审查 -->
        <ViolationTableCard
            title="违规审查"
            :data="pendingList"
            :columns="columns"
            :pagination="pendingPagination"
        />

        <!-- 已封禁 -->
        <ViolationTableCard
            title="违规封禁"
            :data="bannedList"
            :columns="columns"
            :pagination="bannedPagination"
        />

        <!-- 放行记录 -->
        <ViolationTableCard
            title="放行记录"
            :data="passedList"
            :columns="columns"
            :pagination="passedPagination"
        />
    </n-space>

    <!-- 审查详情 -->
    <ViolationDetailModal
        :show="showDetailModal"
        :violation="current"
        @update:show="showDetailModal = $event"
        @review="handleReviewAction"
    />
</template>

<script lang="ts" setup>
import { SearchOutline, RefreshOutline } from '@vicons/ionicons5';
import ViolationTableCard from './components/ViolationTableCard.vue';
import ViolationDetailModal from './components/ViolationDetailModal.vue';
import { useViolationList } from './composables/useViolationList';
import { useViolationDetail } from './composables/useViolationDetail';
import { useViolationTable } from './composables/useViolationTable';
import { TYPE_OPTIONS } from './constants';

const {
    filters,
    pendingList,
    bannedList,
    passedList,
    pendingPagination,
    bannedPagination,
    passedPagination,
    handleReset,
} = useViolationList();
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
</style>
