<template>
    <n-layout style="height: 100vh">
        <n-layout-content>
            <n-grid cols="6" item-responsive responsive="screen" :class="{ 'register-mode': isRegister, 'mobile-mode': isMobile }">
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
                            <n-form ref="formRef" :model="model" :rules="rules" class="center-form">
                                <n-alert title="隐私策略&服务条款有更新" type="info">
                                    登录即代表您同意更新后的条款。点我查看隐私策略&服务条款。
                                </n-alert>
                                <n-form-item path="email">
                                    <n-input v-model:value="model.email" size="large" round placeholder="用户名或邮箱"
                                        maxlength="30" clearable />
                                </n-form-item>
                                <n-form-item path="password">
                                    <n-input v-model:value="model.password" size="large" round placeholder="密码"
                                        type="password" maxlength="64" show-password-on="mousedown"/>
                                </n-form-item>
                                <div style="display: flex; justify-content: flex-end;">
                                    <n-button text color="#9398b3">
                                        重置密码
                                    </n-button>
                                </div>
                                <div style="display: flex; justify-content: flex-end; margin-top: 24px">
                                    <n-button :disabled="model.email === null || model.password === null" round
                                        type="primary" style="width: 100%;" size="large" @click="handleValidateButtonClick">
                                        登录
                                    </n-button>
                                </div>
                            </n-form>
                        </template>
                        <template v-else>
                            <n-form ref="formRef" :model="registerModel" :rules="registerRules" class="center-form">
                                <n-form-item path="邮箱">
                                    <n-input v-model:value="registerModel.email" size="large" round placeholder="邮箱"
                                        maxlength="30" clearable />
                                </n-form-item>
                                <!-- <n-form-item path="password">
                                    <n-input v-model:value="registerModel.password" size="large" round placeholder="密码"
                                        type="password" maxlength="64" />
                                </n-form-item>
                                <n-form-item path="confirmPassword">
                                    <n-input v-model:value="registerModel.confirmPassword" size="large" round placeholder="确认密码"
                                        type="password" maxlength="64" />
                                </n-form-item> -->
                                <div style="display: flex; justify-content: flex-end; margin-top: 24px">
                                    <n-button :disabled="registerModel.email === null || registerModel.password === null || registerModel.confirmPassword === null" round
                                        type="primary" style="width: 100%;" size="large" @click="handleRegisterButtonClick">
                                        注册
                                    </n-button>
                                </div>
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

import {
    FormInst,
    FormRules
} from 'naive-ui'

interface ModelType {
    email: string | null
    password: string | null
}

interface RegisterModelType {
    email: string | null
    password: string | null
    confirmPassword: string | null
}

const router = useRouter();
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const model = ref<ModelType>({
    email: null,
    password: null
})
const registerModel = ref<RegisterModelType>({
    email: null,
    password: null,
    confirmPassword: null
})
const rules: FormRules = {
    email: [
        {
            required: true,
            message: '请输入用户名/邮箱'
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码'
        }
    ],
}

const registerRules: FormRules = {
    email: [
        {
            required: true,
            message: '请输入邮箱'
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码'
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: '请确认密码'
        },
        {
            validator(rule, value) {
                if (value !== registerModel.value.password) {
                    return new Error('两次输入的密码不一致')
                }
                return true
            },
            trigger: 'input'
        }
    ]
}

const handleValidateButtonClick = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate((errors) => {
        if (!errors) {
            message.success('验证成功，正在跳转至首页')
            router.push('/home')
        } else {
            console.log(errors)
            message.error('验证失败')
        }
    })
}

const handleRegisterButtonClick = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate((errors) => {
        if (!errors) {
            message.success('注册成功，正在跳转至首页')
            router.push('/home')
        } else {
            console.log(errors)
            message.error('注册失败')
        }
    })
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