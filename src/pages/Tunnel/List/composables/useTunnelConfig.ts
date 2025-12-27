import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { TunnelCard } from '../types';

/**
 * 隧道配置 composable
 */
export function useTunnelConfig(userInfo: { usertoken?: string; id?: number }) {
    const message = useMessage();
    const showModal = ref(false);
    const frpcIniConfig = ref('');
    const windowsdaima = ref('');
    const linuxdaima = ref('');

    const getConfigCode = async (card: TunnelCard) => {
        try {
            const response = await api.v2.tunnel.getTunnelConfig(card.node || '', card.name);
            frpcIniConfig.value = response.data || '';
            windowsdaima.value = `frpc.exe -u ${userInfo?.usertoken} -p ${card.id}`;
            linuxdaima.value = `chmod +x frpc && ./frpc -u ${userInfo?.usertoken} -p ${card.id}`;
            showModal.value = true;
        } catch (error) {
            message.error('获取配置代码失败: ' + (error as Error).message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                message.success('连接地址复制成功');
            })
            .catch((err) => {
                console.error('[隧道列表]复制连接地址失败:', err);
                message.error('连接地址复制失败');
            });
    };

    const downloadConfig = () => {
        try {
            const blob = new Blob([frpcIniConfig.value], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'frpc.ini';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            message.success('配置文件下载成功');
        } catch (err) {
            console.error('[隧道列表]下载配置文件失败:', err);
            message.error('配置文件下载失败');
        }
    };

    return {
        showModal,
        frpcIniConfig,
        windowsdaima,
        linuxdaima,
        getConfigCode,
        copyToClipboard,
        downloadConfig,
    };
}
