<template>
    <n-modal
        v-model:show="showModel"
        preset="card"
        :title="`申诉处理 · #${appeal?.id ?? ''}`"
        size="large"
        style="max-width: 860px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-space v-if="appeal" vertical :size="16">
            <n-card :bordered="false" embedded>
                <n-descriptions :column="2" bordered>
                    <n-descriptions-item label="关联用户">
                        <span v-if="appeal.userId">#{{ appeal.userId }} · {{ appeal.username }}</span>
                        <span v-else class="mono-text">未关联</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="违规类型">
                        <n-tag :type="getTypeTagType(appeal.type)" size="small" round>
                            {{ getTypeLabel(appeal.type) }}
                        </n-tag>
                    </n-descriptions-item>
                    <n-descriptions-item label="违规隧道">
                        <span class="mono-text">{{ appeal.tunnelName || '-' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="违规URL">
                        <span class="mono-text">{{ appeal.url || '-' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="违规节点">
                        <span class="mono-text">{{ appeal.nodeName || '-' }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="关联违规记录">
                        <span class="mono-text">#{{ appeal.violationId }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="申诉时间">
                        <span class="time-text">{{ formatViolationTime(appeal.appealedAt) }}</span>
                    </n-descriptions-item>
                    <n-descriptions-item label="当前状态">
                        <n-tag :type="getAppealStatusTagType(appeal.status)" size="small" round>
                            {{ getAppealStatusLabel(appeal.status) }}
                        </n-tag>
                    </n-descriptions-item>
                </n-descriptions>
            </n-card>

            <n-card :bordered="false" embedded>
                <template #header>
                    <div class="content-header">
                        <n-icon :component="BanOutline" :size="18" />
                        <span>封禁原因</span>
                    </div>
                </template>
                <div class="desc-text">{{ appeal.banReason || '无' }}</div>
            </n-card>

            <n-card :bordered="false" embedded>
                <template #header>
                    <div class="content-header">
                        <n-icon :component="DocumentTextOutline" :size="18" />
                        <span>申诉理由</span>
                    </div>
                </template>
                <div class="desc-text">{{ appeal.appealReason || '用户未填写申诉理由' }}</div>
                <n-divider style="margin: 12px 0" />
                <div class="contact-line">
                    <span class="contact-label">联系方式：</span>
                    <span class="mono-text">{{ appeal.contact || '未填写' }}</span>
                </div>
            </n-card>

            <n-card :bordered="false" embedded>
                <template #header>
                    <div class="content-header">
                        <n-icon :component="ImageOutline" :size="18" />
                        <span>佐证图片</span>
                    </div>
                </template>
                <n-space v-if="appeal.images.length" :size="8">
                    <n-tag v-for="name in appeal.images" :key="name" round :bordered="false">
                        {{ name }}
                    </n-tag>
                </n-space>
                <n-empty v-else size="small" description="用户未上传佐证图片" />
            </n-card>

            <n-card v-if="appeal.status !== 'pending'" :bordered="false" embedded>
                <template #header>
                    <div class="content-header">
                        <n-icon :component="CheckmarkCircle" :size="18" />
                        <span>审核结果</span>
                    </div>
                </template>
                <div class="desc-text">
                    {{ getAppealStatusLabel(appeal.status) }} ·
                    {{ appeal.reviewedBy || '管理员' }} ·
                    {{ formatViolationTime(appeal.reviewedAt) }}
                </div>
                <div v-if="appeal.reviewRemark" class="desc-text remark-text">{{ appeal.reviewRemark }}</div>
            </n-card>
        </n-space>
        <n-empty v-else description="暂无申诉详情" />

        <n-divider />
        <div class="action-bar">
            <n-space justify="space-between" :size="16">
                <n-button :disabled="reviewing" @click="showModel = false">
                    <template #icon>
                        <n-icon :component="CloseCircle" />
                    </template>
                    关闭
                </n-button>
                <n-space>
                    <n-button
                        :disabled="reviewing || appeal?.status !== 'pending'"
                        @click="emit('review', 'rejected')"
                    >
                        <template #icon>
                            <n-icon :component="CloseCircle" />
                        </template>
                        驳回申诉
                    </n-button>
                    <n-button
                        type="primary"
                        :loading="reviewing"
                        :disabled="appeal?.status !== 'pending'"
                        @click="emit('review', 'approved')"
                    >
                        <template #icon>
                            <n-icon :component="CheckmarkCircle" />
                        </template>
                        通过申诉
                    </n-button>
                </n-space>
            </n-space>
        </div>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import {
    BanOutline,
    CheckmarkCircle,
    CloseCircle,
    DocumentTextOutline,
    ImageOutline,
} from '@vicons/ionicons5';
import {
    formatViolationTime,
    getAppealStatusLabel,
    getAppealStatusTagType,
    getTypeLabel,
    getTypeTagType,
    type AppealRecord,
    type AppealReviewResult,
} from '../constants';

const props = defineProps<{
    show: boolean;
    appeal: AppealRecord | null;
    reviewing?: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    review: [result: AppealReviewResult];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});
</script>

<style scoped lang="scss">
.mono-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: var(--n-text-color-2);
}

.time-text {
    color: var(--n-text-color-2);
    font-size: 13px;
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

.remark-text {
    margin-top: 6px;
}

.contact-line {
    font-size: 14px;
    line-height: 1.8;
}

.contact-label {
    color: var(--n-text-color-2);
}

.action-bar {
    padding-top: 4px;
}
</style>
