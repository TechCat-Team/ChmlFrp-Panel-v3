<template>
    <n-card title="消息" :bordered="false" size="large" class="message-card">
        <!-- 桌面端搜索 -->
        <template #header-extra>
            <n-input
                v-model:value="searchKeyword"
                placeholder="搜索消息"
                clearable
                round
                size="small"
                class="search-input desktop-search"
                @keyup.enter="handleSearch"
                @clear="handleResetSearch"
            >
                <template #prefix>
                    <n-icon :component="SearchOutline" />
                </template>
            </n-input>
        </template>

        <n-space vertical :size="12">
            <!-- 移动端搜索 -->
            <n-input
                v-model:value="searchKeyword"
                placeholder="搜索消息"
                clearable
                round
                size="small"
                class="search-input mobile-search"
                @keyup.enter="handleSearch"
                @clear="handleResetSearch"
            >
                <template #prefix>
                    <n-icon :component="SearchOutline" />
                </template>
            </n-input>

            <!-- 优先级筛选 -->
            <n-space size="small" align="center" class="priority-filter">
                <n-tag
                    v-for="item in priorityOptions"
                    :key="item.label"
                    round
                    checkable
                    :checked="selectedPriority === item.value"
                    @click="handlePriorityFilter(item.value)"
                >
                    {{ item.label }}
                </n-tag>

                <n-button v-if="isSearchMode" text size="tiny" @click="handleResetSearch"> 清除 </n-button>
            </n-space>

            <!-- 消息列表 -->
            <div class="message-list-container" @scroll="handleScroll">
                <!-- 骨架屏加载 -->
                <template v-if="loading && messages.length === 0">
                    <div class="skeleton-list">
                        <div v-for="i in 5" :key="i" class="skeleton-item">
                            <div class="message-item-inner">
                                <n-flex justify="space-between" align="center">
                                    <n-flex align="center" :size="10">
                                        <n-skeleton :width="50" :height="22" round style="border-radius: 12px" />
                                        <n-skeleton :width="getSkeletonWidth(i)" :height="20" />
                                    </n-flex>
                                    <n-skeleton :width="140" :height="16" />
                                </n-flex>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 空状态 -->
                <n-empty v-else-if="!loading && messages.length === 0" description="暂无消息" />

                <!-- 消息列表 -->
                <template v-else>
                    <n-list :bordered="false" class="message-list" :show-divider="false">
                        <n-list-item
                            v-for="msg in messages"
                            :key="msg.id"
                            class="message-item"
                            @click="handleViewDetail(msg.id)"
                        >
                            <div class="message-item-inner">
                                <n-flex justify="space-between" align="center">
                                    <n-flex align="center" :size="10">
                                        <n-tag
                                            :type="getPriorityType(msg.priority)"
                                            size="small"
                                            round
                                            :bordered="false"
                                        >
                                            {{ getPriorityLabel(msg.priority) }}
                                        </n-tag>

                                        <span class="message-title">
                                            {{ msg.title }}
                                        </span>
                                    </n-flex>

                                    <span class="message-time">
                                        {{ formatTime(msg.publishTime) }}
                                    </span>
                                </n-flex>
                            </div>
                        </n-list-item>
                    </n-list>

                    <!-- 加载更多骨架屏 -->
                    <div v-if="loadingMore" class="skeleton-list">
                        <div v-for="i in 3" :key="`more-${i}`" class="skeleton-item">
                            <div class="message-item-inner">
                                <n-flex justify="space-between" align="center">
                                    <n-flex align="center" :size="10">
                                        <n-skeleton :width="50" :height="22" round style="border-radius: 12px" />
                                        <n-skeleton :width="getSkeletonWidth(i)" :height="20" />
                                    </n-flex>
                                    <n-skeleton :width="140" :height="16" />
                                </n-flex>
                            </div>
                        </div>
                    </div>

                    <!-- 加载更多提示 -->
                    <div v-else-if="hasMore" class="load-more-hint">滚动到底部加载更多</div>
                </template>
            </div>
        </n-space>
    </n-card>

    <!-- 消息详情 -->
    <n-modal
        v-model:show="showDetailModal"
        preset="card"
        title="消息详情"
        size="large"
        :bordered="false"
        class="detail-modal"
        style="max-width: 720px"
    >
        <template v-if="loadingDetail">
            <n-space vertical :size="24">
                <n-flex align="center" :size="12">
                    <n-skeleton :width="60" :height="28" round style="border-radius: 14px" />
                    <n-skeleton :width="300" :height="28" />
                </n-flex>
                <n-skeleton :width="200" :height="20" />
                <n-skeleton width="100%" :height="200" style="border-radius: 8px" />
            </n-space>
        </template>
        <div v-else-if="currentMessage">
            <!-- 内容 -->
            <div class="markdown-content" v-html="renderMarkdown(currentMessage.contentMd)" />
        </div>
    </n-modal>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { SearchOutline } from '@vicons/ionicons5';
import { useSystemMessages } from '../composables/useSystemMessages';
import dayjs from 'dayjs';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

const {
    loading,
    loadingMore,
    messages,
    hasMore,
    selectedPriority,
    searchKeyword,
    isSearchMode,
    currentMessage,
    showDetailModal,
    loadingDetail,
    fetchMessages,
    searchMessages,
    resetSearch,
    fetchMessageDetail,
    loadMoreMessages,
    handlePriorityChange,
    getPriorityLabel,
    getPriorityType,
} = useSystemMessages();

const priorityOptions = [
    { label: '全部', value: undefined },
    { label: '普通', value: 1 },
    { label: '重要', value: 2 },
    { label: '紧急', value: 3 },
];

// 搜索
const handleSearch = () => {
    searchKeyword.value.trim() ? searchMessages() : resetSearch();
};

const handleResetSearch = () => resetSearch();

const handlePriorityFilter = (priority?: number) => {
    handlePriorityChange(priority);
};

const handleViewDetail = (id: number) => {
    fetchMessageDetail(id);
};

const formatTime = (time: string) => {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';
};

const renderMarkdown = (content: string) => {
    return content ? md.render(content) : '';
};

// 获取骨架屏宽度（模拟不同长度的标题）
const getSkeletonWidth = (index: number) => {
    const widths = [200, 250, 180, 220, 190, 210, 170];
    return widths[index % widths.length];
};

// 处理滚动事件
const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 当滚动到距离底部 50px 时加载更多
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore.value && !loadingMore.value && !loading.value) {
        loadMoreMessages();
    }
};

onMounted(() => {
    fetchMessages();
});
</script>

<style scoped>
/* 搜索框 */
.search-input {
    background: var(--n-color-embedded);
}

/* 桌面端搜索 */
.desktop-search {
    max-width: 220px;
}

/* 移动端搜索 */
.mobile-search {
    display: none;
    width: 100%;
}

/* 筛选区 */
.priority-filter {
    margin-top: -16px;
    margin-bottom: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .desktop-search {
        display: none;
    }

    .mobile-search {
        display: block;
    }

    .message-list-container {
        max-height: 50vh;
    }

    .message-item-inner {
        padding: 12px;
    }

    .message-title {
        font-size: 14px;
    }

    .message-time {
        font-size: 11px;
    }

    .priority-filter {
        margin-top: 1px;
        flex-wrap: wrap;
    }
}

/* 消息列表容器 */
.message-list-container {
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
}

.message-list-container::-webkit-scrollbar {
    width: 6px;
}

.message-list-container::-webkit-scrollbar-track {
    background: transparent;
}

.message-list-container::-webkit-scrollbar-thumb {
    background: var(--n-border-color);
    border-radius: 3px;
}

.message-list-container::-webkit-scrollbar-thumb:hover {
    background: var(--n-text-color-3);
}

.message-list :deep(.n-list-item) {
    border-bottom: none !important;
}

.message-list :deep(.n-list-item::after) {
    display: none !important;
}

.message-item {
    padding: 0;
    margin-bottom: 8px;
    cursor: pointer;
    border-bottom: none !important;
}

.message-item::after {
    display: none !important;
}

.message-item-inner {
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--n-color-embedded);
    transition: all 0.2s ease;
}

.message-item:hover .message-item-inner {
    background: var(--n-color-hover);
    transform: translateY(-1px);
}

.message-title {
    font-size: 15px;
    font-weight: 500;
}

.message-time {
    font-size: 12px;
    color: var(--n-text-color-3);
}

/* 骨架屏 */
.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-item {
    padding: 0;
    margin-bottom: 8px;
}

.skeleton-item .message-item-inner {
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--n-color-embedded);
}

/* 加载更多提示 */
.load-more-hint {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    color: var(--n-text-color-3);
    font-size: 13px;
}

/* 弹窗 */
.detail-modal {
    border-radius: 16px;
}

/* Markdown */
.markdown-content {
    margin-top: -16px;
    font-size: 14px;
    line-height: 1.9;
    color: var(--n-text-color);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
    margin-top: 20px;
    font-weight: 600;
}

.markdown-content :deep(p) {
    margin: 10px 0;
}

.markdown-content :deep(code) {
    background: var(--n-code-color);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
}

.markdown-content :deep(pre) {
    background: var(--n-code-color);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
}
</style>
