<template>
    <n-dropdown
        v-model:show="showActions"
        trigger="click"
        :overlap="true"
        placement="bottom-end"
        :show-arrow="false"
        :options="actions"
        @select="selectAction"
    >
        <n-card
            size="small"
            :segmented="{ content: true, footer: 'soft' }"
            header-style="padding: 16px;"
            footer-style="padding: 12px 16px;"
            hoverable
            class="whitelist-domain-card"
            role="button"
            tabindex="0"
            aria-haspopup="menu"
            :aria-label="`管理域名 ${record.domain}`"
            :aria-expanded="showActions"
            @keydown.enter.prevent="showActions = !showActions"
            @keydown.space.prevent="showActions = !showActions"
        >
            <template #header>
                <n-ellipsis class="domain-title" :tooltip="{ placement: 'top' }">{{ record.domain }}</n-ellipsis>
            </template>
            <template #header-extra>
                <n-tag round :bordered="false" :type="statusType" size="small" class="status-tag">
                    {{ statusLabel }}
                </n-tag>
            </template>

            <div class="card-summary">
                <n-tag v-if="record.remarks" round :bordered="false" type="primary" size="small" class="remark-tag">
                    <n-ellipsis>{{ record.remarks }}</n-ellipsis>
                </n-tag>
                <n-text v-else depth="3" class="no-remarks">暂无备注</n-text>
                <n-text v-if="record.status !== 'approved'" depth="3" class="result-message">
                    <n-ellipsis :line-clamp="2">{{
                        record.message || '正在查询域名备案信息，请稍后刷新。'
                    }}</n-ellipsis>
                </n-text>
            </div>

            <template #footer>
                <div class="footer-content">
                    <div class="footer-item">
                        <n-text depth="3" class="item-label">备案号</n-text>
                        <n-text class="item-value"
                            ><n-ellipsis>{{ record.licence || '—' }}</n-ellipsis></n-text
                        >
                    </div>
                    <div class="footer-item">
                        <n-text depth="3" class="item-label">备案主体</n-text>
                        <n-text class="item-value"
                            ><n-ellipsis>{{ record.company || '—' }}</n-ellipsis></n-text
                        >
                    </div>
                    <div class="footer-item">
                        <n-text depth="3" class="item-label">{{ record.approved_at ? '过白时间' : '提交时间' }}</n-text>
                        <n-text depth="3" class="item-value">{{
                            formatDate(record.approved_at || record.created_at)
                        }}</n-text>
                    </div>
                    <div class="footer-item">
                        <n-text depth="3" class="item-label">删除费用</n-text>
                        <n-text :type="record.status === 'approved' && record.delete_fee === 0 ? 'success' : undefined">
                            {{
                                record.status === 'approved'
                                    ? record.delete_fee
                                        ? `${record.delete_fee} 积分`
                                        : '免费'
                                    : '—'
                            }}
                        </n-text>
                    </div>
                </div>
            </template>
        </n-card>
    </n-dropdown>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { NCard, NDropdown, NEllipsis, NIcon, NTag, NText, type DropdownOption } from 'naive-ui';
import { EyeOutline, TrashOutline } from '@vicons/ionicons5';
import type { WhitelistRecord } from '@/api/v2/whitelist/whitelist';

const props = defineProps<{ record: WhitelistRecord; statusLabel: string }>();
const emit = defineEmits<{ view: [id: number]; remove: [record: WhitelistRecord] }>();
const showActions = ref(false);
const statusType = computed(() => {
    switch (props.record.status) {
        case 'approved':
            return 'success';
        case 'verifying':
            return 'info';
        case 'error':
            return 'warning';
        case 'rejected':
            return 'error';
        default:
            return 'default';
    }
});
const actions = computed<DropdownOption[]>(() => [
    { label: '查看详情', key: 'view', icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) },
    ...(props.record.status === 'approved'
        ? [
              { type: 'divider' as const, key: 'divider' },
              {
                  label: '删除域名',
                  key: 'remove',
                  icon: () => h(NIcon, { color: '#d03050' }, { default: () => h(TrashOutline) }),
              },
          ]
        : []),
]);
function selectAction(key: string) {
    showActions.value = false;
    if (key === 'view') emit('view', props.record.id);
    else if (key === 'remove') emit('remove', props.record);
}
const formatDate = (value: string) => value.replace('T', ' ').replace(/\.\d+$/, '');
</script>

<style scoped>
.whitelist-domain-card {
    height: 100%;
    cursor: pointer;
}
.domain-title {
    max-width: 100%;
    min-width: 0;
    font-size: 16px;
    font-weight: 500;
}
.whitelist-domain-card:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
}
.status-tag {
    font-weight: 600;
}
.card-summary {
    min-height: 24px;
}
.remark-tag {
    max-width: 100%;
}
.remark-tag :deep(.n-tag__content) {
    min-width: 0;
}
.no-remarks {
    font-size: 13px;
}
.result-message {
    display: block;
    margin-top: 8px;
    font-size: 13px;
}
.footer-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-width: 0;
}
.item-label {
    flex-shrink: 0;
    font-size: 0.9em;
}
.item-value {
    min-width: 0;
    text-align: right;
}
</style>
