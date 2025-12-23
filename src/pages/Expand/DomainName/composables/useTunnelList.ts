import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { TunnelOption, SelectedTunnelInfo } from '../types';

/**
 * 隧道列表管理 composable（用于快速解析）
 */
export function useTunnelList(userInfo: { usertoken?: string } | undefined) {
    const message = useMessage();
    const loading = ref(false);
    const tunnelOptions = ref<TunnelOption[]>([]);
    const selectedTunnelInfo = ref<SelectedTunnelInfo | null>(null);

    const fetchTunnelList = async () => {
        loading.value = true;
        try {
            const response = await api.v2.tunnel.getTunnelList(userInfo?.usertoken || '');

            tunnelOptions.value = response.data!.map(
                (tunnel: { id: number; name: string; node: string; ip: string | null; dorp: string }) => ({
                    label: `${tunnel.name} - ${tunnel.node}`,
                    value: `${tunnel.name} - ${tunnel.node}`,
                    node: tunnel.node,
                    ip: tunnel.ip || '',
                    dorp: tunnel.dorp,
                    name: tunnel.name,
                })
            );
        } catch (error) {
            message.error('获取隧道数据失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    const handleTunnelChange = (selectedTunnel: string) => {
        const tunnel = tunnelOptions.value.find((t) => t.value === selectedTunnel);
        if (tunnel) {
            selectedTunnelInfo.value = {
                label: tunnel.label,
                ip: tunnel.ip,
                dorp: tunnel.dorp,
            };
        } else {
            selectedTunnelInfo.value = null;
        }
    };

    return {
        loading,
        tunnelOptions,
        selectedTunnelInfo,
        fetchTunnelList,
        handleTunnelChange,
    };
}
