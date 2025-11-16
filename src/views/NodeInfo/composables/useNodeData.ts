import { ref } from 'vue';
import api from '@/api';
import type { ApiResponse } from '../types';

export function useNodeData(node: string | string[] | undefined) {
    const apiResponse = ref<ApiResponse | null>(null);
    const whetherTheNodeExists = ref(false);
    const apiError = ref(false);

    const fetchNodeData = async () => {
        try {
            const response = await api.v2.node.getNodeStatusInfo(node as string);
            if (response.code === 200) {
                apiResponse.value = response;
                whetherTheNodeExists.value = false;
                apiError.value = false;
            } else if (response.code === 404) {
                whetherTheNodeExists.value = true;
                apiError.value = false;
            } else {
                apiError.value = true;
                whetherTheNodeExists.value = false;
            }
        } catch (error) {
            console.error('获取数据失败:', error);
            apiError.value = true;
            whetherTheNodeExists.value = false;
        }
    };

    return {
        apiResponse,
        whetherTheNodeExists,
        apiError,
        fetchNodeData,
    };
}

