<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 400px">
            <n-form :model="formModel" :rules="rules">
                <n-form-item-row label="旧邮箱验证码">
                    <n-grid cols="5" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="3">
                            <n-input
                                round
                                maxlength="6"
                                :value="oldCode"
                                @update:value="$emit('update:oldCode', $event)"
                                placeholder="请输入6位验证码"
                            />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button
                                        round
                                        :loading="oldLoadingCaptcha"
                                        @click="handleGeeTest('old')"
                                        :disabled="oldButtonDisabled"
                                        style="width: 100%"
                                    >
                                        {{ oldButtonText }}
                                    </n-button>
                                </template>
                                <n-card size="small"></n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
                <n-form-item-row label="新邮箱">
                    <n-input
                        round
                        maxlength="32"
                        :value="newEmail"
                        @update:value="$emit('update:newEmail', $event)"
                        show-count
                        clearable
                        placeholder="请输入新的邮箱"
                    />
                </n-form-item-row>
                <n-form-item-row label="新邮箱验证码">
                    <n-grid cols="5" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="3">
                            <n-input
                                round
                                maxlength="6"
                                :value="newCode"
                                @update:value="$emit('update:newCode', $event)"
                                placeholder="请输入6位验证码"
                            />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button
                                        round
                                        :loading="newLoadingCaptcha"
                                        @click="handleGeeTest('new')"
                                        :disabled="newButtonDisabled || !newEmail"
                                        style="width: 100%"
                                    >
                                        {{ newButtonText }}
                                    </n-button>
                                </template>
                                <n-card size="small"></n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                block
                secondary
                strong
                :disabled="!newEmail || !oldCode || !newCode"
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { resetEmailRules } from '@/utils/authRules';

interface Props {
    show: boolean;
    loading: boolean;
    newEmail: string;
    oldCode: string;
    newCode: string;
    oldButtonText: string;
    newButtonText: string;
    oldButtonDisabled: boolean;
    newButtonDisabled: boolean;
    oldLoadingCaptcha: boolean;
    newLoadingCaptcha: boolean;
    onGeeTest: (type: 'old' | 'new') => void;
    onSubmit: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [value: boolean];
    'update:oldCode': [value: string];
    'update:newEmail': [value: string];
    'update:newCode': [value: string];
}>();

const formModel = computed(() => ({
    oldCode: props.oldCode,
    newEmail: props.newEmail,
    newCode: props.newCode,
}));

const rules = resetEmailRules;

const handleGeeTest = (type: 'old' | 'new') => {
    props.onGeeTest(type);
};

const handleSubmit = () => {
    props.onSubmit();
};
</script>
