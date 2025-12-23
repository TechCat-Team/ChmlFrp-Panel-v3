<template>
    <n-form ref="formRef" :model="model" :rules="loginRules" class="center-form">
        <n-flex justify="center">
            <n-image v-if="isMobile" width="48" style="margin-bottom: 24px" :src="LOGO_URL" preview-disabled />
        </n-flex>
        <n-form-item path="email">
            <n-input
                :value="model.email"
                @update:value="$emit('update:model', { ...model, email: $event })"
                size="large"
                round
                :placeholder="PLACEHOLDERS.USERNAME_OR_EMAIL"
                :maxlength="MAX_LENGTH.LOGIN_EMAIL"
                clearable
            />
        </n-form-item>
        <n-form-item path="password">
            <n-input
                :value="model.password"
                @update:value="$emit('update:model', { ...model, password: $event })"
                size="large"
                round
                :placeholder="PLACEHOLDERS.PASSWORD"
                type="password"
                :maxlength="MAX_LENGTH.LOGIN_PASSWORD"
                :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
            />
        </n-form-item>
        <n-flex justify="space-between">
            <n-checkbox
                size="small"
                :checked="keepLoggedIn"
                @update:checked="$emit('update:keepLoggedIn', $event)"
                :label="LABELS.KEEP_LOGGED_IN"
            />
            <n-button text color="#9398b3" @click="$emit('reset-password')">{{ LABELS.RESET_PASSWORD }}</n-button>
        </n-flex>
        <div style="display: flex; justify-content: flex-end; margin-top: 24px">
            <n-button
                :loading="loading"
                :disabled="!model.email || !model.password || loading"
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
            <n-button text color="#9398b3" @click="$emit('tourist-panel')">{{ BUTTON_TEXT.TOURIST_PANEL }}</n-button>
            <n-button v-if="isMobile" text color="#9398b3" @click="$emit('toggle-register')">
                {{ BUTTON_TEXT.REGISTER_ACCOUNT }}
            </n-button>
        </n-flex>
    </n-form>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { FormInst } from 'naive-ui';
import { loginRules } from '@/utils/authRules';
import type { LoginModel } from '../types';
import { LOGO_URL, PLACEHOLDERS, MAX_LENGTH, LABELS, BUTTON_TEXT } from '../constants';

interface Props {
    model: LoginModel;
    keepLoggedIn: boolean;
    loading: boolean;
    isMobile: boolean;
}

defineProps<Props>();
const formRef = defineModel<FormInst | null>('formRef', { default: null });

const isTouchDevice = inject('isTouchDevice');

defineEmits<{
    'update:model': [value: LoginModel];
    'update:keepLoggedIn': [value: boolean];
    submit: [];
    'reset-password': [];
    'tourist-panel': [];
    'toggle-register': [];
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
