<template>
    <n-card>
        <n-result :status="status" :title="title" :description="description">
            <template #footer>
                <n-button tag="a" href="https://www.chmlfrp.net" target="_blank">返回主页</n-button>
            </template>
        </n-result>
    </n-card>
</template>

<script lang="ts" setup>
interface Props {
    status: '404' | '500';
    title: string;
    description: string;
}

defineProps<Props>();
</script>

