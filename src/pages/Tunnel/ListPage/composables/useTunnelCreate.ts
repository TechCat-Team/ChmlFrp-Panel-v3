import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import type { TunnelFormData, NodeInfo } from '../types';

/**
 * 隧道创建 composable
 */
export function useTunnelCreate(
    userInfo: { usertoken?: string },
    formData: TunnelFormData,
    nodeInfo: { value: NodeInfo },
    checkFormData: (formData: TunnelFormData, nodeInfo: NodeInfo) => boolean | null,
    onSuccess: () => void
) {
    const message = useMessage();
    const dialog = useDialog();
    const loading = ref(false);

    const createTunnel = async () => {
        loading.value = true;

        try {
            // 检查合规性
            if (!checkFormData(formData, nodeInfo.value)) {
                loading.value = false;
                return;
            }

            // 生成 banddomain（仅当使用免费域名时用）
            const isHttp = formData.type === 'HTTP' || formData.type === 'HTTPS';
            const isFreeDomain = formData.domainNameLabel === '免费域名';
            const banddomain = isFreeDomain && isHttp ? `${formData.recordValue}.${formData.choose}` : formData.domain;

            // 构建隧道请求体
            const tunnelPayload = {
                token: userInfo?.usertoken || '',
                tunnelname: formData.name,
                node: formData.node,
                localip: formData.localip,
                porttype: formData.type,
                localport: Number(formData.nport),
                encryption: formData.encryption,
                compression: formData.compression,
                extraparams: formData.ap,
                banddomain: isHttp ? banddomain : undefined,
                remoteport: isHttp ? undefined : formData.dorp,
            };

            // 尝试创建免费域名（如果需要）
            if (isHttp && isFreeDomain) {
                try {
                    await api.v2.domain.createFreeSubdomain({
                        token: userInfo?.usertoken || '',
                        domain: formData.choose,
                        record: formData.recordValue,
                        type: 'CNAME',
                        ttl: '10分钟',
                        target: nodeInfo.value.ip,
                        remarks: `解析 网站 到 ${formData.name} - ${formData.node}`,
                    });
                } catch (error) {
                    message.error('创建免费域名失败: ' + (error as Error).message);
                    return;
                }
            }

            // 创建隧道
            try {
                await api.v2.tunnel.createTunnel(tunnelPayload);
            } catch (error) {
                message.error('隧道创建失败: ' + (error as Error).message);

                // 如果是免费域名进行回退
                if (isHttp && isFreeDomain) {
                    try {
                        await api.v2.domain.deleteFreeSubdomain({
                            token: userInfo?.usertoken || '',
                            domain: formData.choose,
                            record: formData.recordValue,
                        });
                    } catch (error) {
                        message.error('回溯失败，请自行删除已创建的免费域名记录: ' + (error as Error).message);
                    }
                }

                return;
            }

            if (isHttp && isFreeDomain) {
                dialog.success({
                    title: '成功',
                    content:
                        '隧道创建成功！但是您使用了ChmlFrp提供的免费域名，域名解析通常不会立即生效，一般10分钟左右生效，最长需48小时。',
                    positiveText: '我知道了',
                });
            }

            message.success('隧道创建成功！');
            onSuccess();
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        createTunnel,
    };
}

