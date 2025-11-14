import { ref } from 'vue';
import axios from 'axios';
import { useDialog, useMessage } from 'naive-ui';
import { loadGeetestScript } from '@/utils/loadGeetest';
import api from '@/api';
import { SIGN_IN_BUTTON_TEXT, SIGN_IN_STEPS, GEETEST_CAPTCHA_ID, SUCCESS_MESSAGE_DURATION } from '../constants';
import type { SignInInfo } from '../types';

/**
 * 签到 composable
 */
export function useSignIn(userInfo: { id?: number; usertoken?: string }) {
    const dialog = useDialog();
    const message = useMessage();

    const loading = ref(true);
    const loadingButton = ref(false);
    const qianDaoText = ref(SIGN_IN_BUTTON_TEXT);
    const signedInSuccess = ref(false);
    const showBlurOverlay = ref(false);

    const signInInfo = ref<SignInInfo>({
        last_sign_in_time: '',
        total_points: 0,
        total_sign_ins: 0,
        count_of_matching_records: 0,
        is_signed_in_today: false,
    });

    const fetchSignInInfo = async () => {
        loading.value = true;
        try {
            const response = await axios.get(`https://cf-v1.uapis.cn/api/qdxx.php?userid=${userInfo?.id}`);
            if (response.data.code === 200) {
                signInInfo.value = {
                    last_sign_in_time: response.data.last_sign_in_time,
                    total_points: response.data.total_points,
                    total_sign_ins: response.data.total_sign_ins,
                    count_of_matching_records: response.data.count_of_matching_records,
                    is_signed_in_today: response.data.is_signed_in_today,
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('签到信息API调用失败', errorMessage);
            message.error('获取签到信息失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    const signIn = async (geetestResult: GeetestResult) => {
        qianDaoText.value = SIGN_IN_STEPS.API;

        try {
            const data = await api.v2.user.signIn(
                userInfo?.usertoken || '',
                geetestResult.lot_number,
                geetestResult.captcha_output,
                geetestResult.pass_token,
                geetestResult.gen_time
            );
            showBlurOverlay.value = false;
            loadingButton.value = false;
            signedInSuccess.value = true;
            dialog.success({
                title: '签到成功',
                content: data.msg,
                positiveText: '哇',
            });
        } catch (error) {
            showBlurOverlay.value = false;
            signedInSuccess.value = false;
            loadingButton.value = false;
            qianDaoText.value = SIGN_IN_BUTTON_TEXT;
            message.error('签到失败：' + (error as Error).message);
        }
        setTimeout(() => {
            showBlurOverlay.value = false;
            signedInSuccess.value = false;
            loadingButton.value = false;
            qianDaoText.value = SIGN_IN_BUTTON_TEXT;
            fetchSignInInfo();
        }, SUCCESS_MESSAGE_DURATION);
    };

    const onSignButtonClick = async () => {
        loadingButton.value = true;
        qianDaoText.value = SIGN_IN_STEPS.INIT;

        try {
            await loadGeetestScript();

            window.initGeetest4(
                {
                    product: 'bind',
                    captchaId: GEETEST_CAPTCHA_ID,
                    width: '100%',
                },
                (captchaObj: CaptchaObj) => {
                    captchaObj.onNextReady(() => {
                        qianDaoText.value = SIGN_IN_STEPS.VERIFY;
                    });
                    captchaObj.showCaptcha();

                    showBlurOverlay.value = true;

                    captchaObj.onClose(() => {
                        message.warning('签到验证关闭，此次签到未成功');
                        showBlurOverlay.value = false;
                        loadingButton.value = false;
                        qianDaoText.value = SIGN_IN_BUTTON_TEXT;
                    });
                    captchaObj.onSuccess(() => {
                        const result = captchaObj.getValidate() as GeetestResult | null;
                        if (result) {
                            console.log('Geetest 验证成功:', result);
                            signIn(result);
                        }
                    });
                }
            );
        } catch (error) {
            message.error('加载验证码失败: ' + (error as Error).message);
            loadingButton.value = false;
            qianDaoText.value = SIGN_IN_BUTTON_TEXT;
        }
    };

    return {
        loading,
        loadingButton,
        qianDaoText,
        signedInSuccess,
        showBlurOverlay,
        signInInfo,
        fetchSignInInfo,
        onSignButtonClick,
    };
}

