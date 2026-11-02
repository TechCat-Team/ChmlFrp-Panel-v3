export const DOMAIN_WHITELIST_PATH = '/expand/domain-whitelist';

export function isMainlandNode(node: { china?: string; name?: string } | null | undefined): boolean {
    return (
        node?.china?.trim().toLowerCase() === 'yes' &&
        !['香港', '台湾', '澳门'].some((region) => (node.name || '').includes(region))
    );
}

export function requiresTunnelDomainWhitelist(
    node: { china?: string; name?: string } | null | undefined,
    type: string
): boolean {
    const protocol = type.trim().toLowerCase();
    return (protocol === 'http' || protocol === 'https') && isMainlandNode(node);
}

export function isTunnelDomainWhitelistError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const details = (error as { details?: { data?: { reason?: string } } }).details;
    return details?.data?.reason === 'domain_whitelist_required';
}

export function tunnelDomainWhitelistHint(domain?: string): string {
    return `${domain ? `主域名 ${domain} ` : '该域名的主域名'}尚未完成备案过白。请前往“扩展功能 → 备案过白”提交申请，验证通过后再创建或修改隧道。`;
}
