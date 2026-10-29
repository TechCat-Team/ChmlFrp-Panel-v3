/**
 * 违规审查 - 批量处置 composable
 *
 * 选中的案件共用同一份处置范围、期限与理由，由后端统一执行并回传失败明细。
 * 支持批量封禁（ban）与批量解除封禁（release）。
 */
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
    batchReviewViolations,
    type ViolationBatchReviewResponse,
    type ViolationDecisionDraft,
} from '@/api/v2/admin/violation';
import { prepareIdempotentRequest, completeIdempotentRequest } from '@/utils/idempotentRequest';

const BAN_IDEMPOTENT_KEY = 'violation-batch-ban';
const RELEASE_IDEMPOTENT_KEY = 'violation-batch-release';

export function useViolationBatchReview(onDone: () => void) {
    const message = useMessage();

    const showModal = ref(false);
    const submitting = ref(false);
    const selectedIds = ref<number[]>([]);

    const summarize = (response: ViolationBatchReviewResponse, verb: string) => {
        const success = response.data?.success ?? 0;
        const failed = response.data?.failed ?? [];
        if (failed.length) {
            const detail = failed
                .slice(0, 3)
                .map((item) => `#${item.id} ${item.msg}`)
                .join('；');
            message.warning(`已${verb} ${success} 条，${failed.length} 条失败：${detail}`);
        } else {
            message.success(`已${verb} ${success} 条案件，正在同步节点`);
        }
    };

    const open = (ids: number[]) => {
        if (!ids.length) {
            message.warning('请先勾选要封禁的案件');
            return;
        }
        selectedIds.value = [...ids].sort((a, b) => a - b);
        showModal.value = true;
    };

    const submit = async (draft: ViolationDecisionDraft) => {
        if (!selectedIds.value.length || submitting.value) return;
        if (!draft.reason.trim()) {
            message.warning('请填写封禁原因');
            return;
        }
        const ids = [...selectedIds.value];
        const signature = JSON.stringify({ ids, action: 'ban', ...draft });
        const payload = prepareIdempotentRequest(BAN_IDEMPOTENT_KEY, signature, () => ({
            ids,
            action: 'ban' as const,
            scope: draft.scope,
            reason: draft.reason.trim(),
            expires_at: draft.durationSeconds ? Date.now() + draft.durationSeconds * 1000 : null,
        }));
        submitting.value = true;
        try {
            const response = await batchReviewViolations(payload);
            completeIdempotentRequest(BAN_IDEMPOTENT_KEY);
            summarize(response, '封禁');
            showModal.value = false;
            selectedIds.value = [];
            onDone();
        } catch (error: any) {
            message.error(
                error?.details?.data?.msg || error?.message || '批量封禁失败；重试会复用本次请求，不会重复处理'
            );
        } finally {
            submitting.value = false;
        }
    };

    /** 批量解除本条封禁：仅撤销所选案件的限制，其他有效限制继续生效 */
    const release = async (ids: number[]) => {
        if (!ids.length) {
            message.warning('请先勾选要解除封禁的案件');
            return;
        }
        if (submitting.value) return;
        const sortedIds = [...ids].sort((a, b) => a - b);
        const signature = JSON.stringify({ ids: sortedIds, action: 'release' });
        const payload = prepareIdempotentRequest(RELEASE_IDEMPOTENT_KEY, signature, () => ({
            ids: sortedIds,
            action: 'release' as const,
            scope: 'user' as const,
            reason: '',
            expires_at: null,
        }));
        submitting.value = true;
        try {
            const response = await batchReviewViolations(payload);
            completeIdempotentRequest(RELEASE_IDEMPOTENT_KEY);
            summarize(response, '解除封禁');
            onDone();
        } catch (error: any) {
            message.error(
                error?.details?.data?.msg || error?.message || '批量解除封禁失败；重试会复用本次请求，不会重复处理'
            );
        } finally {
            submitting.value = false;
        }
    };

    return { showModal, submitting, selectedIds, open, submit, release };
}
