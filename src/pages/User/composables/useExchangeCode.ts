import { ref } from 'vue';
import { FormInst } from 'naive-ui';
import axios from 'axios';
import { useDialog, useMessage } from 'naive-ui';

interface ExchangeCodeModel {
    exchangeCode: string | null;
}

/**
 * 兑换码 composable
 */
export function useExchangeCode(userInfo: { id?: number; usertoken?: string }) {
    const dialog = useDialog();
    const message = useMessage();
    const loading = ref(false);
    const formRef = ref<FormInst | null>(null);
    const model = ref<ExchangeCodeModel>({
        exchangeCode: null,
    });

    const submit = async () => {
        loading.value = true;
        try {
            const response = await axios.get(
                `https://cf-v1.uapis.cn/api/giftcode.php?usertoken=${userInfo?.usertoken}&userid=${userInfo?.id}&giftcode=${model.value.exchangeCode}`
            );
            if (response.data.success) {
                dialog.success({
                    title: '兑换成功',
                    content: '礼品码使用成功，内容:' + response.data.gift_value,
                    positiveText: '好的',
                });
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            console.error('礼品码兑换API调用失败', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('礼品码兑换API调用失败: ' + errorMessage);
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

