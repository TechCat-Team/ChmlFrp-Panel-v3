/**
 * 违规审查 - 详情弹窗与审核动作 composable
 */
import { ref, watch, onBeforeUnmount } from 'vue';
import { useMessage } from 'naive-ui';
import {
    getViolationDetail,
    reviewViolation,
    type ViolationDetail,
    type ViolationRecord,
    type ViolationReviewAction,
    type ViolationDecisionDraft,
} from '@/api/v2/admin/violation';
import { prepareIdempotentRequest, completeIdempotentRequest } from '@/utils/idempotentRequest';
import { REVIEW_ACTION_LABEL } from '../constants';

export function useViolationDetail(onReviewed: () => void) {
    const message = useMessage();

    const showDetailModal = ref(false);
    const current = ref<ViolationDetail | null>(null);
    const detailLoading = ref(false);
    const reviewing = ref(false);

    /** 打开违规详情；申诉列表可传入关联封禁记录对应的违规记录 id 直接转入对应案件 */
    let detailRequestSeq = 0;
    const handleViewDetail = async (row: Pick<ViolationRecord, 'id'>) => {
        const seq = ++detailRequestSeq;
        showDetailModal.value = true;
        detailLoading.value = true;
        current.value = null;
        try {
            const response = await getViolationDetail(row.id);
            // 丢弃过期响应，避免先发起的请求覆盖后打开的记录
            if (seq !== detailRequestSeq) return;
            current.value = response.data;
        } catch (error: any) {
            if (seq !== detailRequestSeq) return;
            message.error(error?.message || '加载违规详情失败');
            showDetailModal.value = false;
        } finally {
            if (seq === detailRequestSeq) detailLoading.value = false;
        }
    };

    const handleReviewAction = async (action: ViolationReviewAction, draft?: ViolationDecisionDraft) => {
        const target = current.value;
        if (!target || !draft || reviewing.value) return;
        if (action === 'ban' && !draft.reason.trim()) {
            message.warning('请填写封禁原因');
            return;
        }
        const key = `decision:${target.id}`;
        const expectedVersion = target.workflow.version;
        const signature = JSON.stringify({ action, ...draft, expectedVersion });
        const submission = prepareIdempotentRequest(key, signature, () => ({
            action,
            scope: draft.scope,
            reason: draft.reason.trim(),
            expected_version: expectedVersion,
            expires_at: action === 'ban' && draft.durationSeconds ? Date.now() + draft.durationSeconds * 1000 : null,
        }));
        reviewing.value = true;
        try {
            const result = await reviewViolation(target.id, submission);
            completeIdempotentRequest(key);
            message.success(`${REVIEW_ACTION_LABEL[action]}决策已保存，正在同步节点`);
            target.status = result.data.status;
            target.workflow.version = result.data.version;
            onReviewed();
        } catch (error: any) {
            if (error?.details?.status === 409 || error?.details?.code === 409) {
                completeIdempotentRequest(key);
                await handleViewDetail(target);
                onReviewed();
            }
            message.error(error?.details?.data?.msg || error?.message || '提交失败；重试会复用本次请求，不会重复处理');
        } finally {
            reviewing.value = false;
            void refreshDetail(true);
        }
    };

    const refreshDetail = async (silent = false) => {
        const id = current.value?.id;
        if (!id || reviewing.value) return;
        if (!silent) detailLoading.value = true;
        try {
            const result = await getViolationDetail(id);
            if (current.value?.id === id) current.value = result.data;
        } catch (error: any) {
            if (!silent) message.error(error?.message || '刷新进度失败');
        } finally {
            if (!silent) detailLoading.value = false;
        }
    };
    let poll: ReturnType<typeof setInterval> | undefined;
    watch(showDetailModal, (visible) => {
        if (poll) clearInterval(poll);
        poll = visible
            ? setInterval(() => {
                  void refreshDetail(true);
              }, 10_000)
            : undefined;
    });
    onBeforeUnmount(() => {
        if (poll) clearInterval(poll);
    });

    return {
        showDetailModal,
        current,
        detailLoading,
        reviewing,
        handleViewDetail,
        handleReviewAction,
        refreshDetail,
    };
}
