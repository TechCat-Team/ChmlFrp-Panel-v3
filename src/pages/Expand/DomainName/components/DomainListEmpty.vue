<template>
    <n-card>
        <n-empty description="您似乎还没创建免费域名">
            <template #extra>
                <n-button size="small" :loading="loading" @click="$emit('create')" :disabled="loading">
                    <template #icon>
                        <n-icon v-if="!loading" :component="AddOutline" />
                    </template>
                    创建免费域名
                </n-button>
            </template>
        </n-empty>
    </n-card>
</template>

<script lang="ts" setup>
import { AddOutline } from '@vicons/ionicons5';

interface Props {
    loading: boolean;
}

defineProps<Props>();
defineEmits<{
    create: [];
}>();
</script>
