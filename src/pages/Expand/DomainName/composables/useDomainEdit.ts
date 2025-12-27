import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import type { DomainFormModel } from '../types';
import { INFO_MESSAGES, REMARKS } from '../constants';

/**
 * 编辑域名 composable
 */
export function useDomainEdit(onSuccess: () => void) {
    const message = useMessage();
    const dialog = useDialog();
    const loading = ref(false);

    const updateDomain = async (formData: DomainFormModel) => {
        loading.value = true;
        try {
            await api.v2.domain.updateFreeSubdomain({
                domain: formData.selectedDomain,
                record: formData.recordValue,
                ttl: formData.TTLValue,
                target: formData.target,
                remarks: REMARKS.CUSTOM_RESOLUTION,
            });

            dialog.success({
                title: '成功',
                content: INFO_MESSAGES.DNS_PROPAGATION_UPDATE,
                positiveText: '我知道了',
                onPositiveClick: () => {
                    message.success('免费域名修改成功！');
                    onSuccess();
                },
            });
            return true;
        } catch (error) {
            message.error('修改免费域名失败: ' + (error as Error).message);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        updateDomain,
    };
}
