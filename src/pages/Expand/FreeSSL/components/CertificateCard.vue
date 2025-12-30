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
                :title="displayTitle"
                :segmented="{ content: true, footer: 'soft' }"
                header-style="padding: 16px;"
                footer-style="padding: 12px 16px;"
                hoverable
            >
                <template #header-extra>
                    <n-tag round :bordered="false" :type="statusConfig.type" size="small">
                        {{ statusConfig.text }}
                    </n-tag>
                </template>

                <n-flex>
                    <n-tag v-if="certificate.isWildcard" round :bordered="false" type="primary" size="small">
                        泛域名
                    </n-tag>
                    <n-tag v-if="certificate.hasRootDomain" round :bordered="false" type="primary" size="small">
                        包含根域
                    </n-tag>
                    <n-tag v-if="certificate.isMultipleDomains" round :bordered="false" type="primary" size="small">
                        多域名
                    </n-tag>
                    <n-tag
                        v-if="!certificate.isWildcard && !certificate.hasRootDomain && !certificate.isMultipleDomains"
                        round
                        :bordered="false"
                        type="primary"
                        size="small"
                    >
                        单域名
                    </n-tag>
                </n-flex>

                <template #footer>
                    <div class="footer-content">
                        <div class="footer-item">
                            <span class="item-label">提供商</span>
                            <n-text depth="3">{{ providerName }}</n-text>
                        </div>
                        <div v-if="certificate.expiresAt" class="footer-item">
                            <span class="item-label">到期时间</span>
                            <n-text depth="3">{{ formatDate(certificate.expiresAt) }}</n-text>
                        </div>
                        <div v-else class="footer-item">
                            <span class="item-label">创建时间</span>
                            <n-text depth="3">{{ formatDate(certificate.createdAt) }}</n-text>
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
import { EyeOutline, CheckmarkCircleOutline, TrashOutline } from '@vicons/ionicons5';
import type { Certificate } from '../types';
import { STATUS_CONFIG, PROVIDER_NAMES } from '../constants';

interface Props {
    certificate: Certificate;
    loading: boolean;
    index: number;
    verifying?: number | null;
    downloading?: number | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    view: [certificate: Certificate];
    verify: [certificate: Certificate];
    download: [certificate: Certificate];
    delete: [certificate: Certificate, index: number];
}>();

const statusConfig = computed(() => STATUS_CONFIG[props.certificate.status]);
const providerName = computed(() => PROVIDER_NAMES[props.certificate.provider]);

const displayTitle = computed(() => {
    if (props.certificate.domainList && props.certificate.domainList.length > 0) {
        return props.certificate.domainList[0].replace(/^\*\./, '');
    }
    return props.certificate.domains.split(',')[0].replace(/^\*\./, '');
});

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const renderIcon = (icon: any, color?: string) => {
    return () => h(NIcon, { color }, { default: () => h(icon) });
};

const dropdownOptions = computed(() => {
    const options = [];

    // 查看详情
    options.push({
        label: '查看详情',
        key: 'view',
        icon: renderIcon(EyeOutline),
        props: {
            onClick: () => {
                emit('view', props.certificate);
            },
        },
    });

    // 如果状态是pending，显示验证选项
    if (props.certificate.status === 'pending') {
        options.push({
            label: '验证并签发',
            key: 'verify',
            icon: renderIcon(CheckmarkCircleOutline, '#18a058'),
            props: {
                onClick: () => {
                    emit('verify', props.certificate);
                },
            },
            disabled: props.verifying === props.certificate.id,
        });
    }

    // 删除选项
    options.push({
        label: '删除证书',
        key: 'delete',
        icon: renderIcon(TrashOutline, '#f5222d'),
        props: {
            onClick: () => {
                emit('delete', props.certificate, props.index);
            },
        },
    });

    return options;
});
</script>

<style scoped>
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
