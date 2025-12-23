<template>
    <n-layout style="height: 100vh">
        <n-layout-content>
            <n-grid
                cols="6"
                item-responsive
                responsive="screen"
                :class="{ 'register-mode': isRegister, 'reset-mode': isReset, 'mobile-mode': isMobile }"
            >
                <n-grid-item span="0 m:4" class="center-content hero-container" :class="{ 'hero-right': isRegister }">
                    <HeroSection
                        :mode="mode"
                        :is-register="isRegister"
                        :is-mobile="isMobile"
                        @toggle-register="handleToggleRegister"
                        @to-login="handleToLogin"
                    />
                </n-grid-item>
                <n-grid-item span="6 m:2" class="center-content form-container" :class="{ 'form-left': isRegister }">
                    <n-card style="height: 100vh">
                        <transition :name="formTransitionName" mode="out-in">
                            <div :key="mode" class="center-form">
                                <template v-if="mode === 'login'">
                                    <template v-if="!isEmailCodeLoginMode">
                                        <LoginForm
                                            v-model:form-ref="formRef"
                                            :model="loginModel"
                                            :keep-logged-in="keepLoggedIn"
                                            :loading="loginLoading"
                                            :is-mobile="isMobile"
                                            @update:model="loginModel = $event"
                                            @update:keep-logged-in="keepLoggedIn = $event"
                                            @submit="handleLoginSubmit"
                                            @reset-password="toReset"
                                            @tourist-panel="touristPanel"
                                            @toggle-register="handleToggleRegister"
                                        />
                                    </template>
                                    <template v-else>
                                        <EmailCodeLoginForm
                                            v-model:form-ref="emailCodeFormRef"
                                            :model="emailCodeModel"
                                            :loading="emailCodeLoginLoading"
                                            :loading-captcha="geetest.loadingCaptcha"
                                            :button-disabled="geetest.buttonDisabled"
                                            :button-text="geetest.buttonText"
                                            :ban-remaining-time="banCountdown.banRemainingTime"
                                            :is-mobile="isMobile"
                                            @update:model="emailCodeModel = $event"
                                            @submit="handleEmailCodeLoginSubmit"
                                            @send-code="handleSendCode('login', $event)"
                                            @back-to-normal-login="backToNormalLogin"
                                            @tourist-panel="touristPanel"
                                        />
                                    </template>
                                </template>
                                <template v-else-if="mode === 'register'">
                                    <RegisterForm
                                        v-model:form-ref="formRef"
                                        :model="registerModel"
                                        :clause="clause"
                                        :current-step="register.currentStep"
                                        :transition-name="register.transitionName"
                                        :loading="register.RegLoading"
                                        :loading-captcha="geetest.loadingCaptcha"
                                        :button-disabled="geetest.buttonDisabled"
                                        :button-text="geetest.buttonText"
                                        :is-next-step-disabled="register.isNextStepDisabled"
                                        :is-mobile="isMobile"
                                        @update:model="registerModel = $event"
                                        @update:clause="clause = $event"
                                        @next-step="register.nextStep"
                                        @prev-step="register.prevStep"
                                        @send-code="handleSendCode('register', $event)"
                                        @tourist-panel="touristPanel"
                                        @toggle-register="handleToggleRegister"
                                    />
                                </template>
                                <template v-else>
                                    <ResetPasswordForm
                                        v-model:form-ref="resetFormRef"
                                        :model="resetModel"
                                        :loading="resetPassword.loginLoading"
                                        :loading-captcha="geetest.loadingCaptcha"
                                        :button-disabled="geetest.buttonDisabled"
                                        :button-text="geetest.buttonText"
                                        @update:model="resetModel = $event"
                                        @submit="handleResetPasswordSubmit"
                                        @send-code="handleSendCode('reset_password', $event)"
                                        @to-login="handleToLogin"
                                    />
                                </template>
                            </div>
                        </transition>
                    </n-card>
                </n-grid-item>
            </n-grid>
        </n-layout-content>
    </n-layout>
</template>

<script lang="ts" setup>
import { ref, provide, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage, useDialog, FormInst } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import HeroSection from './components/HeroSection.vue';
import LoginForm from './components/LoginForm.vue';
import EmailCodeLoginForm from './components/EmailCodeLoginForm.vue';
import RegisterForm from './components/RegisterForm.vue';
import ResetPasswordForm from './components/ResetPasswordForm.vue';
import { useGeetest } from './composables/useGeetest';
import { useBanCountdown } from './composables/useBanCountdown';
import { useModeSwitch } from './composables/useModeSwitch';
import { useMobileDetection } from './composables/useMobileDetection';
import { useLogin } from './composables/useLogin';
import { useEmailCodeLogin } from './composables/useEmailCodeLogin';
import { useRegister } from './composables/useRegister';
import { useResetPassword } from './composables/useResetPassword';
import type { LoginModel, EmailCodeLoginModel, RegisterModel, ResetPasswordModel } from './types';
import { MESSAGES } from './constants';

const router = useRouter();
const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();
const userInfo = userStore.userInfo;

// 模式切换
const { isRegister, isReset, mode, formTransitionName, toLogin, toReset, toggleRegister } = useModeSwitch();

// 移动端 & 触控检测
const { isMobile } = useMobileDetection();
const isTouchDevice = (() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error 兼容旧版浏览器
        navigator.msMaxTouchPoints > 0
    );
})();
provide('isTouchDevice', isTouchDevice);

// 极验验证码
const geetest = useGeetest();

// 封禁倒计时
const banCountdown = useBanCountdown();

// 表单引用
const formRef = ref<FormInst | null>(null);
const emailCodeFormRef = ref<FormInst | null>(null);
const resetFormRef = ref<FormInst | null>(null);

// 登录相关
const loginModel = ref<LoginModel>({ email: null, password: null });
const keepLoggedIn = ref(false);
const isEmailCodeLoginMode = ref(false);
const emailCodeModel = ref<EmailCodeLoginModel>({ email: '', code: '' });

const handleBanned = (errorMessage: string) => {
    const timeMatch = errorMessage.match(/剩余时间[：:]\s*([^，,]+)/);
    if (timeMatch && timeMatch[1]) {
        const timeStr = timeMatch[1].trim();
        banCountdown.startBanCountdown(timeStr);
    } else {
        banCountdown.stopBanCountdown();
    }

    isEmailCodeLoginMode.value = true;
    if (loginModel.value.email && loginModel.value.email.includes('@')) {
        emailCodeModel.value.email = loginModel.value.email;
    }
};

const { loginLoading, handleLogin } = useLogin(loginModel, keepLoggedIn, handleBanned);
const { loginLoading: emailCodeLoginLoading, handleEmailCodeLogin } = useEmailCodeLogin(emailCodeModel, keepLoggedIn);

// 注册相关
const registerModel = ref<RegisterModel>({
    username: '',
    qq: '',
    password: '',
    email: '',
    confirmPassword: '',
    verificationCode: '',
});
const clause = ref(false);

const register = useRegister(registerModel, clause, () => {
    toggleRegister();
    registerModel.value = {
        username: '',
        qq: '',
        password: '',
        email: '',
        confirmPassword: '',
        verificationCode: '',
    };
    clause.value = false;
});

// 重置密码相关
const resetModel = ref<ResetPasswordModel>({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
});

const resetPassword = useResetPassword(resetModel, () => {
    handleToLogin();
    resetModel.value = {
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: '',
    };
});

// 处理登录
const handleLoginSubmit = () => {
    handleLogin(formRef.value);
};

// 处理邮箱验证码登录
const handleEmailCodeLoginSubmit = () => {
    handleEmailCodeLogin(emailCodeFormRef.value);
    if (emailCodeLoginLoading.value === false) {
        isEmailCodeLoginMode.value = false;
        emailCodeModel.value = { email: '', code: '' };
        banCountdown.stopBanCountdown();
    }
};

// 处理重置密码
const handleResetPasswordSubmit = () => {
    resetPassword.handleResetPassword();
};

// 处理发送验证码
const handleSendCode = (type: string, email: string) => {
    geetest.showGeetest(type, email);
};

// 返回普通登录
const backToNormalLogin = () => {
    isEmailCodeLoginMode.value = false;
    emailCodeModel.value = { email: '', code: '' };
    banCountdown.stopBanCountdown();
};

// 切换到登录
const handleToLogin = () => {
    toLogin();
    isEmailCodeLoginMode.value = false;
    emailCodeModel.value = { email: '', code: '' };
    banCountdown.stopBanCountdown();
};

// 切换注册
const handleToggleRegister = () => {
    toggleRegister();
    if (!isRegister.value) {
        isEmailCodeLoginMode.value = false;
        emailCodeModel.value = { email: '', code: '' };
        banCountdown.stopBanCountdown();
    }
};

// 游客面板
const touristPanel = () => {
    if (!userInfo?.usertoken) {
        router.push('/tunnel/download');
        message.warning(MESSAGES.TOURIST_PANEL_WARNING);
    } else {
        dialog.warning({
            title: MESSAGES.TOURIST_PANEL_TITLE,
            content: MESSAGES.TOURIST_PANEL_CONTENT,
            positiveText: '是',
            negativeText: '否',
            onPositiveClick: () => {
                router.push('/home');
            },
            onNegativeClick: () => {
                userStore.clearUser();
                router.push('/tunnel/download');
                message.warning(MESSAGES.TOURIST_PANEL_WARNING);
            },
        });
    }
};

const handleEnterKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || event.isComposing) {
        return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.tagName === 'TEXTAREA') {
        return;
    }

    const triggerLogin = () => {
        if (loginLoading.value || !loginModel.value.email || !loginModel.value.password) {
            return false;
        }
        handleLoginSubmit();
        return true;
    };

    const triggerEmailCodeLogin = () => {
        if (
            emailCodeLoginLoading.value ||
            !emailCodeModel.value.email ||
            !emailCodeModel.value.code ||
            geetest.loadingCaptcha.value === true
        ) {
            return false;
        }
        handleEmailCodeLoginSubmit();
        return true;
    };

    const triggerRegister = () => {
        if (register.isNextStepDisabled.value || register.RegLoading.value) {
            return false;
        }
        register.nextStep();
        return true;
    };

    const triggerResetPassword = () => {
        if (
            resetPassword.loginLoading.value ||
            !resetModel.value.email ||
            !resetModel.value.newPassword ||
            !resetModel.value.confirmPassword ||
            !resetModel.value.verificationCode
        ) {
            return false;
        }
        handleResetPasswordSubmit();
        return true;
    };

    let handled = false;
    if (mode.value === 'login') {
        handled = isEmailCodeLoginMode.value ? triggerEmailCodeLogin() : triggerLogin();
    } else if (mode.value === 'register') {
        handled = triggerRegister();
    } else if (isReset.value) {
        handled = triggerResetPassword();
    }

    if (handled) {
        event.preventDefault();
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleEnterKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleEnterKeydown);
});
</script>

<style lang="scss">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.form-slide-enter-active,
.form-slide-leave-active {
    transition: all 0.5s ease;
}

.form-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.form-slide-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.form-slide-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.form-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.5s ease;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-down-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.slide-down-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.hero-container {
    transition:
        transform 0.75s cubic-bezier(0.25, 0.1, 0.25, 1),
        text-align 0.75s cubic-bezier(0.25, 0.1, 0.25, 1);
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

/* 手机端样式 */
@media (max-width: 768px) {
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
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.3s ease;
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateX(20px);
}

.slide-left-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.slide-left-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}

.slide-right-enter-to {
    opacity: 1;
    transform: translateX(0);
}

.slide-right-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
