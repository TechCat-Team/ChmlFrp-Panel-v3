import { useDialog, useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import api from '@/api';
import {
    DOMAIN_WHITELIST_PATH,
    isTunnelDomainWhitelistError,
    requiresTunnelDomainWhitelist,
    tunnelDomainWhitelistHint,
} from '@/utils/tunnelDomainWhitelist';
import type { NodeInfo } from '../types';

export function useTunnelDomainWhitelist() {
    const dialog = useDialog();
    const message = useMessage();
    const router = useRouter();

    function showApplicationGuide(content: string) {
        dialog.warning({
            title: '域名尚未过白',
            content,
            positiveText: '去申请过白',
            negativeText: '返回修改',
            onPositiveClick: () => {
                void router.push(DOMAIN_WHITELIST_PATH);
            },
        });
    }

    async function ensureDomainWhitelisted(
        node: Pick<NodeInfo, 'name' | 'china'>,
        type: string,
        domain: string
    ): Promise<boolean> {
        if (!requiresTunnelDomainWhitelist(node, type)) return true;
        try {
            const result = (await api.v2.whitelist.checkTunnel({ node: node.name, porttype: type, domain })).data;
            if (result.approved) return true;
            showApplicationGuide(tunnelDomainWhitelistHint(result.domain));
        } catch (error) {
            message.error('域名过白检查失败：' + (error instanceof Error ? error.message : '请稍后重试'));
        }
        return false;
    }

    function handleWhitelistError(error: unknown): boolean {
        if (!isTunnelDomainWhitelistError(error)) return false;
        showApplicationGuide(error instanceof Error ? error.message : tunnelDomainWhitelistHint());
        return true;
    }

    return { ensureDomainWhitelisted, handleWhitelistError };
}
