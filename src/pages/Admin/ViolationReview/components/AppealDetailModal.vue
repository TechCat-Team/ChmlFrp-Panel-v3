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
                        <n-descriptions-item label="申诉次数">
                            <span class="mono-text">{{ appeal.appeal_count }} 次</span>
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

                <!-- 同一案件的历次申诉，按申诉先后展示申诉理由、佐证图片与审核结果 -->
                <n-card :bordered="false" embedded>
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="DocumentTextOutline" :size="18" />
                            <span>申诉记录（共 {{ rounds.length }} 次）</span>
                        </div>
                    </template>
                    <n-space vertical :size="12">
                        <n-card
                            v-for="(round, index) in rounds"
                            :key="round.id"
                            size="small"
                            embedded
                            :bordered="true"
                        >
                            <template #header>
                                <div class="round-header">
                                    <span class="round-title">第 {{ index + 1 }} 次申诉 · #{{ round.id }}</span>
                                    <n-tag :type="getAppealStatusTagType(round.status)" size="small" round>
                                        {{ getAppealStatusLabel(round.status) }}
                                    </n-tag>
                                    <span class="time-text">{{ formatViolationTime(round.appealed_at) }}</span>
                                </div>
                            </template>

                            <div class="desc-text">{{ round.reason || '用户未填写申诉理由' }}</div>
                            <div class="contact-line">
                                <span class="contact-label">联系方式：</span>
                                <span class="mono-text">{{ round.contact || '未填写' }}</span>
                            </div>

                            <div v-if="round.images.length" class="evidence-wrap">
                                <div v-for="item in round.images" :key="item.id" class="evidence-item">
                                    <n-image
                                        v-if="imageUrls[item.id]"
                                        :src="imageUrls[item.id]"
                                        width="180"
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
                            <n-text v-else depth="3" class="empty-images">未上传佐证图片</n-text>

                            <div v-if="round.status !== 'pending'" class="round-review">
                                <div class="desc-text">
                                    {{ getAppealStatusLabel(round.status) }} ·
                                    {{ round.reviewed_by_name || '管理员' }} ·
                                    {{ formatViolationTime(round.reviewed_at) }}
                                </div>
                                <div v-if="round.review_remark" class="desc-text remark-text">
                                    审核意见：{{ round.review_remark }}
                                </div>
                            </div>
                        </n-card>
                        <n-empty v-if="!rounds.length" size="small" description="暂无申诉记录" />
                    </n-space>
                </n-card>

                <n-card v-if="canReview" :bordered="false" embedded>
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="ChatboxEllipsesOutline" :size="18" />
                            <span>驳回理由</span>
                        </div>
                    </template>
                    <n-input
                        v-model:value="rejectRemark"
                        type="textarea"
                        placeholder="选填，填写后会展示给申诉用户，便于用户了解驳回原因"
                        :maxlength="APPEAL_REVIEW_REMARK_MAX"
                        show-count
                        :autosize="{ minRows: 2, maxRows: 5 }"
                    />
                </n-card>

                <n-card v-if="canAmend" :bordered="false" embedded>
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="CreateOutline" :size="18" />
                            <span>修改审核结果</span>
                        </div>
                    </template>
                    <div v-if="!amendOpen" class="amend-entry">
                        <span class="desc-text">
                            当前结果：{{ getAppealStatusLabel(latestRound?.status ?? 'pending') }}，如需调整可重新选择结果。
                        </span>
                        <n-button size="small" @click="openAmend">修改审核结果</n-button>
                    </div>
                    <n-space v-else vertical :size="12">
                        <n-radio-group v-model:value="amendAction">
                            <n-radio-button value="approve">通过申诉</n-radio-button>
                            <n-radio-button value="reject">驳回申诉</n-radio-button>
                        </n-radio-group>
                        <n-input
                            v-model:value="amendRemark"
                            type="textarea"
                            placeholder="选填，填写修改理由后会作为审核意见展示给申诉用户"
                            :maxlength="APPEAL_REVIEW_REMARK_MAX"
                            show-count
                            :autosize="{ minRows: 2, maxRows: 5 }"
                        />
                        <n-space justify="end">
                            <n-button :disabled="reviewing" @click="amendOpen = false">取消</n-button>
                            <n-button type="primary" :loading="reviewing" :disabled="reviewing" @click="submitAmend">
                                提交修改
                            </n-button>
                        </n-space>
                    </n-space>
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
                <n-space v-if="canReview">
                    <n-button
                        :disabled="reviewing"
                        @click="emit('review', 'reject', rejectRemark.trim() || undefined)"
                    >
                        <template #icon>
                            <n-icon :component="CloseCircle" />
                        </template>
                        驳回申诉
                    </n-button>
                    <n-button type="primary" :loading="reviewing" :disabled="reviewing" @click="emit('review', 'approve')">
                        <template #icon>
                            <n-icon :component="CheckmarkCircle" />
                        </template>
                        通过申诉
                    </n-button>
                </n-space>
                <span v-else class="time-text">该申诉已处理，可在上方修改审核结果</span>
            </n-space>
        </div>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import {
    BanOutline,
    ChatboxEllipsesOutline,
    CheckmarkCircle,
    CloseCircle,
    CreateOutline,
    DocumentTextOutline,
} from '@vicons/ionicons5';
import {
    fetchViolationAppealImage,
    type AppealReviewAction,
    type ViolationAppealDetail,
} from '@/api/v2/admin/violation';
import {
    APPEAL_REVIEW_REMARK_MAX,
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
    review: [action: AppealReviewAction, remark?: string];
    amend: [action: AppealReviewAction, remark?: string];
    'view-ban-record': [];
    'search-user': [username: string];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const rounds = computed(() => props.appeal?.appeals ?? []);
const latestRound = computed(() => (rounds.value.length ? rounds.value[rounds.value.length - 1] : null));
const canReview = computed(() => latestRound.value?.status === 'pending');
const canAmend = computed(() => !!latestRound.value && latestRound.value.status !== 'pending');

// 驳回理由为选填，提交后会随审核结果返回给用户查看
const rejectRemark = ref('');

// 修改审核结果
const amendOpen = ref(false);
const amendAction = ref<AppealReviewAction>('reject');
const amendRemark = ref('');

const openAmend = () => {
    amendAction.value = latestRound.value?.status === 'approved' ? 'reject' : 'approve';
    amendRemark.value = '';
    amendOpen.value = true;
};

const submitAmend = () => {
    emit('amend', amendAction.value, amendRemark.value.trim() || undefined);
};

const imageUrls = ref<Record<number, string>>({});
const imageErrors = ref<Record<number, string>>({});
const imageLoading = ref(false);

const revokeUrls = () => {
    Object.values(imageUrls.value).forEach((url) => URL.revokeObjectURL(url));
    imageUrls.value = {};
};

// 记录已加载的案件，避免 show / appeal 两次变更重复拉取图片
let loadedCaseKey: string | null = null;

const loadImages = async () => {
    const images = rounds.value.flatMap((round) => round.images ?? []);
    const caseKey = `${props.appeal?.id ?? ''}:${images.map((item) => item.id).join(',')}`;
    if (caseKey === loadedCaseKey) {
        return;
    }
    loadedCaseKey = caseKey;

    revokeUrls();
    imageErrors.value = {};
    if (!images.length) {
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
    () => [props.show, props.appeal?.id, rounds.value.length],
    () => {
        if (props.show) {
            rejectRemark.value = '';
            amendOpen.value = false;
            amendRemark.value = '';
            void loadImages();
        } else {
            revokeUrls();
            imageErrors.value = {};
            loadedCaseKey = null;
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

.round-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.round-title {
    font-size: 14px;
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
    margin-top: 10px;
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
    width: 180px;
    height: 100px;
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
    max-width: 180px;
}

.evidence-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-images {
    display: block;
    margin-top: 8px;
    font-size: 13px;
}

.round-review {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed var(--n-border-color);
}

.amend-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.action-bar {
    padding-top: 4px;
}
</style>
