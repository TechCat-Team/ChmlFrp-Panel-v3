import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { ResetPasswordModel } from '../types';
import { MESSAGES } from '../constants';

/**
 * 重置密码 composable
 */
export function useResetPassword(
    resetModel: { value: ResetPasswordModel },
    onSuccess: () => void
) {
    const message = useMessage();
    const loginLoading = ref(false);

    const handleResetPassword = async () => {
        loginLoading.value = true;
        try {
            const response = await api.v2.user.resetPasswordByEmail(
                resetModel.value.email,
                resetModel.value.newPassword,
                resetModel.value.verificationCode
            );

            message.success(response.msg);
            onSuccess();
        } catch (error) {
            message.error(MESSAGES.RESET_PASSWORD_FAILED + ': ' + (error as Error).message);
        } finally {
            loginLoading.value = false;
        }
    };

    return {
        loginLoading,
        handleResetPassword,
    };
}

