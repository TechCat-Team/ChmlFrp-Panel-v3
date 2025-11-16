import { useMessage } from 'naive-ui';
import type { TunnelFormData, NodeInfo } from '../types';

/**
 * 表单验证 composable
 */
export function useFormValidation() {
    const message = useMessage();

    const checkFormData = (formData: TunnelFormData, nodeInfo: NodeInfo): boolean | null => {
        if (Number(formData.nport) < 1 || Number(formData.nport) > 65535) {
            message.error('内网端口必须在 1 到 65535 之间');
            return null;
        }
        if (formData.type === 'TCP' || formData.type === 'UDP') {
            const minPort = parseInt(nodeInfo.rport.split('-')[0]) || 10000;
            const maxPort = parseInt(nodeInfo.rport.split('-')[1]) || 65535;
            if (formData.dorp < minPort || formData.dorp > maxPort) {
                message.error(`外网端口必须在 ${minPort} 到 ${maxPort} 之间`);
                return null;
            }
        } else {
            if (formData.domainNameLabel === '') {
                message.error('请选择域名类型');
                return null;
            } else if (formData.domainNameLabel === '免费域名' && (formData.choose === '' || formData.recordValue === '')) {
                message.error('请选择并填写免费域名');
                return null;
            } else if (formData.domainNameLabel === '自定义') {
                const domain = formData.domain.trim();
                const isIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(domain);
                const isFrpOne = domain.endsWith('.frp.one');
                const isValidDomain = /^(?:\*\.)?(?!-)(?:[a-z0-9-]{1,63}\.)+(?:xn--)?[a-z0-9]{2,63}$/.test(domain);

                if (!domain) {
                    message.error('请输入域名');
                    return null;
                } else if (isIp || isFrpOne || !isValidDomain) {
                    message.error('域名不合规');
                    return null;
                }
            }
        }
        return true;
    };

    return {
        checkFormData,
    };
}

