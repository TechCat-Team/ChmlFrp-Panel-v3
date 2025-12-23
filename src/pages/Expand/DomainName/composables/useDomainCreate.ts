import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import type { DomainFormModel, FastDomainFormModel, SelectedTunnelInfo } from '../types';
import { DEFAULT_TTL, MINECRAFT_SRV_CONFIG, INFO_MESSAGES, REMARKS } from '../constants';

/**
 * 创建域名 composable
 */
export function useDomainCreate(userInfo: { usertoken?: string } | undefined, onSuccess: () => void) {
    const message = useMessage();
    const dialog = useDialog();
    const loading = ref(false);

    const createDomain = async (formData: DomainFormModel) => {
        loading.value = true;
        try {
            await api.v2.domain.createFreeSubdomain({
                token: userInfo?.usertoken || '',
                domain: formData.selectedDomain,
                record: formData.recordValue,
                type: formData.selectedRecordType,
                ttl: formData.TTLValue,
                target: formData.target,
                remarks: REMARKS.CUSTOM,
            });

            dialog.success({
                title: '成功',
                content: INFO_MESSAGES.DNS_PROPAGATION,
                positiveText: '我知道了',
                onPositiveClick: () => {
                    message.success('免费域名创建成功');
                    onSuccess();
                },
            });
            return true;
        } catch (error) {
            message.error('创建免费域名失败: ' + (error as Error).message);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const createFastDomain = async (formData: FastDomainFormModel, tunnelInfo: SelectedTunnelInfo | null) => {
        if (!tunnelInfo) {
            message.error('请选择隧道');
            return false;
        }

        loading.value = true;
        let record = formData.recordValue;
        let target = tunnelInfo.ip;
        let type = formData.selectedRecordType;

        if (formData.selectedRecordType === 'Java版MC') {
            type = 'SRV';
            record = MINECRAFT_SRV_CONFIG.PREFIX + formData.recordValue;
            target = MINECRAFT_SRV_CONFIG.TARGET_FORMAT(tunnelInfo.dorp, tunnelInfo.ip);
        }

        try {
            await api.v2.domain.createFreeSubdomain({
                token: userInfo?.usertoken || '',
                domain: formData.selectedDomain,
                record,
                type,
                ttl: DEFAULT_TTL,
                target,
                remarks: REMARKS.FAST_RESOLUTION(formData.selectedRecordType, tunnelInfo.label),
            });

            dialog.success({
                title: '成功',
                content: INFO_MESSAGES.DNS_PROPAGATION_SHORT,
                positiveText: '我知道了',
                onPositiveClick: () => {
                    message.success('免费域名创建成功');
                    onSuccess();
                },
            });
            return true;
        } catch (error) {
            message.error('创建免费域名失败: ' + (error as Error).message);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        createDomain,
        createFastDomain,
    };
}
