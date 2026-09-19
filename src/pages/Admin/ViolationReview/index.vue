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
            :columns="columns"
            :pagination="pendingPagination"
            :loading="pendingLoading"
            @update:page="handlePendingPage"
            @update:page-size="handlePendingPageSize"
        />

        <!-- 已封禁 -->
        <ViolationTableCard
            title="违规封禁"
            :data="bannedList"
            :columns="columns"
            :pagination="bannedPagination"
            :loading="bannedLoading"
            @update:page="handleBannedPage"
            @update:page-size="handleBannedPageSize"
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
    />

    <!-- 证据解密私钥（仅保存在本地浏览器会话） -->
    <EvidencePrivateKeyModal v-model:show="showPrivateKeyModal" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { KeyOutline, RefreshOutline, SearchOutline } from '@vicons/ionicons5';
import ViolationTableCard from './components/ViolationTableCard.vue';
import ViolationDetailModal from './components/ViolationDetailModal.vue';
import EvidencePrivateKeyModal from './components/EvidencePrivateKeyModal.vue';
import { useViolationList } from './composables/useViolationList';
import { useViolationDetail } from './composables/useViolationDetail';
import { useViolationTable } from './composables/useViolationTable';
import { useEvidencePrivateKey } from './composables/useEvidencePrivateKey';
import { TYPE_OPTIONS } from './constants';

const showPrivateKeyModal = ref(false);
const { hasPrivateKey } = useEvidencePrivateKey();

const {
    filters,
    pendingList,
    bannedList,
    passedList,
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
    handleReset,
    loadAll,
} = useViolationList();

const { showDetailModal, current, detailLoading, reviewing, handleViewDetail, handleReviewAction } =
    useViolationDetail(loadAll);

const columns = useViolationTable({
    onView: handleViewDetail,
    onReview: handleReviewAction,
});

onMounted(loadAll);
</script>
