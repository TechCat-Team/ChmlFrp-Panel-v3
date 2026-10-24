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
        <n-spin :show="loading">
            <n-space v-if="appeal" vertical :size="16">
                <n-card :bordered="false" embedded>
                    <n-descriptions :column="2" bordered>
                        <n-descriptions-item label="关联用户">
                            <span
                                v-if="appeal.user_id"
                                style="cursor: pointer; white-space: nowrap"
                                title="点击搜索该用户的全部违纪记录"
                                @click="emit('search-user', appeal.username)"
                            >
                                #{{ appeal.user_id }} · {{ appeal.username }}
                            </span>
                            <span v-else class="mono-text">未关联</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="违规类型">
                            <n-tag v-if="appeal.type" :type="getTypeTagType(appeal.type)" size="small" round>
                                {{ getTypeLabel(appeal.type) }}
                            </n-tag>
                            <span v-else class="mono-text">-</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="违规隧道">
                            <span class="mono-text">{{ appeal.tunnel_name || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="违规URL">
                            <span class="mono-text">{{ appeal.url || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="违规节点">
                            <span class="mono-text">{{ appeal.node_name || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="关联封禁记录">
                            <span class="mono-text">#{{ appeal.ban_record_id }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="封禁时间">
                            <span class="time-text">{{ formatViolationTime(appeal.banned_at) || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="申诉时间">
                            <span class="time-text">{{ formatViolationTime(appeal.appealed_at) }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="当前状态">
                            <n-tag :type="getAppealStatusTagType(appeal.status)" size="small" round>
                                {{ getAppealStatusLabel(appeal.status) }}
                            </n-tag>
                            <n-tag
                                v-if="appeal.unbanned_at"
                                type="success"
                                size="small"
                                round
                                style="margin-left: 6px"
                            >
                                已解封
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
                    <div class="desc-text">{{ appeal.ban_reason || '无' }}</div>
                </n-card>

                <n-card :bordered="false" embedded>
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="DocumentTextOutline" :size="18" />
                            <span>申诉理由</span>
                        </div>
                    </template>
                    <div class="desc-text">{{ appeal.reason || '用户未填写申诉理由' }}</div>
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
                    <div v-if="appeal.images.length" class="evidence-wrap">
                        <div v-for="item in appeal.images" :key="item.id" class="evidence-item">
                            <n-image
                                v-if="imageUrls[item.id]"
                                :src="imageUrls[item.id]"
                                width="220"
                                class="evidence-img"
                                object-fit="cover"
                            />
                            <div v-else class="evidence-placeholder">
                                <n-spin v-if="imageLoading && !imageErrors[item.id]" :size="20" />
                                <n-text v-else depth="3" class="evidence-error">
                                    {{ imageErrors[item.id] || '未加载' }}
                                </n-text>
                            </div>
                            <div class="evidence-meta">
                                <span class="evidence-name">{{ item.file_name }}</span>
                                <span>{{ formatEvidenceSize(item.size_bytes) }}</span>
                            </div>
                        </div>
                    </div>
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
                        {{ appeal.reviewed_by_name || '管理员' }} ·
                        {{ formatViolationTime(appeal.reviewed_at) }}
                    </div>
                    <div v-if="appeal.review_remark" class="desc-text remark-text">{{ appeal.review_remark }}</div>
                </n-card>
            </n-space>
            <n-empty v-else-if="!loading" description="暂无申诉详情" />
        </n-spin>

        <n-divider />
        <div class="action-bar">
            <n-space justify="space-between" :size="16">
                <n-space>
                    <n-button :disabled="reviewing" @click="showModel = false">
                        <template #icon>
                            <n-icon :component="CloseCircle" />
                        </template>
                        关闭
                    </n-button>
                    <n-button :disabled="!appeal?.violation_id" @click="emit('view-ban-record')">
                        <template #icon>
                            <n-icon :component="BanOutline" />
                        </template>
                        转入关联封禁案件
                    </n-button>
                </n-space>
                <n-space>
                    <n-tooltip :disabled="canReview" trigger="hover">
                        <template #trigger>
                            <n-button :disabled="reviewing || !canReview" @click="emit('review', 'reject')">
                                <template #icon>
                                    <n-icon :component="CloseCircle" />
                                </template>
                                驳回申诉
                            </n-button>
                        </template>
                        该申诉已处理，无需重复操作
                    </n-tooltip>
                    <n-tooltip :disabled="canReview" trigger="hover">
                        <template #trigger>
                            <n-button
                                type="primary"
                                :loading="reviewing"
                                :disabled="!canReview"
                                @click="emit('review', 'approve')"
                            >
                                <template #icon>
                                    <n-icon :component="CheckmarkCircle" />
                                </template>
                                通过申诉
                            </n-button>
                        </template>
                        该申诉已处理，无需重复操作
                    </n-tooltip>
                </n-space>
            </n-space>
        </div>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
    BanOutline,
    CheckmarkCircle,
    CloseCircle,
    DocumentTextOutline,
    ImageOutline,
} from '@vicons/ionicons5';
import {
    fetchViolationAppealImage,
    type AppealReviewAction,
    type ViolationAppealDetail,
} from '@/api/v2/admin/violation';
import {
    formatEvidenceSize,
    formatViolationTime,
    getAppealStatusLabel,
    getAppealStatusTagType,
    getTypeLabel,
    getTypeTagType,
} from '../constants';

const props = defineProps<{
    show: boolean;
    appeal: ViolationAppealDetail | null;
    loading?: boolean;
    reviewing?: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    review: [action: AppealReviewAction];
    'view-ban-record': [];
    'search-user': [username: string];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const canReview = computed(() => props.appeal?.status === 'pending');

const imageUrls = ref<Record<number, string>>({});
const imageErrors = ref<Record<number, string>>({});
const imageLoading = ref(false);

const revokeUrls = () => {
    Object.values(imageUrls.value).forEach((url) => URL.revokeObjectURL(url));
    imageUrls.value = {};
};

// 记录已加载的申诉 id，避免 show / appeal 两次变更重复拉取图片
let loadedAppealId: number | null = null;

const loadImages = async () => {
    const images = props.appeal?.images ?? [];
    const appealId = props.appeal?.id ?? null;
    if (appealId === loadedAppealId) {
        return;
    }
    loadedAppealId = appealId;

    revokeUrls();
    imageErrors.value = {};
    if (!appealId || !images.length) {
        return;
    }

    imageLoading.value = true;
    await Promise.all(
        images.map(async (item) => {
            try {
                const blob = await fetchViolationAppealImage(item.id);
                imageUrls.value[item.id] = URL.createObjectURL(blob);
            } catch (error: any) {
                imageErrors.value[item.id] = error?.message || '图片加载失败';
            }
        })
    );
    imageLoading.value = false;
};

watch(
    () => [props.show, props.appeal?.id],
    () => {
        if (props.show) {
            void loadImages();
        } else {
            revokeUrls();
            imageErrors.value = {};
            loadedAppealId = null;
        }
    },
    { immediate: true }
);

onBeforeUnmount(revokeUrls);
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

.evidence-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.evidence-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.evidence-img {
    border-radius: 8px;
    overflow: hidden;
}

.evidence-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 220px;
    height: 124px;
    border-radius: 8px;
    background-color: var(--n-action-color);
    text-align: center;
    padding: 0 12px;
}

.evidence-error {
    font-size: 12px;
    line-height: 1.6;
}

.evidence-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--n-text-color-3);
    max-width: 220px;
}

.evidence-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.action-bar {
    padding-top: 4px;
}
</style>
