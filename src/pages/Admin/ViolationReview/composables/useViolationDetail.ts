/**
 * 违规审查 - 详情弹窗与审核动作 composable
 */
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
    getViolationDetail,
    reviewViolation,
    type ViolationDetail,
    type ViolationRecord,
    type ViolationReviewAction,
} from '@/api/v2/admin/violation';
import { REVIEW_ACTION_LABEL } from '../constants';

export function useViolationDetail(onReviewed: () => void) {
    const message = useMessage();

    const showDetailModal = ref(false);
    const current = ref<ViolationDetail | null>(null);
    const detailLoading = ref(false);
    const reviewing = ref(false);

    const handleViewDetail = async (row: ViolationRecord) => {
        showDetailModal.value = true;
        detailLoading.value = true;
        current.value = null;
        try {
            const response = await getViolationDetail(row.id);
            current.value = response.data;
        } catch (error: any) {
            message.error(error?.message || '加载违规详情失败');
            showDetailModal.value = false;
        } finally {
            detailLoading.value = false;
        }
    };

    /**
     * 审核动作。从表格下拉触发时传入 row，从详情弹窗触发时使用当前详情。
     */
    const handleReviewAction = async (action: ViolationReviewAction, row?: ViolationRecord) => {
        const target = row ?? current.value;
        if (!target || reviewing.value) {
            return;
        }
        reviewing.value = true;
        try {
            await reviewViolation(target.id, action);
            message.success(`已${REVIEW_ACTION_LABEL[action]}`);
            showDetailModal.value = false;
            onReviewed();
        } catch (error: any) {
            message.error(error?.message || '审核失败，请稍后重试');
        } finally {
            reviewing.value = false;
        }
    };

    return {
        showDetailModal,
        current,
        detailLoading,
        reviewing,
        handleViewDetail,
        handleReviewAction,
    };
}
