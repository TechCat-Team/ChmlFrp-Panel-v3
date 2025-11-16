import { ref, computed, watch } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { NodeCard, NodeFilters } from '../types';
import { FREE_USER_GROUP, CHINA_SPECIAL_REGIONS } from '../constants';

/**
 * 节点列表 composable
 */
export function useNodeList(userInfo?: { usergroup?: string }) {
    const message = useMessage();
    const loading = ref(false);
    const nodeCards = ref<NodeCard[]>([]);

    // 从本地存储中恢复过滤器状态
    const storedFilters = localStorage.getItem('nodeFilters');
    const filters = ref<NodeFilters>(
        storedFilters
            ? JSON.parse(storedFilters)
            : {
                  udp: false,
                  web: 'all',
                  region: 'all',
              }
    );

    // 监听 filters 变化，并保存到本地存储
    watch(
        filters,
        (newFilters) => {
            localStorage.setItem('nodeFilters', JSON.stringify(newFilters));
        },
        { deep: true }
    );

    const fetchNodeList = async () => {
        loading.value = true;
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
        } catch (error) {
            console.error('[隧道列表]从api获取节点列表数据失败', error);
            message.error('获取节点列表数据失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    const filterWeb = (web: 'all' | 'yes' | 'no') => {
        filters.value.web = web;
    };

    const filterRegion = (region: 'all' | 'china' | 'overseas') => {
        filters.value.region = region;
    };

    // 基础过滤函数
    const baseFilter = (node: NodeCard) => {
        const matchUdp = filters.value.udp ? node.udp === 'true' : true;
        const matchWeb = filters.value.web === 'all' || node.web === filters.value.web;
        const matchRegion =
            filters.value.region === 'all' ||
            (filters.value.region === 'china' && node.china === 'yes') ||
            (filters.value.region === 'overseas' &&
                (node.china === 'no' ||
                    CHINA_SPECIAL_REGIONS.some((region) => node.area.includes(region))));

        return matchUdp && matchWeb && matchRegion;
    };

    // 节点分类
    const filteredNodeCards = computed(() => {
        return nodeCards.value.filter(baseFilter);
    });

    const vipNodeCards = computed(() => {
        return filteredNodeCards.value.filter((node) => node.nodegroup === 'vip');
    });

    const normalNodeCards = computed(() => {
        return filteredNodeCards.value.filter((node) => node.nodegroup === 'user');
    });

    // 展开的面板
    const expandedPanels = ref<string[]>([]);

    const initExpandedPanels = () => {
        const panels: string[] = ['normal'];
        if (userInfo?.usergroup && userInfo.usergroup !== FREE_USER_GROUP) {
            panels.push('vip');
        }
        expandedPanels.value = panels;
    };

    // 监听 expandedPanels 变化，确保非会员节点始终展开
    watch(expandedPanels, (newPanels, oldPanels) => {
        if (normalNodeCards.value.length > 0 && !newPanels.includes('normal')) {
            if (!oldPanels || !oldPanels.includes('normal')) {
                expandedPanels.value = [...newPanels, 'normal'];
            }
        }
    }, { deep: true });

    // 监听用户信息变化，更新展开状态
    watch(() => userInfo?.usergroup, () => {
        initExpandedPanels();
    });

    return {
        loading,
        nodeCards,
        filters,
        filteredNodeCards,
        vipNodeCards,
        normalNodeCards,
        expandedPanels,
        fetchNodeList,
        filterWeb,
        filterRegion,
        initExpandedPanels,
    };
}

