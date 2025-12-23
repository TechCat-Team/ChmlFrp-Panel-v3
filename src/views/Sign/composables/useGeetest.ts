import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { loadGeetestScript } from '@/utils/loadGeetest';
import api from '@/api';
import type { GeetestResult } from '../types';
import { GEETEST_CONFIG, MESSAGES, VERIFICATION_CODE_CONFIG } from '../constants';

/**
 * 极验验证码 composable
 */
export function useGeetest() {
    const message = useMessage();
    const loadingCaptcha = ref(false);
    const buttonDisabled = ref(false);
    const buttonText = ref('发送验证码');
    const countdown = ref(VERIFICATION_CODE_CONFIG.COUNTDOWN_SECONDS);

    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    const startCountdown = () => {
        buttonText.value = `重新发送(${countdown.value}s)`;
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        countdownInterval = setInterval(() => {
            countdown.value -= 1;
            buttonText.value = `重新发送(${countdown.value}s)`;
            if (countdown.value <= 0) {
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }
                buttonDisabled.value = false;
                buttonText.value = '发送验证码';
                countdown.value = VERIFICATION_CODE_CONFIG.COUNTDOWN_SECONDS;
            }
        }, 1000);
    };

    const sendMailboxVerificationCode = async (type: string, email: string, geetestResult: GeetestResult) => {
        try {
            await api.v2.user.sendMailCode(
                type,
                email,
                geetestResult.lot_number,
                geetestResult.captcha_output,
                geetestResult.pass_token,
                geetestResult.gen_time
            );

            message.success(MESSAGES.VERIFICATION_CODE_SENT);
            buttonDisabled.value = true;
            startCountdown();
        } catch (error) {
            message.error(MESSAGES.EMAIL_SEND_FAILED + ': ' + (error as Error).message);
        } finally {
            loadingCaptcha.value = false;
        }
    };

    const showGeetest = async (type: string, email: string) => {
        loadingCaptcha.value = true;

        try {
            await loadGeetestScript();

            window.initGeetest4(
                {
                    product: GEETEST_CONFIG.PRODUCT,
                    captchaId: GEETEST_CONFIG.CAPTCHA_ID,
                    width: GEETEST_CONFIG.WIDTH,
                },
                (captchaObj) => {
                    captchaObj.showCaptcha();
                    captchaObj.onClose(() => {
                        message.warning(MESSAGES.GEETEST_CLOSED);
                        loadingCaptcha.value = false;
                    });
                    captchaObj.onSuccess(() => {
                        const result = captchaObj.getValidate();
                        if (result) {
                            sendMailboxVerificationCode(type, email, result);
                        }
                    });
                }
            );
        } catch (error) {
            message.error(MESSAGES.LOAD_GEETEST_FAILED + ': ' + (error as Error).message);
            loadingCaptcha.value = false;
        }
    };

    const reset = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        buttonDisabled.value = false;
        buttonText.value = '发送验证码';
        countdown.value = VERIFICATION_CODE_CONFIG.COUNTDOWN_SECONDS;
    };

    return {
        loadingCaptcha,
        buttonDisabled,
        buttonText,
        countdown,
        showGeetest,
        reset,
    };
}
