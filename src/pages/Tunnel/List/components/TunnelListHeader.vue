<template>
    <n-card style="margin-bottom: 12px" title="隧道列表">
        <template #header-extra>
            <n-button round quaternary :loading="loading" @click="$emit('refresh')">
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="$emit('add')" :loading="adding" type="primary" round quaternary :disabled="adding">
                <template #icon>
                    <n-icon v-if="!adding" :component="AddOutline" />
                </template>
                添加隧道
            </n-button>
            <n-button
                round
                quaternary
                :type="selectionMode ? 'warning' : 'default'"
                @click="$emit('toggle-selection')"
            >
                {{ selectionMode ? '退出管理' : '批量管理' }}
            </n-button>
            <n-button
                v-if="selectionMode"
                type="error"
                round
                :loading="batchDeleting"
                :disabled="selectedCount === 0"
                @click="$emit('batch-delete')"
            >
                删除选中({{ selectedCount }})
            </n-button>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { AddOutline, RefreshOutline } from '@vicons/ionicons5';

interface Props {
    loading: boolean;
    adding: boolean;
    selectionMode: boolean;
    selectedCount: number;
    batchDeleting: boolean;
}

defineProps<Props>();

defineEmits<{
    refresh: [];
    add: [];
    'toggle-selection': [];
    'batch-delete': [];
}>();
</script>
