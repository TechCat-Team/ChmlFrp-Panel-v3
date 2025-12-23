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
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { AddOutline, RefreshOutline } from '@vicons/ionicons5';

interface Props {
    loading: boolean;
    adding: boolean;
}

defineProps<Props>();

defineEmits<{
    refresh: [];
    add: [];
}>();
</script>
