import { useMessage } from 'naive-ui';
import api from '@/api';
import type { FreeDomain } from '../types';
import { SUCCESS_MESSAGES } from '../constants';

/**
 * 删除域名 composable
 */
export function useDomainDelete(userInfo: { usertoken?: string } | undefined, onSuccess: () => void) {
    const message = useMessage();

    const deleteDomain = async (domain: FreeDomain, index: number) => {
        try {
            await api.v2.domain.deleteFreeSubdomain({
                domain: domain.domain,
                record: domain.record,
            });

            message.success(SUCCESS_MESSAGES.DELETE_DOMAIN(domain.record, domain.domain));
            onSuccess();
            return true;
        } catch (error) {
            message.error('删除免费域名失败: ' + (error as Error).message);
            return false;
        }
    };

    return {
        deleteDomain,
    };
}
