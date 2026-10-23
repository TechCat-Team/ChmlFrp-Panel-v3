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
                <n-button :type="hasPrivateKey ? 'default' : 'primary'" @click="showPrivateKeyModal = true">
                    <template #icon>
                        <n-icon :component="KeyOutline" />
                    </template>
                    {{ hasPrivateKey ? '解密私钥已设置' : '设置解密私钥' }}
                </n-button>
            </n-space>
        </n-card>

        <!-- 待审查 -->
        <ViolationTableCard
            title="违规审查"
            :data="pendingList"
            :columns="pendingColumns"
            :pagination="pendingPagination"
            :loading="pendingLoading"
            :checked-row-keys="checkedIds"
            @update:page="handlePendingPage"
            @update:page-size="handlePendingPageSize"
            @update:sorter="handlePendingSort"
            @update:checked-row-keys="checkedIds = $event"
        >
            <template #actions>
                <n-button type="error" secondary :disabled="!checkedIds.length" @click="handleBatchBanClick">
                    批量封禁{{ checkedIds.length ? ` (${checkedIds.length})` : '' }}
                </n-button>
            </template>
        </ViolationTableCard>

        <!-- 已封禁 -->
        <ViolationTableCard
            title="违规封禁"
            :data="bannedList"
            :columns="bannedColumns"
            :pagination="bannedPagination"
            :loading="bannedLoading"
            :checked-row-keys="bannedCheckedIds"
            @update:page="handleBannedPage"
            @update:page-size="handleBannedPageSize"
            @update:sorter="handleBannedSort"
            @update:checked-row-keys="bannedCheckedIds = $event"
        >
            <template #actions>
                <n-popconfirm @positive-click="handleBatchRelease">
                    <template #trigger>
                        <n-button
                            type="warning"
                            secondary
                            :disabled="!bannedCheckedIds.length || batchBanSubmitting"
                            :loading="batchBanSubmitting"
                        >
                            批量解除封禁{{ bannedCheckedIds.length ? ` (${bannedCheckedIds.length})` : '' }}
                        </n-button>
                    </template>
                    仅解除所选案件的封禁，其他有效限制将继续生效，确认执行？
                </n-popconfirm>
            </template>
        </ViolationTableCard>

        <!-- 申诉处理 -->
        <AppealTableCard
            title="申诉处理"
            :data="appealList"
            :columns="appealColumns"
            :pagination="appealPagination"
            :loading="appealLoading"
            @update:page="handleAppealPage"
            @update:page-size="handleAppealPageSize"
            @update:sorter="handleAppealSort"
        />

        <ViolationTableCard
            title="驳回记录"
            :data="rejectedList"
            :columns="columns"
            :pagination="rejectedPagination"
            :loading="rejectedLoading"
            @update:page="handleRejectedPage"
            @update:page-size="handleRejectedPageSize"
            @update:sorter="handleRejectedSort"
        />

        <!-- 放行记录 -->
        <ViolationTableCard
            title="放行记录"
            :data="passedList"
            :columns="columns"
            :pagination="passedPagination"
            :loading="passedLoading"
            @update:page="handlePassedPage"
            @update:page-size="handlePassedPageSize"
            @update:sorter="handlePassedSort"
        />
    </n-space>

    <!-- 审查详情 -->
    <ViolationDetailModal
        :show="showDetailModal"
        :violation="current"
        :loading="detailLoading"
        :reviewing="reviewing"
        @update:show="showDetailModal = $event"
        @review="handleReviewAction"
        @refresh="refreshDetail"
        @search-user="handleSearchUserFromDetail"
    />

    <!-- 申诉处理详情 -->
    <AppealDetailModal
        :show="showAppealDetailModal"
        :appeal="currentAppeal"
        :loading="appealDetailLoading"
        :reviewing="appealReviewing"
        @update:show="showAppealDetailModal = $event"
        @review="handleAppealReview"
        @view-ban-record="handleViewAppealBanRecord()"
        @search-user="handleSearchUserFromAppeal"
    />

    <!-- 证据解密私钥（仅保存在本地浏览器会话） -->
    <EvidencePrivateKeyModal v-model:show="showPrivateKeyModal" />

    <!-- 批量封禁 -->
    <BatchBanModal
        v-model:show="showBatchBanModal"
        :count="batchBanCount"
        :loading="batchBanSubmitting"
        @confirm="submitBatchBan"
    />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { KeyOutline, RefreshOutline, SearchOutline } from '@vicons/ionicons5';
import type { ViolationRecord } from '@/api/v2/admin/violation';
import ViolationTableCard from './components/ViolationTableCard.vue';
import ViolationDetailModal from './components/ViolationDetailModal.vue';
import EvidencePrivateKeyModal from './components/EvidencePrivateKeyModal.vue';
import AppealTableCard from './components/AppealTableCard.vue';
import AppealDetailModal from './components/AppealDetailModal.vue';
import BatchBanModal from './components/BatchBanModal.vue';
import { useViolationList } from './composables/useViolationList';
import { useViolationDetail } from './composables/useViolationDetail';
import { useViolationTable } from './composables/useViolationTable';
import { useViolationBatchReview } from './composables/useViolationBatchReview';
import { useEvidencePrivateKey } from './composables/useEvidencePrivateKey';
import { useAppealList } from './composables/useAppealList';
import { TYPE_OPTIONS } from './constants';

const showPrivateKeyModal = ref(false);
const { hasPrivateKey } = useEvidencePrivateKey();

const {
    filters,
    pendingList,
    bannedList,
    passedList,
    rejectedList,
    rejectedLoading,
    rejectedPagination,
    handleRejectedPage,
    handleRejectedPageSize,
    pendingLoading,
    bannedLoading,
    passedLoading,
    pendingPagination,
    bannedPagination,
    passedPagination,
    handlePendingPage,
    handleBannedPage,
    handlePassedPage,
    handlePendingPageSize,
    handleBannedPageSize,
    handlePassedPageSize,
    handlePendingSort,
    handleBannedSort,
    handlePassedSort,
    handleRejectedSort,
    handleReset,
    searchByUser,
    loadAll,
} = useViolationList();

const { showDetailModal, current, detailLoading, reviewing, handleViewDetail, handleReviewAction, refreshDetail } =
    useViolationDetail(loadAll);

// 详情弹窗中点击关联用户名，关闭弹窗并按该用户搜索全部违纪记录
const handleSearchUserFromDetail = (username: string) => {
    showDetailModal.value = false;
    searchByUser(username);
};

const columns = useViolationTable({
    onView: handleViewDetail,
    onReview: (_action, row) => {
        void handleViewDetail(row);
    },
    onSearchUser: searchByUser,
});

// 待审查 / 违规封禁表格额外带勾选列，用于批量封禁与批量解除封禁
const pendingColumns = computed<DataTableColumns<ViolationRecord>>(() => [
    { type: 'selection' },
    ...columns,
]);
const bannedColumns = computed<DataTableColumns<ViolationRecord>>(() => [
    { type: 'selection' },
    ...columns,
]);
const checkedIds = ref<Array<string | number>>([]);
const bannedCheckedIds = ref<Array<string | number>>([]);
const batchBanCount = ref(0);

const {
    showModal: showBatchBanModal,
    submitting: batchBanSubmitting,
    open: openBatchBan,
    submit: submitBatchBan,
    release: releaseBatchBan,
} = useViolationBatchReview(() => {
    checkedIds.value = [];
    bannedCheckedIds.value = [];
    loadAll();
});

const handleBatchBanClick = () => {
    batchBanCount.value = checkedIds.value.length;
    openBatchBan(checkedIds.value.map(Number));
};

const handleBatchRelease = () => {
    const ids = bannedCheckedIds.value.map(Number);
    if (!ids.length) return;
    void releaseBatchBan(ids);
};

// 翻页或筛选后移除已不在当前列表中的勾选项
watch(pendingList, (list) => {
    const existing = new Set(list.map((row) => row.id));
    checkedIds.value = checkedIds.value.filter((key) => existing.has(Number(key)));
});
watch(bannedList, (list) => {
    const existing = new Set(list.map((row) => row.id));
    bannedCheckedIds.value = bannedCheckedIds.value.filter((key) => existing.has(Number(key)));
});

// 申诉处理，与违规列表共用同一份筛选条件
const handleViewAppealBanRecord = (row?: { ban_record_id: number } | null) => {
    const id = row?.ban_record_id ?? currentAppeal.value?.ban_record_id;
    if (!id) return;
    showAppealDetailModal.value = false;
    void handleViewDetail({ id });
};

const {
    list: appealList,
    loading: appealLoading,
    columns: appealColumns,
    pagination: appealPagination,
    showDetailModal: showAppealDetailModal,
    current: currentAppeal,
    detailLoading: appealDetailLoading,
    reviewing: appealReviewing,
    load: loadAppeals,
    changePage: handleAppealPage,
    changePageSize: handleAppealPageSize,
    changeSorter: handleAppealSort,
    handleReview: handleAppealReview,
} = useAppealList(filters, handleViewAppealBanRecord);

// 申诉详情中点击关联用户名，关闭弹窗并按该用户搜索全部违纪记录
const handleSearchUserFromAppeal = (username: string) => {
    showAppealDetailModal.value = false;
    searchByUser(username);
};

onMounted(() => {
    loadAll();
    void loadAppeals();
});
</script>
