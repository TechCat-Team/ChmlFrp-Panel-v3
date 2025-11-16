<template>
    <n-dropdown
        trigger="click"
        :overlap="true"
        placement="bottom-end"
        :show-arrow="false"
        :options="dropdownOptions"
        class="custom-dropdown"
    >
        <n-spin :show="loading" :description="loading ? '加载中...' : null" class="full-height-spin">
            <n-card
                size="small"
                :title="displayName"
                :segmented="{ content: true, footer: 'soft' }"
                header-style="padding: 16px;"
                footer-style="padding: 12px 16px;"
                class="custom-card"
            >
                <template #header-extra>
                    <n-tooltip
                        v-if="domain.type === 'SRV' && isSpecialRecord"
                        trigger="hover"
                        placement="top"
                    >
                        <template #trigger>
                            <n-tag round :bordered="false" type="primary" size="small" class="type-tag">
                                {{ domain.type }}
                                <n-icon :component="InformationCircleOutline" size="14" class="ml-1" />
                            </n-tag>
                        </template>
                        {{ tooltipMessage }}
                    </n-tooltip>
                    <n-tag v-else round :bordered="false" type="primary" size="small" class="type-tag">
                        {{ domain.type }}
                    </n-tag>
                </template>

                <n-tag round :bordered="false" type="primary" size="small">
                    {{ domain.remarks || '未命名服务' }}
                </n-tag>

                <template #footer>
                    <div class="footer-content">
                        <div class="footer-item">
                            <span class="item-label">记录名</span>
                            <n-text depth="3">{{ domain.record }}</n-text>
                        </div>
                        <div class="footer-item">
                            <span class="item-label">域名</span>
                            <n-text depth="3">{{ domain.domain }}</n-text>
                        </div>
                        <div class="footer-item">
                            <span class="item-label">目标地址</span>
                            <n-text code>{{ domain.target }}</n-text>
                        </div>
                        <div class="footer-item">
                            <span class="item-label">TTL</span>
                            <n-text strong>{{ domain.ttl }}</n-text>
                        </div>
                    </div>
                </template>
            </n-card>
        </n-spin>
    </n-dropdown>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue';
import { NIcon } from 'naive-ui';
import { InformationCircleOutline, EyeOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5';
import type { FreeDomain } from '../types';
import { useDomainUtils } from '../composables/useDomainUtils';

interface Props {
    domain: FreeDomain;
    loading: boolean;
    index: number;
}

const props = defineProps<Props>();

const { isSpecialRecord: checkSpecialRecord, getTooltipMessage, cleanRecord } = useDomainUtils();

const isSpecialRecord = computed(() => checkSpecialRecord(props.domain.record));
const tooltipMessage = computed(() => getTooltipMessage(props.domain.record, props.domain.domain));
const displayName = computed(() => cleanRecord(props.domain.record) + '.' + props.domain.domain);

const renderIcon = (icon: any, color?: string) => {
    return () => h(NIcon, { color }, { default: () => h(icon) });
};

const emit = defineEmits<{
    view: [domain: FreeDomain];
    edit: [domain: FreeDomain];
    delete: [domain: FreeDomain, index: number];
}>();

const dropdownOptions = computed(() => [
    {
        label: '访问',
        key: 'view',
        icon: renderIcon(EyeOutline),
        props: {
            onClick: () => {
                window.open('http://' + props.domain.record + '.' + props.domain.domain, '_blank');
            },
        },
    },
    {
        label: '修改解析',
        key: 'edit',
        icon: renderIcon(CreateOutline),
        props: {
            onClick: () => {
                emit('edit', props.domain);
            },
        },
    },
    {
        label: '删除域名',
        key: 'delete',
        icon: renderIcon(TrashOutline, '#f5222d'),
        props: {
            onClick: () => {
                emit('delete', props.domain, props.index);
            },
        },
    },
]);
</script>

<style scoped>
.custom-card {
    border-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.custom-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.type-tag {
    margin-left: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
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
}

.item-label {
    font-size: 0.9em;
    color: #666;
    margin-right: 12px;
}

.full-height-spin {
    height: 100%;
}

.custom-dropdown {
    border-radius: 12px;
}
</style>

