import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import type { TunnelCard } from '../types';

/**
 * 隧道操作 composable
 */
export function useTunnelOperations(userInfo: { usertoken?: string }, onRefresh: () => void) {
    const message = useMessage();
    const dialog = useDialog();

    const loadingRefresh = ref(false);
    const loadingOffline = ref(false);
    const deletetTunnelSuccess = ref(true);

    // 刷新隧道数据
    const refreshTunnelData = async (card: TunnelCard) => {
        loadingRefresh.value = true;
        try {
            const response = await api.v2.tunnel.refreshTunnel(userInfo?.usertoken || '', card.name);
            if (response.code === 200) {
                message.success('隧道数据刷新成功');
                onRefresh();
            } else {
                message.error(response.msg || '隧道数据刷新失败');
            }
        } catch (error) {
            message.error('隧道数据刷新失败: ' + (error as Error).message);
        } finally {
            loadingRefresh.value = false;
        }
    };

    // 强制下线隧道
    const handleOfflineTunnel = (card: TunnelCard) => {
        const d = dialog.warning({
            title: '警告',
            content: `您正在强制下线隧道：${card.name}(${card.id})，此操作将立即断开隧道连接，请确认是否继续。(只有frp核心版本为0.51.2_251023版本才支持此功能)`,
            positiveText: '确定下线',
            negativeText: '取消',
            onPositiveClick: async () => {
                try {
                    d.loading = true;
                    loadingOffline.value = true;
                    const response = await api.v2.tunnel.offlineTunnel(userInfo?.usertoken || '', card.name);
                    if (response.code === 200) {
                        message.success('隧道强制下线成功');
                        onRefresh();
                    } else {
                        message.error(response.msg || '隧道下线失败');
                    }
                } catch (error) {
                    message.error('隧道下线失败: ' + (error as Error).message);
                } finally {
                    d.loading = false;
                    loadingOffline.value = false;
                }
            },
        });
    };

    // 删除隧道
    const handleDeleteTunnel = async (card: TunnelCard) => {
        deletetTunnelSuccess.value = false;
        try {
            const response = await api.v2.tunnel.deleteTunnel(userInfo?.usertoken || '', card.id);

            if (response.code === 200) {
                message.success('成功删除隧道：' + card.name);
                onRefresh();

                // 如果是 HTTP/HTTPS 隧道，检查是否需要删除免费域名
                if (card.type === 'http' || card.type === 'https') {
                    try {
                        const domainData = await api.v2.domain.getUserFreeSubdomains(userInfo?.usertoken || '');
                        const domainRecord = domainData.data.find(
                            (item: { record: string; domain: string }) => item.record + '.' + item.domain === card.dorp
                        );

                        if (domainRecord && domainRecord.remarks.includes('网站')) {
                            const domainDialog = dialog.warning({
                                title: '警告',
                                content: '隧道删除成功！但是此隧道绑定了免费域名，请问是否同步删除此隧道的域名解析。',
                                positiveText: '删除',
                                negativeText: '不删除',
                                onPositiveClick: async () => {
                                    domainDialog.loading = true;
                                    try {
                                        await api.v2.domain.deleteFreeSubdomain({
                                            token: userInfo?.usertoken || '',
                                            domain: domainRecord.domain,
                                            record: domainRecord.record,
                                        });
                                        message.success('免费域名同步删除成功');
                                    } catch (error) {
                                        message.error('免费域名失败: ' + (error as Error).message);
                                    } finally {
                                        domainDialog.loading = false;
                                    }
                                },
                            });
                        }
                    } catch (error) {
                        console.error('获取域名信息失败', error);
                        message.error('获取域名信息失败: ' + (error as Error).message);
                    }
                }
            } else {
                message.error(response.msg || '删除隧道失败');
                onRefresh();
                throw new Error(response.msg || '删除隧道失败');
            }
        } catch (error) {
            console.error('删除隧道API调用失败', error);
            message.error('删除隧道失败: ' + (error as Error).message);
            onRefresh();
            throw error;
        } finally {
            deletetTunnelSuccess.value = true;
        }
    };

    const handleConfirmDelete = (card: TunnelCard) => {
        const d = dialog.warning({
            title: '警告',
            content: `您正在删除隧道：${card.name}(${card.id})，请确认是否删除。`,
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
                d.loading = true;
                try {
                    await handleDeleteTunnel(card);
                } catch (error) {
                    console.error('删除隧道失败', error);
                } finally {
                    d.loading = false;
                }
            },
        });
    };

    return {
        loadingRefresh,
        loadingOffline,
        deletetTunnelSuccess,
        refreshTunnelData,
        handleOfflineTunnel,
        handleConfirmDelete,
    };
}
