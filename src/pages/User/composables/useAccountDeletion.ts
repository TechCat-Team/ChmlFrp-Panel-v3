import { ref } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import { loadGeetestScript } from '@/utils/loadGeetest';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import { GEETEST_CAPTCHA_ID_EMAIL, COUNTDOWN_TIME } from '../constants';

/**
 * 账户注销 composable
 */
export function useAccountDeletion(userInfo: { email?: string; usertoken?: string }) {
    const dialog = useDialog();
    const message = useMessage();
    const router = useRouter();
    const userStore = useUserStore();

    const showModal = ref(false);
    const loading = ref(false);
    const loadingCaptcha = ref(false);
    const buttonDisabled = ref(false);
    const buttonText = ref('发送验证码');
    const code = ref('');
    const countdown = ref(COUNTDOWN_TIME);

    const showDeleteAccountTips = () => {
        showModal.value = false;
        dialog.warning({
            title: '警告',
            content:
                '注销账户后，您在本站的所有信息将被永久删除，无法恢复。如果您在本站购买了会员服务，注销账户后该服务将终止。请注意，账户注销后，您将不再受当前的服务条款和隐私策略约束，但与账户注销前产生的事务相关的法律义务仍将继续适用。',
            positiveText: '我接受',
            negativeText: '取消',
            onPositiveClick: () => {
                showModal.value = true;
            },
        });
    };

    const showFinalWarning = () => {
        dialog.warning({
            title: '警告',
            content: '注销账户立即执行，请确认注销，这是最后一道提示。',
            positiveText: '我确定',
            negativeText: '取消',
            onPositiveClick: () => {
                deleteAccount();
            },
        });
    };

    const deleteAccount = async () => {
        loading.value = true;
        try {
            const response = await api.v2.user.deleteAccount(code.value);
            message.success(response.msg + '，账户注销成功');
            dialog.success({
                title: '账户注销成功',
                content: '您的账户已经成功注销，所有数据均已删除，期待下次与您相见！',
                positiveText: '好的',
                onPositiveClick: () => {
                    userStore.clearUser();
                    router.push('/sign');
                },
            });
        } catch (error) {
            message.error('注销账户失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    const handleGeeTest = async () => {
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
                            sendVerificationCode(result);
                        }
                    });
                }
            );
        } catch (error) {
            message.error('加载验证码失败: ' + (error as Error).message);
            loadingCaptcha.value = false;
        }
    };

    const sendVerificationCode = async (geetestResult: GeetestResult) => {
        try {
            await api.v2.user.sendMailCode(
                'delete_account',
                userInfo?.email || '',
                geetestResult.lot_number,
                geetestResult.captcha_output,
                geetestResult.pass_token,
                geetestResult.gen_time
            );
            message.success('邮箱验证码发送成功');
            buttonDisabled.value = true;
            startCountdown();
        } catch (error) {
            console.error('邮件发送失败: ', (error as Error).message);
        } finally {
            loadingCaptcha.value = false;
        }
    };

    const startCountdown = () => {
        countdown.value = COUNTDOWN_TIME;
        buttonText.value = `重新发送(${countdown.value}s)`;
        const interval = setInterval(() => {
            countdown.value -= 1;
            buttonText.value = `重新发送(${countdown.value}s)`;
            if (countdown.value <= 0) {
                clearInterval(interval);
                buttonDisabled.value = false;
                buttonText.value = '发送验证码';
                countdown.value = COUNTDOWN_TIME;
            }
        }, 1000);
    };

    return {
        showModal,
        loading,
        loadingCaptcha,
        buttonDisabled,
        buttonText,
        code,
        showDeleteAccountTips,
        showFinalWarning,
        handleGeeTest,
    };
}
