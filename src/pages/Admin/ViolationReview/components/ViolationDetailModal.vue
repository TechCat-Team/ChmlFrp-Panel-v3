<template>
    <n-modal
        v-model:show="showModel"
        preset="card"
        :title="`违规审查 · #${violation?.id ?? ''}`"
        size="large"
        style="max-width: 860px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-spin :show="false">
            <n-space vertical :size="16" v-if="violation">
                <n-card :bordered="false" embedded class="detail-info-card">
                    <n-descriptions :column="2" bordered>
                        <n-descriptions-item label="违规类型">
                            <n-tag :type="getTypeTagType(violation.type)" size="small" round>
                                {{ getTypeLabel(violation.type) }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="关联用户">
                            <n-button text type="primary" size="small">
                                #{{ violation.user.id }} · {{ violation.user.username }}
                            </n-button>
                        </n-descriptions-item>
                        <n-descriptions-item label="违规内容">
                            <div class="detail-title">{{ violation.title }}</div>
                        </n-descriptions-item>
                        <n-descriptions-item label="关联目标">
                            <template v-if="violation.type === 'site'">
                                <a
                                    :href="violation.target"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="target-link"
                                >
                                    <n-icon :component="LinkOutline" :size="14" />
                                    {{ violation.target }}
                                </a>
                            </template>
                            <template v-else>
                                <span class="mono-text">{{ violation.target }}</span>
                            </template>
                        </n-descriptions-item>
                        <n-descriptions-item label="发现时间">
                            <span class="time-text">{{ formatViolationTime(violation.reportedAt) }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="证据附件数">
                            <n-badge :value="violation.attachments" :max="99" />
                        </n-descriptions-item>
                        <n-descriptions-item label="当前状态">
                            <n-tag :type="getStatusTagType(violation.status)" size="small" round>
                                {{ getStatusLabel(violation.status) }}
                            </n-tag>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-card>

                <n-card :bordered="false" embedded class="detail-content-card">
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="DocumentTextOutline" :size="18" />
                            <span>违规描述</span>
                        </div>
                    </template>
                    <div class="desc-text">{{ violation.description }}</div>
                </n-card>

                <n-card :bordered="false" embedded class="detail-content-card">
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="ImageOutline" :size="18" />
                            <span>证据预览</span>
                        </div>
                    </template>
                    <div class="evidence-wrap">
                        <n-image
                            v-for="(image, index) in violation.evidences"
                            :key="index"
                            :src="image"
                            width="260"
                            class="evidence-img"
                            object-fit="cover"
                        />
                    </div>
                </n-card>

                <!-- 审核操作 -->
                <n-divider />
                <div class="action-bar">
                    <n-space justify="space-between" :size="16">
                        <n-space>
                            <n-button @click="showModel = false">
                                <template #icon>
                                    <n-icon :component="CloseCircle" />
                                </template>
                                关闭
                            </n-button>
                        </n-space>
                        <n-space>
                            <n-button @click="emit('review', '不通过')">
                                <template #icon>
                                    <n-icon :component="CloseCircle" />
                                </template>
                                不通过
                            </n-button>
                            <n-button type="warning" @click="emit('review', '封禁处理')">
                                <template #icon>
                                    <n-icon :component="BanOutline" />
                                </template>
                                封禁处理
                            </n-button>
                            <n-button type="primary" @click="emit('review', '通过')">
                                <template #icon>
                                    <n-icon :component="CheckmarkCircle" />
                                </template>
                                通过
                            </n-button>
                        </n-space>
                    </n-space>
                </div>
            </n-space>
        </n-spin>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { BanOutline, CheckmarkCircle, CloseCircle, DocumentTextOutline, ImageOutline, LinkOutline } from '@vicons/ionicons5';
import {
    formatViolationTime,
    getStatusLabel,
    getStatusTagType,
    getTypeLabel,
    getTypeTagType,
} from '../constants';
import type { Violation } from '../types';

const props = defineProps<{
    show: boolean;
    violation: Violation | null;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    review: [action: string];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});
</script>

<style scoped lang="scss">
.detail-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--n-text-color);
}

.time-text {
    color: var(--n-text-color-2);
    font-size: 13px;
}

.target-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #2080f0;
    text-decoration: none;
    word-break: break-all;

    &:hover {
        text-decoration: underline;
    }
}

.mono-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: var(--n-text-color-2);
}

.detail-content-card {
    margin-top: 0;
}

.content-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    color: var(--n-text-color);
}

.desc-text {
    font-size: 14px;
    line-height: 1.8;
    color: var(--n-text-color-2);
    white-space: pre-wrap;
}

.evidence-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.evidence-img {
    border-radius: 8px;
    overflow: hidden;
}

.action-bar {
    padding-top: 4px;
}

:deep(.n-modal) {
    .n-card {
        border-radius: 16px;
    }
}
</style>
