<template>
    <n-modal
        v-model:show="showModel"
        preset="card"
        :title="`违规审查 · #${violation?.id ?? ''}`"
        size="large"
        style="max-width: 900px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-spin :show="loading">
            <n-space vertical :size="16" v-if="violation">
                <n-card :bordered="false" embedded class="detail-info-card">
                    <n-descriptions :column="2" bordered>
                        <n-descriptions-item label="违规类型">
                            <n-tag :type="getTypeTagType(violation.type)" size="small" round>
                                {{ getTypeLabel(violation.type) }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="关联用户">
                            <span
                                v-if="violation.user_id"
                                style="cursor: pointer; white-space: nowrap"
                                title="点击搜索该用户的全部违纪记录"
                                @click="emit('search-user', violation.username)"
                            >
                                #{{ violation.user_id }} · {{ violation.username }}
                            </span>
                            <span v-else class="mono-text">未关联</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="违规内容">
                            <div class="detail-title">{{ violation.title }}</div>
                        </n-descriptions-item>
                        <n-descriptions-item label="关联目标">
                            <template v-if="isExternalTarget">
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
                                <span class="mono-text">{{ violation.target || '-' }}</span>
                            </template>
                        </n-descriptions-item>
                        <n-descriptions-item label="发现时间">
                            <span class="time-text">{{ formatViolationTime(violation.reported_at) }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="证据附件数">
                            <n-badge :value="violation.evidence_count" :max="99" :show="violation.evidence_count > 0" />
                            <span v-if="!violation.evidence_count" class="mono-text">无</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="上报来源">
                            <span>{{ violation.reporter || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="上报节点">
                            <span class="mono-text">{{ violation.node_name || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="关联隧道">
                            <span class="mono-text">{{ violation.tunnel_name || '-' }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="当前状态">
                            <n-tag :type="getStatusTagType(violation.status)" size="small" round>
                                {{ getStatusLabel(violation.status) }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="审核信息">
                            <span v-if="violation.reviewed_at" class="time-text">
                                {{ violation.reviewed_by_name || '管理员' }} ·
                                {{ formatViolationTime(violation.reviewed_at) }}
                            </span>
                            <span v-else class="mono-text">尚未审核</span>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-card>

                <n-card v-if="violation.review_remark" :bordered="false" embedded class="detail-content-card">
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="DocumentTextOutline" :size="18" />
                            <span>审核备注</span>
                        </div>
                    </template>
                    <div class="desc-text">{{ violation.review_remark }}</div>
                </n-card>

                <n-card :bordered="false" embedded class="detail-content-card">
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="DocumentTextOutline" :size="18" />
                            <span>违规描述</span>
                        </div>
                    </template>
                    <n-alert
                        v-if="textReview?.urlHold && violation.status === 'pending'"
                        type="warning"
                        :bordered="false"
                        style="margin-bottom: 12px"
                    >
                        AI 判定不安全，该 URL
                        已进入临时阻断。审核完成并同步到节点后解除；封禁决定产生的账号或隧道限制继续生效。
                    </n-alert>
                    <n-alert
                        v-if="textReview?.excerpt && !textReview.urlHold && violation.status === 'pending'"
                        type="info"
                        :bordered="false"
                        style="margin-bottom: 12px"
                    >
                        AI 审查的是命中上下文节选，当前仅提交人工复审，未自动阻断该 URL。确认违规后再按人工决定处置。
                    </n-alert>
                    <n-descriptions v-if="textReview" :column="2" bordered size="small">
                        <n-descriptions-item label="转人工原因">{{ textReview.reason }}</n-descriptions-item>
                        <n-descriptions-item label="响应文本字数">{{ textReview.characters }}</n-descriptions-item>
                        <n-descriptions-item label="关键词">{{ textReview.keywords }}</n-descriptions-item>
                        <n-descriptions-item label="AI 判定">{{ textReview.verdict }}</n-descriptions-item>
                        <n-descriptions-item label="AI 审查范围">{{ textReview.reviewScope }}</n-descriptions-item>
                        <n-descriptions-item label="模型类别">{{ textReview.categories }}</n-descriptions-item>
                        <n-descriptions-item label="证据范围">{{
                            textReview.truncated ? '正文节选与命中上下文' : '完整响应文本'
                        }}</n-descriptions-item>
                    </n-descriptions>
                    <div v-else class="desc-text">{{ violation.description || '上报方未提供描述' }}</div>
                </n-card>

                <n-card :bordered="false" embedded class="detail-content-card">
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="ImageOutline" :size="18" />
                            <span>证据预览</span>
                            <n-tag size="small" :type="hasPrivateKey ? 'success' : 'warning'" round>
                                {{ hasPrivateKey ? '端到端解密' : '未设置私钥' }}
                            </n-tag>
                        </div>
                    </template>

                    <n-alert
                        v-if="!hasPrivateKey && violation.evidences.length"
                        type="warning"
                        :bordered="false"
                        class="key-alert"
                    >
                        证据附件已加密存储，请先点击筛选栏右侧的「设置解密私钥」按钮完成设置后再查看。
                    </n-alert>

                    <div v-if="violation.evidences.length" class="evidence-wrap">
                        <div v-for="item in violation.evidences" :key="item.id" class="evidence-item">
                            <div v-if="evidenceTexts[item.id] !== undefined" class="text-evidence">
                                <n-text depth="3">响应文本证据（仅以纯文本显示）</n-text>
                                <pre>{{ evidenceTexts[item.id] }}</pre>
                                <n-button
                                    tag="a"
                                    :href="evidenceUrls[item.id]"
                                    :download="`evidence-${item.id}.txt`"
                                    size="small"
                                    >下载文本证据</n-button
                                >
                            </div>
                            <n-image
                                v-else-if="evidenceUrls[item.id]"
                                :src="evidenceUrls[item.id]"
                                width="260"
                                class="evidence-img"
                                object-fit="cover"
                            />
                            <div v-else class="evidence-placeholder">
                                <n-spin v-if="decrypting && !evidenceErrors[item.id]" :size="20" />
                                <n-text v-else depth="3" class="evidence-error">
                                    {{ evidenceErrors[item.id] || '未解密' }}
                                </n-text>
                            </div>
                            <div class="evidence-meta">
                                <span>{{ item.content_type }}</span>
                                <span>{{ formatEvidenceSize(item.size_bytes) }}</span>
                            </div>
                        </div>
                    </div>
                    <n-empty v-else description="该记录没有证据附件" />
                </n-card>

                <WorkflowPanel
                    v-if="violation.workflow"
                    :key="violation.id"
                    :workflow="violation.workflow"
                    :refreshing="loading || false"
                    @refresh="emit('refresh')"
                />
                <n-divider />
                <n-space v-if="violation.status === 'pending' || violation.status === 'banned'" vertical>
                    <n-form label-placement="top">
                        <n-form-item label="处置范围">
                            <n-select
                                v-model:value="scope"
                                :disabled="reviewing || violation.status === 'banned'"
                                :options="scopeOptions"
                            />
                        </n-form-item>
                        <n-form-item v-if="violation.status === 'pending'" label="封禁期限">
                            <n-select
                                v-model:value="durationSeconds"
                                :disabled="reviewing"
                                :options="durationOptions"
                            />
                        </n-form-item>
                        <n-form-item label="处置理由（封禁必填）">
                            <n-input
                                v-model:value="reason"
                                type="textarea"
                                maxlength="500"
                                show-count
                                :disabled="reviewing"
                                placeholder="填写判定依据和处置原因"
                            />
                        </n-form-item>
                    </n-form>
                    <n-space justify="end">
                        <template v-if="violation.status === 'pending'">
                            <n-button type="success" :disabled="reviewing" @click="review('pass')"
                                >误报放行并解除隔离</n-button
                            >
                            <n-popconfirm @positive-click="review('ban')">
                                <template #trigger
                                    ><n-button type="error" :disabled="reviewing || !reason.trim()" :loading="reviewing"
                                        >确认封禁</n-button
                                    ></template
                                >
                                将限制{{
                                    scope === 'user' ? '该账号的全部隧道' : '当前隧道'
                                }}，并关闭已有连接，确认执行？
                            </n-popconfirm>
                        </template>
                        <n-popconfirm v-else @positive-click="review('release')">
                            <template #trigger
                                ><n-button type="warning" :disabled="reviewing" :loading="reviewing"
                                    >解除本条封禁</n-button
                                ></template
                            >
                            仅解除本条封禁，其他有效限制将继续生效。
                        </n-popconfirm>
                        <n-button :disabled="reviewing" @click="showModel = false">关闭</n-button>
                    </n-space>
                </n-space>
            </n-space>
            <n-empty v-else-if="!loading" description="暂无记录详情" />
        </n-spin>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import WorkflowPanel from './WorkflowPanel.vue';
import {
    BanOutline,
    CheckmarkCircle,
    CloseCircle,
    DocumentTextOutline,
    ImageOutline,
    LinkOutline,
} from '@vicons/ionicons5';
import {
    fetchViolationEvidenceCiphertext,
    type ViolationDetail,
    type ViolationReviewAction,
    type ViolationDecisionDraft,
} from '@/api/v2/admin/violation';
import { decryptEvidence } from '@/utils/evidenceCrypto';
import { summarizeTextReview } from '@/utils/textReview';
import {
    formatEvidenceSize,
    formatViolationTime,
    getStatusLabel,
    getStatusTagType,
    getTypeLabel,
    getTypeTagType,
} from '../constants';
import { useEvidencePrivateKey } from '../composables/useEvidencePrivateKey';

const props = defineProps<{
    show: boolean;
    violation: ViolationDetail | null;
    loading?: boolean;
    reviewing?: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    review: [action: ViolationReviewAction, draft: ViolationDecisionDraft];
    refresh: [];
    'search-user': [username: string];
}>();

const scope = ref<'user' | 'tunnel'>('user');
const reason = ref('');
const durationSeconds = ref(0);
const scopeOptions = computed(() => [
    { label: '整个账号', value: 'user' },
    { label: '仅当前隧道', value: 'tunnel', disabled: !props.violation?.workflow?.tunnel_id },
]);
const durationOptions = [
    { label: '永久', value: 0 },
    { label: '1 小时', value: 3600 },
    { label: '24 小时', value: 86400 },
    { label: '7 天', value: 604800 },
];
watch(
    () => `${props.violation?.id}:${props.violation?.status}:${props.violation?.workflow?.version}`,
    () => {
        reason.value = '';
        durationSeconds.value = 0;
        const original = props.violation?.workflow?.restrictions?.find((item) => !item.revoked_at);
        scope.value = original ? (original.tunnel_id ? 'tunnel' : 'user') : 'user';
    }
);
const review = (action: ViolationReviewAction) =>
    emit('review', action, { scope: scope.value, reason: reason.value, durationSeconds: durationSeconds.value });

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const { hasPrivateKey, revision } = useEvidencePrivateKey();

const evidenceUrls = ref<Record<number, string>>({});
const evidenceTexts = ref<Record<number, string>>({});
const evidenceErrors = ref<Record<number, string>>({});
const decrypting = ref(false);

const textReview = computed(() => summarizeTextReview(props.violation));

const isExternalTarget = computed(() => /^https?:\/\//i.test(props.violation?.target ?? ''));

const revokeUrls = () => {
    Object.values(evidenceUrls.value).forEach((url) => URL.revokeObjectURL(url));
    evidenceUrls.value = {};
    evidenceTexts.value = {};
};

// 记录已加载的签名，避免同一记录被 show / violation 两次变更重复解密
let loadedSignature = '';
let evidenceGeneration = 0;

const loadEvidences = async () => {
    const evidences = props.violation?.evidences ?? [];
    const signature = `${props.violation?.id ?? 0}:${revision.value}:${hasPrivateKey.value}:${evidences.map((item) => item.id).join(',')}`;
    if (signature === loadedSignature) {
        return;
    }
    loadedSignature = signature;
    const generation = ++evidenceGeneration;

    revokeUrls();
    evidenceErrors.value = {};
    if (!evidences.length) {
        return;
    }
    if (!hasPrivateKey.value) {
        evidences.forEach((item) => {
            evidenceErrors.value[item.id] = '未设置解密私钥';
        });
        return;
    }

    decrypting.value = true;
    await Promise.all(
        evidences.map(async (item) => {
            try {
                const ciphertext = await fetchViolationEvidenceCiphertext(item.id);
                const blob = await decryptEvidence(ciphertext, item.content_type, item.key_id);
                const text = item.content_type === 'text/plain' ? await blob.text() : undefined;
                if (generation === evidenceGeneration) {
                    evidenceUrls.value[item.id] = URL.createObjectURL(blob);
                    if (text !== undefined) evidenceTexts.value[item.id] = text;
                }
            } catch (error: any) {
                if (generation === evidenceGeneration) evidenceErrors.value[item.id] = error?.message || '证据解密失败';
            }
        })
    );
    if (generation === evidenceGeneration) decrypting.value = false;
};

watch(
    () => [props.show, props.violation?.id, revision.value],
    () => {
        if (props.show) {
            void loadEvidences();
        } else {
            evidenceGeneration += 1;
            revokeUrls();
            evidenceErrors.value = {};
            loadedSignature = '';
        }
    },
    { immediate: true }
);

onBeforeUnmount(() => {
    evidenceGeneration += 1;
    revokeUrls();
});
</script>

<style scoped lang="scss">
.text-evidence {
    width: min(760px, 100%);
    pre {
        max-height: 360px;
        overflow: auto;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-size: 13px;
        line-height: 1.7;
    }
}

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

.key-alert {
    margin-bottom: 12px;
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
    width: 260px;
    height: 146px;
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
