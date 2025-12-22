import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { getGiftcardHistory } from '@/api/v2/giftcard/giftcard';
import type { GiftcardHistoryItem } from '@/api/v2/giftcard/giftcard';

/**
 * 礼品卡历史记录 composable
 */
export function useGiftcardHistory(userInfo: { usertoken?: string }) {
    const message = useMessage();
    const loading = ref(false);
    const historyData = ref<GiftcardHistoryItem[]>([]);
    const showHistory = ref(false);

    const loadHistory = async () => {
        if (!userInfo?.usertoken) {
            message.error('用户令牌无效，请重新登录');
            return;
        }

        loading.value = true;
        try {
            const response = await getGiftcardHistory(userInfo.usertoken);

            if (response.success && response.data) {
                historyData.value = response.data;
                showHistory.value = true;
            } else {
                message.error(response.message || '获取历史记录失败');
            }
        } catch (error) {
            console.error('获取礼品卡历史记录失败', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('获取历史记录失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        historyData,
        showHistory,
        loadHistory,
    };
}

