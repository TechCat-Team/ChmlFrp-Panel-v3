import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { DomainOption, Domain } from '../types';

/**
 * 域名选项管理 composable
 */
export function useDomainOptions() {
    const message = useMessage();
    const domainNameOptions = ref<DomainOption[]>([]);
    const loading = ref(false);

    const fetchDomainOptions = async () => {
        loading.value = true;
        try {
            const domains = (await api.v2.domain.listAvailableDomains()).data as Domain[];

            domainNameOptions.value = domains.map((domain) => ({
                label: domain.domain,
                value: domain.domain,
            }));
        } catch (error) {
            message.error('获取域名数据失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    return {
        domainNameOptions,
        loading,
        fetchDomainOptions,
    };
}

