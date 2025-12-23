import { ref, Ref } from 'vue';
import { useMessage } from 'naive-ui';
import { loadGeetestScript } from '@/utils/loadGeetest';
import api from '@/api';
import { GEETEST_CAPTCHA_ID_EMAIL, COUNTDOWN_TIME } from '../constants';

/**
 * 邮箱验证码 composable
 */
export function useEmailVerification() {
    const message = useMessage();

    const oldButtonText = ref('发送验证码');
    const newButtonText = ref('发送验证码');
    const oldButtonDisabled = ref(false);
    const newButtonDisabled = ref(false);
    const oldLoadingCaptcha = ref(false);
    const newLoadingCaptcha = ref(false);
    const oldCode = ref('');
    const newCode = ref('');

    const handleGeeTest = async (type: 'old' | 'new', email: string) => {
        const loadingCaptcha = type === 'old' ? oldLoadingCaptcha : newLoadingCaptcha;
        const buttonText = type === 'old' ? oldButtonText : newButtonText;
        const buttonDisabled = type === 'old' ? oldButtonDisabled : newButtonDisabled;

        loadingCaptcha.value = true;

        try {
            await loadGeetestScript();

            window.initGeetest4(
                {
                    product: 'bind',
                    captchaId: GEETEST_CAPTCHA_ID_EMAIL,
                    width: '100%',
                },
                (captchaObj: CaptchaObj) => {
                    captchaObj.showCaptcha();
                    captchaObj.onClose(() => {
                        message.warning('人机验证关闭');
                        loadingCaptcha.value = false;
                    });
                    captchaObj.onSuccess(() => {
                        const result = captchaObj.getValidate();
                        if (result) {
                            sendVerificationCode(email, result, buttonText, buttonDisabled, loadingCaptcha);
                        }
                    });
                }
            );
        } catch (error) {
            message.error('加载验证码失败: ' + (error as Error).message);
            loadingCaptcha.value = false;
        }
    };

    const sendVerificationCode = async (
        email: string,
        geetestResult: GeetestResult,
        buttonText: Ref<string>,
        buttonDisabled: Ref<boolean>,
        loadingCaptcha: Ref<boolean>
    ) => {
        try {
            await api.v2.user.sendMailCode(
                'reset_email',
                email,
                geetestResult.lot_number,
                geetestResult.captcha_output,
                geetestResult.pass_token,
                geetestResult.gen_time
            );

            message.success('邮箱验证码发送成功');
            buttonDisabled.value = true;
            startCountdown(buttonText, buttonDisabled);
        } catch (error) {
            message.error('邮件发送失败: ' + (error as Error).message);
        } finally {
            loadingCaptcha.value = false;
        }
    };

    const startCountdown = (buttonText: Ref<string>, buttonDisabled: Ref<boolean>) => {
        let countdown = COUNTDOWN_TIME;
        buttonText.value = `重新发送(${countdown}s)`;
        const interval = setInterval(() => {
            countdown -= 1;
            buttonText.value = `重新发送(${countdown}s)`;
            if (countdown <= 0) {
                clearInterval(interval);
                buttonDisabled.value = false;
                buttonText.value = '发送验证码';
            }
        }, 1000);
    };

    return {
        oldButtonText,
        newButtonText,
        oldButtonDisabled,
        newButtonDisabled,
        oldLoadingCaptcha,
        newLoadingCaptcha,
        oldCode,
        newCode,
        handleGeeTest,
    };
}
