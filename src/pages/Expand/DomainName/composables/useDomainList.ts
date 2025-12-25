import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { FreeDomain } from '../types';

/**
 * 域名列表管理 composable
 */
export function useDomainList(userInfo: { usertoken?: string } | undefined) {
    const message = useMessage();
    const loading = ref(false);
    const domainData = ref<FreeDomain[]>([]);

    const fetchDomainData = async () => {
        loading.value = true;
        try {
            const response = await api.v2.domain.getUserFreeSubdomains(userInfo?.usertoken || '');
            domainData.value = response.data;
        } catch (error) {
            message.error('获取创建的免费域名数据失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        domainData,
        fetchDomainData,
    };
}
