<template>
    <n-back-top :right="100" />
    <div class="node-management">
        <n-card title="节点管理" :bordered="false">
            <template #header-extra>
                <n-space>
                    <n-button type="primary" @click="openCreateModal">
                        <template #icon>
                            <n-icon><AddIcon /></n-icon>
                        </template>
                        新增节点
                    </n-button>
                    <n-button @click="fetchNodes">
                        <template #icon>
                            <n-icon><RefreshIcon /></n-icon>
                        </template>
                        刷新
                    </n-button>
                </n-space>
            </template>

            <NodeTableCard
                v-model:search-query="searchQuery"
                :columns="columns"
                :data="filteredNodes"
                :loading="loading"
                :pagination="pagination"
                :row-props="rowProps"
                @search="handleSearch"
            />
        </n-card>

        <!-- 新增节点模态框 -->
        <CreateNodeModal v-model:show="showCreateModal" :loading="createLoading" @submit="handleCreate" />

        <!-- 编辑节点模态框 -->
        <EditNodeModal
            v-model:show="showEditModal"
            :node="currentEditNode"
            :loading="editLoading"
            @submit="handleEdit"
        />

        <!-- 配置代码模态框 -->
        <NodeConfigModal v-model:show="showConfigModal" :node="currentCodeNode" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { NBackTop, NButton, NCard, NIcon, NSpace } from 'naive-ui';
import { Add as AddIcon, Refresh as RefreshIcon } from '@vicons/ionicons5';
import type { Node } from './types';
import { useNodeList } from './composables/useNodeList';
import { useNodeColumns } from './composables/useNodeColumns';
import { useNodeActions } from './composables/useNodeActions';
import NodeTableCard from './components/NodeTableCard.vue';
import CreateNodeModal from './components/CreateNodeModal.vue';
import EditNodeModal from './components/EditNodeModal.vue';
import NodeConfigModal from './components/NodeConfigModal.vue';

// 列表 / 搜索 / 分页
const { loading, searchQuery, filteredNodes, pagination, fetchNodes, handleSearch, rowProps } = useNodeList();

// 配置代码模态框
const showConfigModal = ref(false);
const currentCodeNode = ref<Node | null>(null);

const handleCodeClick = (node: Node) => {
    currentCodeNode.value = node;
    showConfigModal.value = true;
};

// 新增 / 编辑 / 删除 / 访问面板
const {
    showCreateModal,
    showEditModal,
    createLoading,
    editLoading,
    currentEditNode,
    openCreateModal,
    openEditModal,
    handleCreate,
    handleEdit,
    handlePanelAccess,
    handleDeleteClick,
} = useNodeActions(fetchNodes);

// 表格列配置
const { columns } = useNodeColumns({
    onEdit: openEditModal,
    onCode: handleCodeClick,
    onPanel: handlePanelAccess,
    onDelete: handleDeleteClick,
});

// 页面加载时获取数据
onMounted(() => {
    fetchNodes();
});
</script>
