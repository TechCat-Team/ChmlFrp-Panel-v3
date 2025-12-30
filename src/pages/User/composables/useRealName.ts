import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';

interface RealNameModel {
    name: string | null;
    idCard: string | null;
}

/**
 * 实名认证 composable
 */
export function useRealName(_userInfo: { id?: number; usertoken?: string }) {
    const message = useMessage();
    const userStore = useUserStore();
    const loading = ref(false);
    const model = ref<RealNameModel>({
        name: null,
        idCard: null,
    });

    const submit = async () => {
        loading.value = true;
        try {
            const resp = await api.v2.user.realnameVerify(model.value.name || '', model.value.idCard || '');
            message.success(resp.msg || '实名认证成功');
            userStore.setUser({ realname: '已实名' });
        } catch (error) {
            console.error('实名认证API调用失败:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('实名认证失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        model,
        submit,
    };
}
