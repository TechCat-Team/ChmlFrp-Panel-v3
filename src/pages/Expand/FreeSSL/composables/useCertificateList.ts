import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { Certificate } from '../types';

/**
 * 证书列表管理 composable
 */
export function useCertificateList(userInfo: { usertoken?: string } | undefined) {
    const message = useMessage();
    const loading = ref(false);
    const certificateData = ref<Certificate[]>([]);

    // 提取域名的根域名（如 test2.chaoji.info -> chaoji.info）
    const getRootDomain = (domain: string): string => {
        const cleaned = domain.replace(/^\*\./, '');
        const parts = cleaned.split('.');
        // 如果只有两部分（如 example.com），本身就是根域名
        if (parts.length <= 2) {
            return cleaned;
        }
        // 否则取最后两部分作为根域名
        return parts.slice(-2).join('.');
    };

    // 处理证书数据，解析域名列表等
    const processCertificate = (cert: any): Certificate => {
        const domains = cert.domains.split(',').map((d: string) => d.trim());
        const isWildcard = domains.some((d: string) => d.startsWith('*.'));
        const isMultipleDomains = domains.length > 1;
        
        // 检查是否包含根域名：只有当域名列表中同时包含子域名（或泛域名）和对应的根域名时，才为 true
        const hasRootDomain = domains.some((d: string) => {
            const domain = d.replace(/^\*\./, '');
            const rootDomain = getRootDomain(domain);
            // 如果域名本身就是根域名，检查是否有其他域名（子域名或泛域名）的根域名是这个域名
            if (domain === rootDomain) {
                return domains.some((other: string) => {
                    if (other === d) return false; // 排除自己
                    const otherDomain = other.replace(/^\*\./, '');
                    const otherRootDomain = getRootDomain(otherDomain);
                    return otherRootDomain === rootDomain && otherDomain !== rootDomain;
                });
            }
            // 如果域名是子域名或泛域名，检查其根域名是否也在列表中
            return domains.some((other: string) => {
                const otherDomain = other.replace(/^\*\./, '');
                return otherDomain === rootDomain && other !== d;
            });
        });

        return {
            ...cert,
            domainList: domains,
            isWildcard,
            hasRootDomain,
            isMultipleDomains,
        };
    };

    const fetchCertificateData = async () => {
        if (!userInfo?.usertoken) {
            return;
        }

        loading.value = true;
        try {
            const response = await api.v2.ssl.getCertificateList(userInfo.usertoken, undefined);
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
        fetchCertificateData,
    };
}
