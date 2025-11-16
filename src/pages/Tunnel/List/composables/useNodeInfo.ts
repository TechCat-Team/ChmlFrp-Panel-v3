import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { NodeInfo } from '../types';

/**
 * 节点信息 composable
 */
export function useNodeInfo(userInfo: { usertoken?: string }) {
    const message = useMessage();
    const loading = ref(false);
    const nodeInfo = ref<NodeInfo>({
        id: 1,
        area: '',
        realIp: '',
        udp: true,
        notes: '',
        ip: '',
        coordinates: '',
        fangyu: true,
        rport: '10000~65535',
        nodegroup: 'user',
        china: 'yes',
        web: 'no',
        ipv6: '',
        toowhite: false,
        name: '',
        state: '',
        bandwidth_usage_percent: 0,
    });

    const fetchNodeInfo = async (nodeName: string) => {
        loading.value = true;
        try {
            const data = await api.v2.node.getNodeInfo(userInfo?.usertoken || '', nodeName);
            nodeInfo.value = {
                ...data.data,
                udp: data.data.udp === 'true',
                fangyu: data.data.fangyu === 'true',
                ipv6: data.data.ipv6 || '',
            };
            return nodeInfo.value;
        } catch (error) {
            message.error('节点详情获取失败: ' + (error as Error).message);
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        nodeInfo,
        fetchNodeInfo,
    };
}

