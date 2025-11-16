import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { PanelInfo, FriendLink } from '../types';

/**
 * 面板信息 composable
 */
export function usePanelInfo() {
    const message = useMessage();
    const loading = ref(true);
    const panelInfo = ref<PanelInfo>({
        tunnel_amount: '',
        node_amount: '',
        user_amount: '',
        friend_links: [],
    });

    const fetchPanelInfo = async () => {
        loading.value = true;
        try {
            const response = await api.v2.panel.getPanelInfo();
            if (response.code === 200) {
                panelInfo.value = {
                    tunnel_amount: response.data.tunnel_amount.toString(),
                    node_amount: response.data.node_amount.toString(),
                    user_amount: response.data.user_amount.toString(),
                    friend_links: (response.data.friend_links || []).map((links: FriendLink) => ({
                        name: links.name,
                        url: links.url,
                        description: links.description || '',
                    })),
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('面板信息API调用失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        panelInfo,
        fetchPanelInfo,
    };
}

