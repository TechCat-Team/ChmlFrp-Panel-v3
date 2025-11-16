import { ref } from 'vue';
import { FormInst } from 'naive-ui';
import axios from 'axios';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';

interface RealNameModel {
    name: string | null;
    idCard: string | null;
}

/**
 * 实名认证 composable
 */
export function useRealName(userInfo: { id?: number; usertoken?: string }) {
    const message = useMessage();
    const userStore = useUserStore();
    const loading = ref(false);
    const formRef = ref<FormInst | null>(null);
    const model = ref<RealNameModel>({
        name: null,
        idCard: null,
    });

    const submit = async () => {
        if (!formRef.value?.validate()) {
            return;
        }
        loading.value = true;
        try {
            const formData = new FormData();
            formData.append('name', model.value.name || '');
            formData.append('idcard', model.value.idCard || '');
            formData.append('userid', userInfo?.id ? String(userInfo.id) : '');
            formData.append('usertoken', userInfo?.usertoken || '');

            const response = await axios.post('https://cf-v1.uapis.cn/api/realname.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;
            if (data.status === 'success') {
                message.success('实名认证成功');
                userStore.setUser({ realname: '已实名' });
            } else {
                message.error(data.message);
                console.error('实名认证失败:', data.message);
            }
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
        formRef,
        model,
        submit,
    };
}

