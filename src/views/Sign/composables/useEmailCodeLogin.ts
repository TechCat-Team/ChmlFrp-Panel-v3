import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import type { EmailCodeLoginModel } from '../types';
import { MESSAGES } from '../constants';

/**
 * 邮箱验证码登录 composable
 */
export function useEmailCodeLogin(model: { value: EmailCodeLoginModel }, keepLoggedIn: { value: boolean }) {
    const router = useRouter();
    const message = useMessage();
    const userStore = useUserStore();
    const loginLoading = ref(false);

    const extractErrorMessage = (error: any): string => {
        let errorMsg = '';

        if (Array.isArray(error) && error.length > 0) {
            if (Array.isArray(error[0]) && error[0][0]?.message) {
                errorMsg = error[0][0].message;
            } else if (error[0]?.message) {
                errorMsg = error[0].message;
            }
        }

        if (!errorMsg && error && typeof error === 'object' && error.hasOwnProperty('errors')) {
            const errorsObj = error.errors;
            if (errorsObj && typeof errorsObj === 'object') {
                for (const key in errorsObj) {
                    if (Array.isArray(errorsObj[key]) && errorsObj[key][0]?.message) {
                        errorMsg = errorsObj[key][0].message;
                        break;
                    }
                }
            }
        }

        return errorMsg || (error && error.message ? error.message : MESSAGES.LOGIN_FAILED);
    };

    const handleEmailCodeLogin = async (formRef: any) => {
        loginLoading.value = true;

        const loadingMessage = message.create(MESSAGES.LOGIN_VERIFYING, {
            type: 'loading',
            duration: 0,
        });

        try {
            await formRef?.validate();

            const code = parseInt(model.value.code);
            if (isNaN(code) || code < 100000 || code > 999999) {
                throw new Error(MESSAGES.CODE_MUST_BE_6_DIGITS);
            }

            const { data } = await api.v2.user.loginByEmailCode(model.value.email, code);

            const userInfo = { ...data };

            const storageDuration = keepLoggedIn.value ? 'permanent' : '1d';
            userStore.setUser(userInfo, storageDuration);

            loadingMessage.type = 'success';
            loadingMessage.content =
                data.usergroup === '免费用户'
                    ? `登录成功，欢迎您，${data.username}！`
                    : `登录成功，欢迎您，尊贵的会员用户${data.username}！`;

            router.push('/home');
        } catch (error: any) {
            const errorMsg = extractErrorMessage(error);
            loadingMessage.type = 'error';
            loadingMessage.content = errorMsg;
            console.error('邮箱验证码登录失败', error);
        } finally {
            setTimeout(() => {
                loadingMessage.destroy();
            }, 4000);
            loginLoading.value = false;
        }
    };

    return {
        loginLoading,
        handleEmailCodeLogin,
    };
}
