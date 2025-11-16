<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 500px" title="注销账户验证" :bordered="false" role="dialog" aria-modal="true">
            <n-alert type="warning"> 为了确保安全，我们需要对您的邮箱发送验证码，以确认本人操作。 </n-alert>
            <n-form style="margin-top: 16px">
                <n-form-item-row label="旧邮箱验证码">
                    <n-grid cols="5" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="3">
                            <n-input
                                round
                                maxlength="6"
                                :value="code"
                                @update:value="$emit('update:code', $event)"
                                placeholder="请输入6位验证码"
                            />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button
                                        round
                                        :loading="loadingCaptcha"
                                        @click="handleGeeTest"
                                        :disabled="buttonDisabled"
                                        style="width: 100%"
                                    >
                                        {{ buttonText }}
                                    </n-button>
                                </template>
                                <n-card size="small"></n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
            </n-form>
            <template #footer>
                <n-flex justify="end">
                    <n-button round @click="onBack">上一步</n-button>
                    <n-button round type="primary" strong secondary @click="onSubmit" :loading="loading">
                        执行注销
                    </n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
interface Props {
    show: boolean;
    loading: boolean;
    loadingCaptcha: boolean;
    buttonDisabled: boolean;
    buttonText: string;
    code: string;
    onGeeTest: () => void;
    onBack: () => void;
    onSubmit: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [value: boolean];
    'update:code': [value: string];
}>();

const handleGeeTest = () => {
    props.onGeeTest();
};
</script>

