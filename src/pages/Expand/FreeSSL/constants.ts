/**
 * SSL证书管理页面常量
 */

import type { ProviderOption, ChallengeTypeOption, StatusOption } from './types';
import type { SSLProvider, ChallengeType, CertificateStatus } from '@/api/v2/ssl/ssl';

// SSL提供商选项
export const PROVIDER_OPTIONS: ProviderOption[] = [
    { label: "Let's Encrypt", value: 'letsencrypt' },
    { label: 'ZeroSSL', value: 'zerossl' },
    { label: 'Google', value: 'google' },
];

// 挑战类型选项
export const CHALLENGE_TYPE_OPTIONS: ChallengeTypeOption[] = [
    {
        label: 'HTTP-01 挑战',
        value: 'http01',
        description: '通过HTTP验证域名所有权，需要域名可以访问服务器（端口80）',
    },
    {
        label: 'DNS-01 挑战',
        value: 'dns01',
        description: '通过DNS TXT记录验证域名所有权，适合泛域名证书和无法开放HTTP端口的场景',
    },
];

// 证书状态选项
export const STATUS_OPTIONS: StatusOption[] = [
    { label: '全部', value: 'all' },
    { label: '待验证', value: 'pending' },
    { label: '处理中', value: 'processing' },
    { label: '已签发', value: 'issued' },
    { label: '失败', value: 'failed' },
    { label: '已过期', value: 'expired' },
    { label: '已撤销', value: 'revoked' },
];

// 状态标签配置
export const STATUS_CONFIG: Record<
    CertificateStatus,
    { type: 'success' | 'warning' | 'error' | 'info' | 'default'; text: string }
> = {
    pending: { type: 'warning', text: '待验证' },
    processing: { type: 'info', text: '处理中' },
    issued: { type: 'success', text: '已签发' },
    failed: { type: 'error', text: '失败' },
    expired: { type: 'error', text: '已过期' },
    revoked: { type: 'default', text: '已撤销' },
};

// 提供商显示名称
export const PROVIDER_NAMES: Record<SSLProvider, string> = {
    letsencrypt: "Let's Encrypt",
    zerossl: 'ZeroSSL',
    google: 'Google',
};
