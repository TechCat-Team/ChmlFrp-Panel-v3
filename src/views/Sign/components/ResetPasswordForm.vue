<template>
    <n-form ref="formRef" :model="model" :rules="resetRules">
        <n-form-item :label="LABELS.EMAIL" path="email">
            <n-input
                :value="model.email"
                @update:value="$emit('update:model', { ...model, email: $event })"
                size="large"
                round
                :placeholder="PLACEHOLDERS.RESET_EMAIL"
                clearable
            />
        </n-form-item>
        <n-form-item :label="LABELS.VERIFICATION_CODE" path="verificationCode">
            <n-grid x-gap="12" :cols="5">
                <n-gi :span="3">
                    <n-input
                        :value="model.verificationCode"
                        @update:value="$emit('update:model', { ...model, verificationCode: $event })"
                        size="large"
                        round
                        :placeholder="LABELS.VERIFICATION_CODE"
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
                        :disabled="model.email === '' || buttonDisabled"
                    >
                        {{ buttonText }}
                    </n-button>
                </n-gi>
            </n-grid>
        </n-form-item>
        <n-form-item :label="LABELS.NEW_PASSWORD" path="newPassword">
            <n-input
                :value="model.newPassword"
                @update:value="$emit('update:model', { ...model, newPassword: $event })"
                type="password"
                size="large"
                round
                :placeholder="PLACEHOLDERS.NEW_PASSWORD"
                :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                clearable
            />
        </n-form-item>
        <n-form-item :label="LABELS.CONFIRM_PASSWORD" path="confirmPassword">
            <n-input
                :value="model.confirmPassword"
                @update:value="$emit('update:model', { ...model, confirmPassword: $event })"
                type="password"
                size="large"
                round
                :placeholder="PLACEHOLDERS.CONFIRM_NEW_PASSWORD"
                :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                clearable
            />
        </n-form-item>
        <n-flex justify="space-between">
            <n-button text @click="$emit('to-login')">{{ BUTTON_TEXT.BACK_TO_LOGIN }}</n-button>
            <n-button round type="primary" @click="$emit('submit')" :loading="loading">
                {{ BUTTON_TEXT.RESET_PASSWORD }}
            </n-button>
        </n-flex>
    </n-form>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { FormInst } from 'naive-ui';
import type { ResetPasswordModel } from '../types';
import { RESET_PASSWORD_RULES, LABELS, PLACEHOLDERS, MAX_LENGTH, BUTTON_TEXT } from '../constants';

interface Props {
    model: ResetPasswordModel;
    loading: boolean | { value: boolean };
    loadingCaptcha: boolean | { value: boolean };
    buttonDisabled: boolean | { value: boolean };
    buttonText: string | { value: string };
}

const props = defineProps<Props>();
const formRef = defineModel<FormInst | null>('formRef', { default: null });

const isTouchDevice = inject('isTouchDevice');

// 解包 ref 值
const loading = typeof props.loading === 'object' ? props.loading.value : props.loading;
const loadingCaptcha = typeof props.loadingCaptcha === 'object' ? props.loadingCaptcha.value : props.loadingCaptcha;
const buttonDisabled = typeof props.buttonDisabled === 'object' ? props.buttonDisabled.value : props.buttonDisabled;
const buttonText = typeof props.buttonText === 'object' ? props.buttonText.value : props.buttonText;

const resetRules = {
    ...RESET_PASSWORD_RULES,
    confirmPassword: [
        ...RESET_PASSWORD_RULES.confirmPassword,
        {
            validator: (rule: any, value: string) => {
                void rule;
                if (value !== props.model.newPassword) {
                    return new Error('两次输入的密码不一致');
                }
                return true;
            },
            trigger: 'blur',
        },
    ],
};

defineEmits<{
    'update:model': [value: ResetPasswordModel];
    submit: [];
    'send-code': [email: string];
    'to-login': [];
}>();
</script>

