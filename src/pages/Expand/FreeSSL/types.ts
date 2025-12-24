/**
 * SSL证书管理页面类型定义
 */

import type { CertificateListItem, SSLProvider, ChallengeType, CertificateStatus } from '@/api/v2/ssl/ssl';

export interface Certificate extends CertificateListItem {
    // 扩展字段
    domainList?: string[]; // 解析后的域名列表
    isWildcard?: boolean; // 是否包含泛域名
    hasRootDomain?: boolean; // 是否包含根域名
}

export interface CertificateFormModel {
    provider: SSLProvider | null;
    domains: string[];
    challengeType: ChallengeType;
}

export interface ProviderOption {
    label: string;
    value: SSLProvider;
}

export interface ChallengeTypeOption {
    label: string;
    value: ChallengeType;
    description: string;
}

export interface StatusOption {
    label: string;
    value: CertificateStatus | 'all';
}
