import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { Certificate } from '../types';
import type { CertificateStatus } from '@/api/v2/ssl/ssl';

/**
 * 证书列表管理 composable
 */
export function useCertificateList(userInfo: { usertoken?: string } | undefined) {
    const message = useMessage();
    const loading = ref(false);
    const certificateData = ref<Certificate[]>([]);
    const statusFilter = ref<CertificateStatus | 'all'>('all');

    // 处理证书数据，解析域名列表等
    const processCertificate = (cert: any): Certificate => {
        const domains = cert.domains.split(',').map((d: string) => d.trim());
        const isWildcard = domains.some((d: string) => d.startsWith('*.'));
        const hasRootDomain = domains.some((d: string) => {
            const domain = d.replace(/^\*\./, '');
            return domains.some((other: string) => {
                const otherDomain = other.replace(/^\*\./, '');
                return otherDomain === domain && !other.startsWith('*.');
            });
        });

        return {
            ...cert,
            domainList: domains,
            isWildcard,
            hasRootDomain,
        };
    };

    const fetchCertificateData = async () => {
        if (!userInfo?.usertoken) {
            return;
        }

        loading.value = true;
        try {
            const status = statusFilter.value === 'all' ? undefined : statusFilter.value;
            const response = await api.v2.ssl.getCertificateList(userInfo.usertoken, status);
            certificateData.value = response.data.certificates.map(processCertificate);
        } catch (error) {
            message.error('获取证书列表失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        certificateData,
        statusFilter,
        fetchCertificateData,
    };
}
