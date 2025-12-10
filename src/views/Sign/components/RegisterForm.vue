<template>
    <n-form ref="formRef" :model="model" :rules="registerRules" class="center-form">
        <transition :name="transitionName" mode="out-in">
            <div :key="currentStep" class="step-wrapper">
                <template v-if="currentStep === 1">
                    <n-form-item :label="LABELS.USERNAME" path="username">
                        <n-input
                            :value="model.username"
                            @update:value="$emit('update:model', { ...model, username: $event })"
                            size="large"
                            round
                            :placeholder="LABELS.USERNAME"
                            :maxlength="MAX_LENGTH.USERNAME"
                            clearable
                        />
                    </n-form-item>
                    <n-form-item :label="LABELS.PASSWORD" path="password">
                        <n-input
                            :value="model.password"
                            @update:value="$emit('update:model', { ...model, password: $event })"
                            size="large"
                            round
                            :placeholder="LABELS.PASSWORD"
                            type="password"
                            :maxlength="MAX_LENGTH.PASSWORD"
                            :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                            clearable
                        />
                    </n-form-item>
                    <n-form-item :label="LABELS.QQ" path="qq">
                        <n-input
                            :value="model.qq"
                            @update:value="$emit('update:model', { ...model, qq: $event })"
                            size="large"
                            round
                            :placeholder="PLACEHOLDERS.QQ"
                            :maxlength="MAX_LENGTH.QQ"
                            clearable
                        />
                    </n-form-item>
                </template>
                <template v-if="currentStep === 2">
                    <n-form-item :label="LABELS.EMAIL" path="email">
                        <n-input
                            :value="model.email"
                            @update:value="$emit('update:model', { ...model, email: $event })"
                            size="large"
                            round
                            :placeholder="LABELS.EMAIL"
                            type="email"
                            :maxlength="MAX_LENGTH.EMAIL"
                            clearable
                        />
                    </n-form-item>
                    <n-form-item :label="LABELS.CONFIRM_PASSWORD" path="confirmPassword">
                        <n-input
                            :value="model.confirmPassword"
                            @update:value="$emit('update:model', { ...model, confirmPassword: $event })"
                            size="large"
                            round
                            :placeholder="LABELS.CONFIRM_PASSWORD"
                            type="password"
                            :maxlength="MAX_LENGTH.PASSWORD"
                            :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                            clearable
                        />
                    </n-form-item>
                </template>
                <template v-if="currentStep === 3">
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
                                    :disabled="buttonDisabled"
                                >
                                    {{ buttonText }}
                                </n-button>
                            </n-gi>
                        </n-grid>
                    </n-form-item>
                    <n-form-item :label="LABELS.CLAUSE" path="clause">
                        <n-checkbox size="large" :checked="clause" @update:checked="$emit('update:clause', $event)">
                            我同意CHMLFRP的
                            <n-button text tag="a" :href="TERMS_LINKS.TERMS_OF_SERVICE" target="_blank" type="primary">
                                服务条款
                            </n-button>
                            和
                            <n-button text tag="a" :href="TERMS_LINKS.PRIVACY_POLICY" target="_blank" type="primary">
                                隐私策略
                            </n-button>
                            及
                            <n-button text tag="a" :href="TERMS_LINKS.DISCLAIMER" target="_blank" type="primary">
                                免责声明
                            </n-button>
                        </n-checkbox>
                    </n-form-item>
                </template>
            </div>
        </transition>
        <n-flex justify="space-between" style="margin-top: 24px">
            <n-button
                v-if="currentStep > 1"
                @click="$emit('prev-step')"
                :loading="loading"
                round
                type="primary"
                size="large"
            >
                {{ BUTTON_TEXT.PREV_STEP }}
            </n-button>
            <n-button
                @click="$emit('next-step')"
                :disabled="isNextStepDisabled"
                :loading="loading"
                round
                type="primary"
                size="large"
            >
                {{ currentStep === 3 ? BUTTON_TEXT.REGISTER : BUTTON_TEXT.NEXT_STEP }}
            </n-button>
        </n-flex>
        <n-flex justify="space-between" style="margin-top: 32px">
            <n-button text color="#9398b3" @click="$emit('tourist-panel')">{{ BUTTON_TEXT.TOURIST_PANEL }}</n-button>
            <n-button v-if="isMobile" text color="#9398b3" @click="$emit('toggle-register')">
                {{ BUTTON_TEXT.LOGIN_ACCOUNT }}
            </n-button>
        </n-flex>
    </n-form>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { FormInst } from 'naive-ui';
import { registerRules } from '@/utils/authRules';
import type { RegisterModel } from '../types';
import { LABELS, MAX_LENGTH, PLACEHOLDERS, TERMS_LINKS, BUTTON_TEXT } from '../constants';

interface Props {
    model: RegisterModel;
    clause: boolean;
    currentStep: number | { value: number };
    transitionName: ('slide-left' | 'slide-right') | { value: 'slide-left' | 'slide-right' };
    loading: boolean | { value: boolean };
    loadingCaptcha: boolean | { value: boolean };
    buttonDisabled: boolean | { value: boolean };
    buttonText: string | { value: string };
    isNextStepDisabled: boolean | { value: boolean };
    isMobile: boolean | { value: boolean };
}

const props = defineProps<Props>();
const formRef = defineModel<FormInst | null>('formRef', { default: null });

const isTouchDevice = inject('isTouchDevice');

// 解包 ref 值（保持响应式）
const currentStep = computed(() =>
    typeof props.currentStep === 'object' ? props.currentStep.value : props.currentStep
);
const transitionName = computed(() =>
    typeof props.transitionName === 'object' ? props.transitionName.value : props.transitionName
);
const loading = computed(() => (typeof props.loading === 'object' ? props.loading.value : props.loading));
const loadingCaptcha = computed(() =>
    typeof props.loadingCaptcha === 'object' ? props.loadingCaptcha.value : props.loadingCaptcha
);
const buttonDisabled = computed(() =>
    typeof props.buttonDisabled === 'object' ? props.buttonDisabled.value : props.buttonDisabled
);
const buttonText = computed(() =>
    typeof props.buttonText === 'object' ? props.buttonText.value : props.buttonText
);
const isNextStepDisabled = computed(() =>
    typeof props.isNextStepDisabled === 'object' ? props.isNextStepDisabled.value : props.isNextStepDisabled
);
const isMobile = computed(() => (typeof props.isMobile === 'object' ? props.isMobile.value : props.isMobile));

defineEmits<{
    'update:model': [value: RegisterModel];
    'update:clause': [value: boolean];
    'next-step': [];
    'prev-step': [];
    'send-code': [email: string];
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

.step-wrapper {
    min-height: 200px;
}
</style>

