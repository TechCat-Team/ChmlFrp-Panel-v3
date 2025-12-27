import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { TunnelCard, Status } from '../types';
import { STATUS_MAP } from '../constants';

/**
 * 隧道列表 composable
 */
export function useTunnelList(userInfo: { usertoken?: string }) {
    const message = useMessage();
    const loading = ref(true);
    const tunnelCards = ref<TunnelCard[] | null>(null);

    const fetchTunnelCards = async () => {
        loading.value = true;
        try {
            const { data } = await api.v2.tunnel.getTunnelList();

            if (!data || data.length === 0) {
                tunnelCards.value = null;
            } else {
                tunnelCards.value = data.map((card: any) => {
                    let status: Status = { type: 'error', label: '维护', description: '节点维护中' };

                    // 根据节点状态设置状态
                    if (card.nodestate === 'online') {
                        status =
                            card.state === 'true'
                                ? { type: 'success', label: '在线', description: '隧道在线 一切正常' }
                                : { type: 'warning', label: '离线', description: '隧道离线 请检查客户端是否正常启动' };
                    } else if (!card.ip || card.ip === '') {
                        // 节点已经永久移除
                        status = { type: 'default', label: '永久下线', description: '节点已永久下线 请编辑更换' };
                    } else if (card.nodestate === 'offline') {
                        status = { type: 'error', label: '节点掉线', description: '节点掉线 请稍后再试' };
                    }

                    // 设置 tags
                    const tags = [card.node, `${card.localip}:${card.nport} - ${card.type}`];

                    const ip = card.ip ? card.ip : '节点已下线';

                    return {
                        ...card,
                        status,
                        tags,
                        ip,
                    };
                });
            }
        } catch (error) {
            console.error('[隧道列表]获取隧道列表失败', error);
            message.error('获取隧道列表失败: ' + (error as Error).message);
            tunnelCards.value = null;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        tunnelCards,
        fetchTunnelCards,
    };
}
