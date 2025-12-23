import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import type { MembershipType, DurationType } from '../types';

/**
 * 会员购买 composable
 */
export function useMembershipPurchase(userInfo: { usertoken?: string; integral?: number } | undefined) {
    const message = useMessage();
    const dialog = useDialog();
    const userStore = useUserStore();

    const loading = ref(false);
    const selectedMembership = ref<MembershipType | ''>('');
    const selectedDuration = ref<DurationType | null>(null);

    const handlePurchase = async () => {
        if (!selectedMembership.value || !selectedDuration.value) return;

        loading.value = true;
        try {
            const response = await axios.get('https://cf-v1.uapis.cn/api/jfsc.php', {
                params: {
                    usertoken: userInfo?.usertoken,
                    package: selectedMembership.value,
                    term: selectedDuration.value,
                },
            });
            const data = response.data;
            if (data?.status === 'success') {
                userStore.setUser({ term: data.daoqi });
                userStore.setUser({ integral: (userInfo?.integral ?? 0) - data.points });
                userStore.setUser({ usergroup: data.package });
                userStore.setUser({ tunnel: data.tunnel });
                userStore.setUser({ bandwidth: data.bandwidth });
                dialog.success({
                    title: '会员购买成功',
                    content:
                        '您购买了' +
                        data.package +
                        '，到期日期为' +
                        data.daoqi +
                        '，消耗了' +
                        data.points +
                        '点积分，感谢您的支持！',
                    positiveText: '确认',
                    onPositiveClick: () => {
                        message.success('再次感谢您对ChmlFrp的支持！');
                    },
                });
            } else {
                message.error(data?.message);
            }
        } catch (error) {
            console.error('购买请求失败:', error);
            message.error('购买请求异常，请检查网络或稍后再试');
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        selectedMembership,
        selectedDuration,
        handlePurchase,
    };
}
