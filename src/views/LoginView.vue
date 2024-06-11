<template>
    <n-layout style="height: 100vh">
        <n-layout-content>
            <n-grid cols="6" item-responsive responsive="screen">
                <n-grid-item span="0 m:4" class="center-content">
                    <div class="hero">
                        <h1>Sign In to<br>ChmlFrp Panel</h1>
                        <p>如果您还没有账号<br>请
                            <n-button text type="primary">点击这里</n-button>
                            进行注册.
                        </p>
                    </div>
                </n-grid-item>
                <n-grid-item span="6 m:2" class="center-content">
                    <n-card style="height: 100vh;">
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
                    </n-card>
                </n-grid-item>
            </n-grid>
        </n-layout-content>
    </n-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';

import {
    FormInst,
    useMessage,
    FormRules
} from 'naive-ui'

interface ModelType {
    email: string | null
    password: string | null
}

const router = useRouter();
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const model = ref<ModelType>({
    email: null,
    password: null
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
</script>

<style lang="scss">
* {
    margin: 0;
    padding: 0;
}

h1 {
    font-size: 4em;
    font-weight: 700;
    line-height: normal;
}

.hero {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 50px;
    padding: 70px 0;

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
</style>
