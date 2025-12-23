import { ref } from 'vue';
import axios from 'axios';
import { useMessage } from 'naive-ui';

/**
 * 一言 composable
 */
export function useYiyan() {
    const message = useMessage();
    const apiText = ref('');
    const loading = ref(true);

    const fetchYiyan = async () => {
        try {
            const response = await axios.get('https://v1.hitokoto.cn/?c=i&encode=text');
            apiText.value = response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('一言API调用失败：', errorMessage);
            apiText.value = '今天也要加油哦！';
        } finally {
            loading.value = false;
        }
    };

    return {
        apiText,
        loading,
        fetchYiyan,
    };
}
