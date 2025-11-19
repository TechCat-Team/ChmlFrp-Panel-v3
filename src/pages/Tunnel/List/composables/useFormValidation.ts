import { useMessage } from 'naive-ui';
import type { TunnelFormData, NodeInfo } from '../types';

/**
 * 表单验证 composable
 */
export function useFormValidation() {
    const message = useMessage();

    const checkFormData = (formData: TunnelFormData, nodeInfo: NodeInfo): boolean | null => {
        // 检查节点是否已选择
        if (!formData.node) {
            message.error('请先选择节点');
            return null;
        }

        // 检查节点信息是否完整
        if (!nodeInfo || !nodeInfo.name) {
            message.error('节点信息未加载，请稍候再试或重新选择节点');
            return null;
        }

        if (Number(formData.nport) < 1 || Number(formData.nport) > 65535) {
            message.error('内网端口必须在 1 到 65535 之间');
            return null;
        }
        if (formData.type === 'TCP' || formData.type === 'UDP') {
            if (!nodeInfo.rport) {
                message.error(`节点 "${formData.node}" 信息不完整（缺少端口范围），请重新选择节点或联系管理员`);
                return null;
            }
            const rportStr = String(nodeInfo.rport);
            const portRange = rportStr.split('-');
            if (portRange.length !== 2) {
                message.error(`节点 "${formData.node}" 端口范围格式错误: ${rportStr}，请重新选择节点或联系管理员`);
                return null;
            }
            const minPort = parseInt(portRange[0]) || 10000;
            const maxPort = parseInt(portRange[1]) || 65535;
            const dorpNum = Number(formData.dorp);
            if (isNaN(dorpNum) || dorpNum < minPort || dorpNum > maxPort) {
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

