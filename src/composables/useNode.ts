import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import type { NodeCard, NodeInfo, NodeFilters } from '@/types/tunnel';
import { DEFAULT_NODE_FILTERS } from '@/utils/constants';

export function useNode() {
    const message = useMessage();
    const userStore = useUserStore();
    const userInfo = userStore.userInfo;

    const nodeCards = ref<NodeCard[]>([]);
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

    // 从本地存储中恢复过滤器状态
    const storedFilters = localStorage.getItem('nodeFilters');
    const filters = ref<NodeFilters>(
        storedFilters ? JSON.parse(storedFilters) : DEFAULT_NODE_FILTERS
    );

    /**
     * 获取节点列表
     */
    const fetchNodeList = async () => {
        try {
            const response = await api.v2.node.getNodeList();
            nodeCards.value = response.data.map((node: NodeCard) => ({
                id: node.id,
                name: node.name,
                nodegroup: node.nodegroup,
                web: node.web,
                china: node.china,
                fangyu: node.fangyu,
                udp: node.udp,
                area: node.area,
                notes: node.notes,
            }));
            return nodeCards.value;
        } catch (error) {
            console.error('[节点管理]从api获取节点列表数据失败', error);
            message.error('获取节点列表数据失败: ' + (error as Error).message);
            return [];
        }
    };

    /**
     * 获取节点详情
     */
    const fetchNodeInfo = async (nodeName: string) => {
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
        }
    };

    /**
     * 获取可用于编辑的节点列表（根据隧道类型过滤）
     */
    const getEditableNodeOptions = async (tunnelType: string) => {
        const nodeList = await fetchNodeList();
        if (!nodeList || nodeList.length === 0) {
            return [];
        }

        const filteredNodeList = nodeList.filter((node: NodeCard) => {
            const isWebAllowed = (tunnelType === 'HTTP' || tunnelType === 'HTTPS') ? node.web === 'yes' : true;
            const isUdpAllowed = tunnelType === 'UDP' ? node.udp === 'true' : true;
            const isPermissionAllowed = userInfo?.usergroup === '免费用户' ? node.nodegroup === 'user' : true;

            return isWebAllowed && isUdpAllowed && isPermissionAllowed;
        });

        return filteredNodeList.map((node: NodeCard) => ({
            label: node.name,
            value: node.name,
        }));
    };

    /**
     * 节点过滤
     */
    const filteredNodeCards = computed(() => {
        const filteredNodes = nodeCards.value.filter((node) => {
            const matchUdp = filters.value.udp ? node.udp === 'true' : true;

            let matchNoPermission = true;
            if (userInfo?.usergroup) {
                matchNoPermission = filters.value.noPermission ? true : node.nodegroup === 'user';
            }

            const matchWeb = filters.value.web === 'all' || node.web === filters.value.web;
            const matchRegion =
                filters.value.region === 'all' ||
                (filters.value.region === 'china' && node.china === 'yes') ||
                (filters.value.region === 'overseas' &&
                    (node.china === 'no' ||
                        node.area.includes('香港') ||
                        node.area.includes('澳门') ||
                        node.area.includes('台湾')));

            return matchUdp && matchNoPermission && matchWeb && matchRegion;
        });

        // VIP 节点排在前面
        return filteredNodes.sort((a, b) => {
            if (a.nodegroup === 'vip' && b.nodegroup !== 'vip') return -1;
            if (a.nodegroup !== 'vip' && b.nodegroup === 'vip') return 1;
            return 0;
        });
    });

    /**
     * 更新过滤器
     */
    const updateFilters = (key: keyof NodeFilters, value: any) => {
        filters.value[key] = value;
        localStorage.setItem('nodeFilters', JSON.stringify(filters.value));
    };

    /**
     * 过滤Web类型
     */
    const filterWeb = (web: 'all' | 'yes' | 'no') => {
        updateFilters('web', web);
    };

    /**
     * 过滤地区
     */
    const filterRegion = (region: 'all' | 'china' | 'overseas') => {
        updateFilters('region', region);
    };

    /**
     * 检查节点权限
     */
    const checkNodePermission = (nodegroup: string): boolean => {
        if (nodegroup === 'vip' && userInfo?.usergroup === '免费用户') {
            message.warning('此节点为会员节点，您的权限不足');
            return false;
        }
        return true;
    };

    return {
        nodeCards,
        nodeInfo,
        filters,
        filteredNodeCards,
        fetchNodeList,
        fetchNodeInfo,
        getEditableNodeOptions,
        updateFilters,
        filterWeb,
        filterRegion,
        checkNodePermission,
    };
}

