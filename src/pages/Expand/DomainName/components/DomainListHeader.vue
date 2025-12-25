<template>
    <n-card style="margin-bottom: 20px" title="域名列表">
        <template #header-extra>
            <n-button round quaternary @click="$emit('refresh')" :loading="loading">
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="$emit('create')" :loading="createLoading" type="primary" round quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                新增域名
            </n-button>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { RefreshOutline, AddOutline } from '@vicons/ionicons5';

interface Props {
    loading: boolean;
    createLoading: boolean;
}

defineProps<Props>();
defineEmits<{
    refresh: [];
    create: [];
}>();
</script>
