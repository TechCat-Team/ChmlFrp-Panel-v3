<template>
    <n-form ref="formRef" :model="model" :rules="emailCodeLoginRules" class="center-form">
        <n-flex justify="center">
            <n-image
                v-if="isMobile"
                width="48"
                style="margin-bottom: 24px"
                :src="LOGO_URL"
                preview-disabled
            />
        </n-flex>
        <n-alert type="warning" style="margin-bottom: 24px">
            {{ ALERT_MESSAGES.EMAIL_CODE_LOGIN_REQUIRED }}
            <template v-if="banRemainingTime">
                <br />{{ ALERT_MESSAGES.REMAINING_TIME(banRemainingTime) }}
            </template>
        </n-alert>
        <n-form-item label="邮箱" path="email">
            <n-input
                :value="model.email"
                @update:value="$emit('update:model', { ...model, email: $event })"
                size="large"
                round
                :placeholder="PLACEHOLDERS.REGISTER_EMAIL"
                type="email"
                :maxlength="MAX_LENGTH.EMAIL"
                clearable
            />
        </n-form-item>
        <n-form-item label="验证码" path="code">
            <n-grid x-gap="12" :cols="5">
                <n-gi :span="3">
                    <n-input
                        :value="model.code"
                        @update:value="$emit('update:model', { ...model, code: $event.replace(/\D/g, '') })"
                        size="large"
                        round
                        :placeholder="PLACEHOLDERS.VERIFICATION_CODE_6_DIGITS"
                        :maxlength="MAX_LENGTH.VERIFICATION_CODE"
                        clearable
                    />
                </n-gi>
                <n-gi :span="2">
                    <n-button
                        :loading="loadingCaptcha"
                        @click="$emit('send-code', model.email)"
                        style="width: 100%"
                        strong
                        secondary
                        type="primary"
                        round
                        size="large"
                        :disabled="buttonDisabled || !model.email"
                    >
                        {{ buttonText }}
                    </n-button>
                </n-gi>
            </n-grid>
        </n-form-item>
        <div style="display: flex; justify-content: flex-end; margin-top: 24px">
            <n-button
                :loading="loading"
                :disabled="!model.email || !model.code || loading"
                round
                type="primary"
                style="width: 100%"
                size="large"
                @click="$emit('submit')"
            >
                {{ BUTTON_TEXT.LOGIN }}
            </n-button>
        </div>
        <n-flex justify="space-between" style="margin-top: 32px">
            <n-button text color="#9398b3" @click="$emit('back-to-normal-login')">
                {{ BUTTON_TEXT.BACK_TO_NORMAL_LOGIN }}
            </n-button>
            <n-button text color="#9398b3" @click="$emit('tourist-panel')">{{ BUTTON_TEXT.TOURIST_PANEL }}</n-button>
        </n-flex>
    </n-form>
</template>

<script lang="ts" setup>
import { FormInst } from 'naive-ui';
import type { EmailCodeLoginModel } from '../types';
import { EMAIL_CODE_LOGIN_RULES, LOGO_URL, PLACEHOLDERS, MAX_LENGTH, ALERT_MESSAGES, BUTTON_TEXT } from '../constants';

interface Props {
    model: EmailCodeLoginModel;
    loading: boolean | { value: boolean };
    loadingCaptcha: boolean | { value: boolean };
    buttonDisabled: boolean | { value: boolean };
    buttonText: string | { value: string };
    banRemainingTime: string | { value: string };
    isMobile: boolean | { value: boolean };
}

const props = defineProps<Props>();
const formRef = defineModel<FormInst | null>('formRef', { default: null });

const emailCodeLoginRules = EMAIL_CODE_LOGIN_RULES;

// 解包 ref 值
const loading = typeof props.loading === 'object' ? props.loading.value : props.loading;
const loadingCaptcha = typeof props.loadingCaptcha === 'object' ? props.loadingCaptcha.value : props.loadingCaptcha;
const buttonDisabled = typeof props.buttonDisabled === 'object' ? props.buttonDisabled.value : props.buttonDisabled;
const buttonText = typeof props.buttonText === 'object' ? props.buttonText.value : props.buttonText;
const banRemainingTime = typeof props.banRemainingTime === 'object' ? props.banRemainingTime.value : props.banRemainingTime;
const isMobile = typeof props.isMobile === 'object' ? props.isMobile.value : props.isMobile;

defineEmits<{
    'update:model': [value: EmailCodeLoginModel];
    submit: [];
    'send-code': [email: string];
    'back-to-normal-login': [];
    'tourist-panel': [];
}>();
</script>

<style scoped>
.center-form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}
</style>

