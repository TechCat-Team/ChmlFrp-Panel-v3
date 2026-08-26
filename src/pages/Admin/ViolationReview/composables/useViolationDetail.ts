/**
 * 违规审查 - 详情弹窗与审核动作 composable
 */
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import type { Violation } from '../types';

export function useViolationDetail() {
    const message = useMessage();

    const showDetailModal = ref(false);
    const current = ref<Violation | null>(null);

    const handleViewDetail = (row: Violation) => {
        current.value = row;
        showDetailModal.value = true;
    };

    const handleReviewAction = (action: string) => {
        // UI-only 页面，操作暂未接入后端
        message.info(`「${action}」功能暂未接入，敬请期待`, { duration: 2000 });
    };

    return {
        showDetailModal,
        current,
        handleViewDetail,
        handleReviewAction,
    };
}
