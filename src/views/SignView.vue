<template>
    <n-layout style="height: 100vh">
        <n-layout-content>
            <n-grid cols="6" item-responsive responsive="screen"
                :class="{ 'register-mode': isRegister, 'mobile-mode': isMobile }">
                <n-grid-item span="0 m:4" class="center-content hero-container" :class="{ 'hero-right': isRegister }">
                    <div class="hero" @click="isMobile && toggleRegister">
                        <template v-if="!isRegister">
                            <h1>Sign In to<br>ChmlFrp Panel</h1>
                            <p>如果您还没有账号<br>请
                                <n-button text type="primary" @click="toggleRegister">点击这里</n-button>
                                进行注册.
                            </p>
                        </template>
                        <template v-else>
                            <h1>Sign Up to<br>ChmlFrp Panel</h1>
                            <p>已经有账号了?<br>请
                                <n-button text type="primary" @click="toggleRegister">点击这里</n-button>
                                进行登录.
                            </p>
                        </template>
                    </div>
                </n-grid-item>
                <n-grid-item span="6 m:2" class="center-content form-container" :class="{ 'form-left': isRegister }">
                    <n-card style="height: 100vh;">
                        <template v-if="!isRegister">
                            <n-form ref="formRef" :model="model" :rules="loginRules" class="center-form">
                                <n-flex justify="center">
                                    <n-image width="48" style="margin-bottom: 24px;" v-if="isMobile"
                                        src="https://www.chmlfrp.cn/favicon.ico" preview-disabled />
                                </n-flex>
                                <!-- <n-alert title="隐私策略&服务条款有更新" type="info">
                                    登录即代表您同意更新后的条款。点我查看隐私策略&服务条款。
                                </n-alert> -->
                                <n-form-item path="email">
                                    <n-input v-model:value="model.email" size="large" round placeholder="用户名或邮箱"
                                        maxlength="30" clearable />
                                </n-form-item>
                                <n-form-item path="password">
                                    <n-input v-model:value="model.password" size="large" round placeholder="密码"
                                        type="password" maxlength="64" show-password-on="mousedown" />
                                </n-form-item>
                                <n-flex justify="space-between">
                                    <n-checkbox size="small" v-model:checked="keepLoggedIn" label="保持登录" />
                                    <n-button text color="#9398b3">
                                        重置密码
                                    </n-button>
                                </n-flex>
                                <div style="display: flex; justify-content: flex-end; margin-top: 24px">
                                    <n-button :loading="loginLoading"
                                        :disabled="model.email === null || model.password === null || loginLoading"
                                        round type="primary" style="width: 100%;" size="large"
                                        @click="handleValidateButtonClick">
                                        登录
                                    </n-button>
                                </div>
                                <n-flex justify="space-between" style="margin-top: 32px;">
                                    <n-button text color="#9398b3" @click="touristPanel">
                                        游客面板
                                    </n-button>
                                    <n-button v-if="isMobile" text color="#9398b3" @click="toggleRegister">
                                        注册账号
                                    </n-button>
                                </n-flex>
                            </n-form>
                        </template>
                        <template v-else>
                            <n-form ref="formRef" :model="formModel" :rules="registerRules" class="center-form">
                                <n-form-item v-if="currentStep === 1" label="用户名" path="username">
                                    <n-input v-model:value="formModel.username" size="large" round placeholder="用户名"
                                        maxlength="20" clearable />
                                </n-form-item>
                                <n-form-item v-if="currentStep === 1" label="密码" path="password">
                                    <n-input v-model:value="formModel.password" size="large" round placeholder="密码"
                                        type="password" maxlength="48" show-password-on="mousedown" clearable />
                                </n-form-item>
                                <n-form-item v-if="currentStep === 1" label="QQ" path="qq">
                                    <n-input v-model:value="formModel.qq" size="large" round placeholder="QQ号，没有可随意填写"
                                        maxlength="20" clearable />
                                </n-form-item>
                                <n-form-item v-if="currentStep === 2" label="邮箱" path="email">
                                    <n-input v-model:value="formModel.email" size="large" round placeholder="邮箱"
                                        type="email" maxlength="255" clearable />
                                </n-form-item>
                                <n-form-item v-if="currentStep === 2" label="确认密码" path="confirmPassword">
                                    <n-input v-model:value="formModel.confirmPassword" size="large" round
                                        placeholder="确认密码" type="password" maxlength="48" show-password-on="mousedown"
                                        clearable />
                                </n-form-item>
                                <n-form-item v-if="currentStep === 3" label="验证码" path="verificationCode">
                                    <n-grid x-gap="12" :cols="5">
                                        <n-gi :span="3">
                                            <n-input v-model:value="formModel.verificationCode" size="large" round
                                                placeholder="验证码" maxlength="6" clearable />
                                        </n-gi>
                                        <n-gi :span="2">
                                            <n-button :loading="loadingCaptcha" @click="GeeTest" style="width: 100%;"
                                                strong secondary type="primary" round size="large"
                                                :disabled="buttonDisabled">
                                                {{ buttonText }}
                                            </n-button>
                                        </n-gi>
                                    </n-grid>
                                </n-form-item>
                                <n-form-item v-if="currentStep === 3" label="条款" path="clause">
                                    <n-checkbox size="large" v-model:checked="clause">
                                        我同意CHMLFRP的<n-button text tag="a"
                                            href="https://docs.chcat.cn/docs/Term_of_service" target="_blank"
                                            type="primary">
                                            服务条款
                                        </n-button>和<n-button text tag="a" href="https://docs.chcat.cn/docs/The_Privacy"
                                            target="_blank" type="primary">
                                            隐私策略
                                        </n-button>
                                    </n-checkbox>
                                </n-form-item>
                                <n-flex justify="space-between" style="margin-top: 24px">
                                    <n-button v-if="currentStep > 1" @click="prevStep" :loading="RegLoading" round
                                        type="primary" size="large">
                                        上一步
                                    </n-button>
                                    <n-button @click="nextStep" :disabled="isNextStepDisabled" :loading="RegLoading"
                                        round type="primary" size="large">
                                        {{ currentStep === 3 ? '注册' : '下一步' }}
                                    </n-button>
                                </n-flex>
                                <n-flex justify="space-between" style="margin-top: 32px;">
                                    <n-button text color="#9398b3" @click="touristPanel">
                                        游客面板
                                    </n-button>
                                    <n-button v-if="isMobile" text color="#9398b3" @click="toggleRegister">
                                        登录账号
                                    </n-button>
                                </n-flex>
                            </n-form>
                        </template>
                    </n-card>
                </n-grid-item>
            </n-grid>
        </n-layout-content>
    </n-layout>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import {
    FormInst
} from 'naive-ui'

const loginLoading = ref(false);

interface ModelType {
    email: string | null
    password: string | null
}
const keepLoggedIn = ref(false)
const loadingCaptcha = ref(false)
const buttonDisabled = ref(false)
const RegLoading = ref(false)
const buttonText = ref('发送验证码')
const countdown = ref(60)
const userStore = useUserStore();
const clause = ref(false);
const dialog = useDialog()

const userInfo = userStore.userInfo;

const GeeTest = () => {
    loadingCaptcha.value = true
    window.initGeetest4(
        {
            product: 'bind',
            captchaId: '8253677cc86aae19e1b760f01d78ef27',
            width: '100%'
        },
        (captchaObj: CaptchaObj) => {
            captchaObj.showCaptcha()
            captchaObj.onClose(function () {
                message.warning('人机验证关闭')
                loadingCaptcha.value = false
            })
            captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate()
                if (result) {
                    sendMailboxVerificationCode(result)
                }
            })
        }
    )
}

const sendMailboxVerificationCode = async (geetestResult: GeetestResult) => {
    try {
        const response = await axios.post('https://cf-v2.uapis.cn/sendmailcode', {
            type: 'register',
            mail: formModel.value.email,
            captcha_output: geetestResult.captcha_output,
            lot_number: geetestResult.lot_number,
            pass_token: geetestResult.pass_token,
            gen_time: geetestResult.gen_time,
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = response.data;
        if (data.state === 'success') {
            message.success("邮箱验证码发送成功")
            buttonDisabled.value = true
            startCountdown()
        } else {
            message.error(data.msg);
            console.error('邮件发送失败:', data.msg);
        }
    } catch (error) {
        console.error('邮件发送API调用失败:', error);
    }
    loadingCaptcha.value = false
}

const startCountdown = () => {
    buttonText.value = `重新发送(${countdown.value}s)`
    const interval = setInterval(() => {
        countdown.value -= 1
        buttonText.value = `重新发送(${countdown.value}s)`
        if (countdown.value <= 0) {
            clearInterval(interval)
            buttonDisabled.value = false
            buttonText.value = '发送验证码'
            countdown.value = 60 // 重置倒计时
        }
    }, 1000)
}

const formModel = ref({
    username: '',
    qq: '',
    password: '',
    email: '',
    confirmPassword: '',
    verificationCode: ''
});

const registerRules = {
    username: [
        {
            required: true,
            message: '用户名不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[A-Za-z0-9_@./#&+-]{0,20}$/,
            message: '用户名只能包含字母、数字和常用的特殊字符',
            trigger: ['blur', 'input']
        }
    ],
    qq: [
        {
            required: true,
            message: 'QQ号不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[0-9]{1,20}$/,
            message: 'QQ号只能为数字，且最大20位',
            trigger: ['blur', 'input']
        }
    ],
    password: [
        {
            required: true,
            message: '密码不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码6~48位，且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input']
        }
    ],
    email: [
        {
            required: true,
            message: '邮箱不能为空',
            trigger: 'blur'
        },
        {
            type: 'email',
            message: '请输入有效的邮箱地址',
            trigger: ['blur', 'input']
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: '请确认密码',
            trigger: 'blur'
        }
    ],
    verificationCode: [
        {
            required: true,
            message: '验证码不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^[0-9]{6}$/,
            message: '验证码必须为6位数字',
            trigger: ['blur', 'input']
        }
    ],
    clause: [
        {
            required: true,
            message: '条款不能不选',
            trigger: 'blur'
        },
    ]
};

const currentStep = ref(1);

const message = useMessage();

const nextStep = async () => {
    if (currentStep.value === 2 && passwordMismatch.value) {
        message.error('密码不匹配，请重新确认。');
    } else if (currentStep.value === 3) {
        RegLoading.value = true;
        try {
            const response = await axios.get(`https://cf-v2.uapis.cn/register?username=${formModel.value.username}&password=${formModel.value.password}&mail=${formModel.value.email}&qq=${formModel.value.qq}&code=${formModel.value.verificationCode}`);
            const data = response.data;
            if (data.state === 'success') {
                message.success("注册成功，请登录")
                toggleRegister()
            } else {
                message.error(data.msg);
                console.error('注册失败:', data.msg);
            }
        } catch (error) {
            console.error('注册API调用失败:', error);
        }
        RegLoading.value = false;
    } else {
        currentStep.value++;
    }
};

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const passwordMismatch = computed(() => {
    return currentStep.value === 2 && formModel.value.password !== formModel.value.confirmPassword;
});

const isNextStepDisabled = computed(() => {
    if (currentStep.value === 1) {
        return !formModel.value.username || !formModel.value.qq || !formModel.value.password;
    }
    if (currentStep.value === 2) {
        return !formModel.value.email || !formModel.value.confirmPassword;
    }
    if (currentStep.value === 3) {
        return !formModel.value.verificationCode || !clause.value || RegLoading.value === true
    }
    return false;
});

const router = useRouter();
const formRef = ref<FormInst | null>(null)
const model = ref<ModelType>({
    email: null,
    password: null
})

const loginRules = {
    password: [
        {
            required: true,
            message: '密码不能为空',
            trigger: 'blur'
        },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码6~48位，且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input']
        }
    ],
}

const handleValidateButtonClick = async () => {
    loginLoading.value = true; // 登录按钮状态设置为加载中

    const loadingMessage = message.create('正在进行登录验证...', {
        type: 'loading',
        duration: 0,
    });

    try {
        await formRef.value?.validate();

        const response = await axios.get('https://cf-v2.uapis.cn/login', {
            params: {
                username: model.value.email,
                password: model.value.password,
            },
        });

        if (response.data.code === 200 && response.data.state === 'success') {
            const userInfo = {
                id: response.data.data.id,
                username: response.data.data.username,
                userimg: response.data.data.userimg,
                qq: response.data.data.qq,
                email: response.data.data.email,
                usertoken: response.data.data.usertoken,
                usergroup: response.data.data.usergroup,
                bandwidth: response.data.data.bandwidth,
                tunnel: response.data.data.tunnel,
                realname: response.data.data.realname,
                integral: response.data.data.integral,
                term: response.data.data.term,
                tunnelCount: response.data.data.tunnelCount,
                regtime: response.data.data.regtime,
                total_download: response.data.data.total_download,
                total_upload: response.data.data.total_upload,
                totalCurConns: response.data.data.totalCurConns,
            };

            const storageDuration = keepLoggedIn.value ? 'permanent' : '1d';
            userStore.setUser(userInfo, storageDuration);

            loadingMessage.type = 'success';
            loadingMessage.content = userInfo?.usergroup === '免费用户'
                ? `登录成功，欢迎您，${userInfo?.username}！`
                : `登录成功，欢迎您，尊贵的会员用户${userInfo?.username}！`;

            router.push('/home');
        } else {
            loadingMessage.type = 'error';
            loadingMessage.content = `登录失败，${response.data.msg}`;
        }
    } catch (error) {
        console.error('表单验证或登录失败', error);
        loadingMessage.type = 'error';
        loadingMessage.content = '表单验证或登录失败，请重试。';
    } finally {
        // 在完成操作后，4秒后自动关闭
        setTimeout(() => {
            loadingMessage.destroy();
        }, 4000);
        loginLoading.value = false;
    }
};

const touristPanel = () => {
    if (!userInfo?.usertoken) {
        router.push('/tunnel/download')
        message.warning('游客页面功能不完全，如需完整功能请登录！')
    } else {
        dialog.warning({
            title: '提示',
            content: '检测到您已登录账户，是否直接跳转到首页？选择是则不退出登录到首页，选择否则退出登录到游客页面。',
            positiveText: '是',
            negativeText: '否',
            onPositiveClick: () => {
                router.push('/home')
            },
            onNegativeClick: () => {
                userStore.clearUser();
                router.push('/tunnel/download')
                message.warning('游客页面功能不完全，如需完整功能请登录！')
            }
        })
    }
}

const isRegister = ref(false)
const isMobile = ref(false)

const toggleRegister = () => {
    isRegister.value = !isRegister.value
}

// 检测窗口大小以确定是否为手机端
const handleResize = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

h1 {
    font-size: 4em;
    font-weight: 700;
    line-height: normal;
}

.hero-container {
    transition: transform 0.75s cubic-bezier(0.25, 0.1, 0.25, 1), text-align 0.75s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.hero-container.hero-right {
    transform: translateX(50%);
    text-align: right;
}

.form-container {
    transition: transform 0.75s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.form-container.form-left {
    transform: translateX(-200%);
}

@media (max-width: 1023.5px) {
    .form-container.form-left {
        transform: none;
    }
}

.center-content {
    display: flex;
    align-items: center;
    justify-content: center;
}

.center-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

.hero {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 50px;
    padding: 70px 0;
    cursor: pointer;

    p {
        font-size: 1.2em;
        font-weight: 500;
    }

    .n-button {
        font-size: 1em;
    }
}

@keyframes moveGradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.hero::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 0;
    width: 280px;
    height: 100px;
    background: linear-gradient(to right, #4460f1, #c471ed, #f64f59);
    background-size: 200% 200%;
    animation: moveGradient 5s ease infinite;
    z-index: 1;
    filter: blur(70px);
}

/* 手机端样式 */
@media (max-width: 768px) {

    .hero-container,
    .form-container {
        transform: none !important;
        text-align: center;
    }

    .register-mode .hero-container {
        order: 2;
    }

    .register-mode .form-container {
        order: 1;
    }

    .n-grid.register-mode {
        flex-direction: column-reverse;
    }

    .center-content {
        flex: 1;
    }

    .hero {
        padding: 20px;
    }
}
</style>