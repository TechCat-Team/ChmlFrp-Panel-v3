<template>
    <n-modal
        v-model:show="showModel"
        preset="card"
        :title="`批量封禁 · 已选 ${count} 条`"
        size="medium"
        style="max-width: 520px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-space vertical :size="16">
            <n-alert type="warning" :bordered="false">
                将对已选中的 {{ count }} 条待审查案件执行同一份封禁决策，单条失败不影响其余案件。
            </n-alert>
            <n-form label-placement="top">
                <n-form-item label="处置范围">
                    <n-select v-model:value="scope" :disabled="loading" :options="scopeOptions" />
                </n-form-item>
                <n-form-item label="封禁期限">
                    <n-select v-model:value="durationSeconds" :disabled="loading" :options="durationOptions" />
                </n-form-item>
                <n-form-item label="处置理由（必填）">
                    <n-input
                        v-model:value="reason"
                        type="textarea"
                        maxlength="500"
                        show-count
                        :disabled="loading"
                        placeholder="填写判定依据和处置原因"
                    />
                </n-form-item>
            </n-form>
            <n-space justify="end">
                <n-button :disabled="loading" @click="showModel = false">取消</n-button>
                <n-popconfirm @positive-click="confirm">
                    <template #trigger>
                        <n-button type="error" :disabled="loading || !reason.trim()" :loading="loading">
                            确认封禁
                        </n-button>
                    </template>
                    将限制{{ scope === 'user' ? '所选账号的全部隧道' : '所选案件对应的隧道' }}，并关闭已有连接，确认执行？
                </n-popconfirm>
            </n-space>
        </n-space>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { ViolationDecisionDraft } from '@/api/v2/admin/violation';

const props = defineProps<{
    show: boolean;
    count: number;
    loading?: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    confirm: [draft: ViolationDecisionDraft];
}>();

const scope = ref<'user' | 'tunnel'>('user');
const reason = ref('');
const durationSeconds = ref(0);

const scopeOptions = [
    { label: '整个账号', value: 'user' },
    { label: '仅当前隧道', value: 'tunnel' },
];
const durationOptions = [
    { label: '永久', value: 0 },
    { label: '1 小时', value: 3600 },
    { label: '24 小时', value: 86400 },
    { label: '7 天', value: 604800 },
];

// 每次打开都回到默认的「整个账号 + 永久」，避免沿用上一次的临时设置
watch(
    () => props.show,
    (visible) => {
        if (visible) {
            scope.value = 'user';
            durationSeconds.value = 0;
            reason.value = '';
        }
    }
);

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const confirm = () => {
    if (!reason.value.trim()) return;
    emit('confirm', {
        scope: scope.value,
        reason: reason.value,
        durationSeconds: durationSeconds.value,
    });
};
</script>
