/**
 * 节点管理 - 列表 / 搜索 / 分页 composable
 */
import { computed, reactive, ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import { matchPinyinSearch } from '@/utils/pinyinSearch';
import type { Node } from '../types';

export function useNodeList() {
    const message = useMessage();
    const loading = ref(false);
    const nodes = ref<Node[]>([]);
    const searchQuery = ref('');

    // 计算过滤后的节点列表
    const filteredNodes = computed(() => {
        if (!searchQuery.value.trim()) {
            return nodes.value;
        }

        const query = searchQuery.value.trim();
        return nodes.value.filter((node) => {
            // 使用拼音搜索功能
            const matchName = matchPinyinSearch(node.name, query);
            const matchDomain = matchPinyinSearch(node.ip, query);
            const matchRealIp = matchPinyinSearch(node.realIp, query);
            const matchArea = matchPinyinSearch(node.area, query);

            return matchName || matchDomain || matchRealIp || matchArea;
        });
    });

    // 分页配置
    const pagination = reactive({
        page: 1,
        pageSize: 10,
        showSizePicker: true,
        pageSizes: [10, 20, 50, 100],
        onChange: (page: number) => {
            pagination.page = page;
        },
        onUpdatePageSize: (pageSize: number) => {
            pagination.pageSize = pageSize;
            pagination.page = 1;
        },
        prefix: (info: any) => `共 ${info.itemCount} 条`,
    });

    // 获取节点列表
    const fetchNodes = async () => {
        loading.value = true;
        try {
            const res = await api.v2.admin.getNodes();
            nodes.value = (res.data?.nodes as any[]) || [];
        } catch (error: any) {
            const msg = error?.message || '请求失败，请检查网络或联系管理员';
            message.error(msg);
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    // 搜索处理函数
    const handleSearch = () => {
        // 搜索时重置到第一页
        pagination.page = 1;
    };

    // 表格行属性
    const rowProps = () => {
        return {
            style: 'cursor: pointer; transition: all 0.3s;',
            onMouseenter: (e: MouseEvent) => {
                const target = e.currentTarget as HTMLElement;
                target.style.transform = 'scale(1.005)';
            },
            onMouseleave: (e: MouseEvent) => {
                const target = e.currentTarget as HTMLElement;
                target.style.transform = 'scale(1)';
            },
        };
    };

    return {
        loading,
        nodes,
        searchQuery,
        filteredNodes,
        pagination,
        fetchNodes,
        handleSearch,
        rowProps,
    };
}
