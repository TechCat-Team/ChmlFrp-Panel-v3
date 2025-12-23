import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import type { LoginModel } from '../types';
import { MESSAGES } from '../constants';

/**
 * 登录 composable
 */
export function useLogin(
    model: { value: LoginModel },
    keepLoggedIn: { value: boolean },
    onBanned: (errorMessage: string) => void
) {
    const router = useRouter();
    const message = useMessage();
    const userStore = useUserStore();
    const loginLoading = ref(false);

    const extractErrorMessage = (error: any): string => {
        let firstErrorMsg = '';

        if (Array.isArray(error) && error.length > 0) {
            if (Array.isArray(error[0]) && error[0][0]?.message) {
                firstErrorMsg = error[0][0].message;
            } else if (error[0]?.message) {
                firstErrorMsg = error[0].message;
            }
        }

        if (!firstErrorMsg && error && typeof error === 'object' && error.hasOwnProperty('errors')) {
            const errorsObj = error.errors;
            if (errorsObj && typeof errorsObj === 'object') {
                for (const key in errorsObj) {
                    if (Array.isArray(errorsObj[key]) && errorsObj[key][0]?.message) {
                        firstErrorMsg = errorsObj[key][0].message;
                        break;
                    }
                }
            }
        }

        return firstErrorMsg || (error && error.message ? error.message : '表单校验失败');
    };

    const handleLogin = async (formRef: any) => {
        loginLoading.value = true;

        const loadingMessage = message.create(MESSAGES.LOGIN_VERIFYING, {
            type: 'loading',
            duration: 0,
        });

        try {
            await formRef?.validate();

            const { data } = await api.v2.user.login(model.value.email || '', model.value.password || '');

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
            const errorMessage = extractErrorMessage(error);
            const isBanned =
                errorMessage &&
                (errorMessage.includes('该账户已被临时封禁') || errorMessage.includes('IP地址已被临时封禁'));

            if (isBanned) {
                onBanned(errorMessage);
                loadingMessage.type = 'warning';
                let banMessage = '';
                if (errorMessage.includes('IP地址已被临时封禁')) {
                    banMessage = 'IP地址已被临时限制登录';
                } else {
                    banMessage = '账户已被临时限制登录';
                }
                loadingMessage.content = `${banMessage}，请使用邮箱验证码登录`;
            } else {
                loadingMessage.type = 'error';
                loadingMessage.content = errorMessage;
            }
            console.error('表单验证或登录失败', error);
        } finally {
            setTimeout(() => {
                loadingMessage.destroy();
            }, 4000);
            loginLoading.value = false;
        }
    };

    return {
        loginLoading,
        handleLogin,
    };
}
