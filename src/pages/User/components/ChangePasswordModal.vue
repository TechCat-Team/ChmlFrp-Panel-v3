<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 400px">
            <n-form :model="model" :rules="rules">
                <n-form-item-row label="原密码" path="original_password">
                    <n-input
                        round
                        type="password"
                        v-model:value="model.original_password"
                        :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                        placeholder="请输入原密码"
                    />
                </n-form-item-row>
                <n-form-item-row label="新密码" path="new_password">
                    <n-input
                        round
                        type="password"
                        v-model:value="model.new_password"
                        maxlength="48"
                        :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                        placeholder="请输入新密码"
                    />
                </n-form-item-row>
                <n-form-item-row label="重复新密码" path="reentered_new_password">
                    <n-input
                        round
                        type="password"
                        v-model:value="model.reentered_new_password"
                        maxlength="48"
                        show-count
                        clearable
                        placeholder="请再次输入新密码"
                    />
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                @click="handleSubmit"
                block
                secondary
                strong
                :loading="loading"
                :disabled="!model.original_password || !model.new_password || !model.reentered_new_password || loading"
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { FormRules } from 'naive-ui';
import { inject } from 'vue';

interface Props {
    show: boolean;
    loading: boolean;
    model: {
        original_password: string;
        new_password: string;
        reentered_new_password: string;
    };
    onSubmit: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [value: boolean];
}>();
const isTouchDevice = inject('isTouchDevice');

const rules: FormRules = {
    original_password: [
        { required: true, message: '原密码不能为空', trigger: 'blur' },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input'],
        },
    ],
    new_password: [
        { required: true, message: '新密码不能为空', trigger: 'blur' },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input'],
        },
    ],
    reentered_new_password: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: (_rule, value) => {
                if (value !== props.model.new_password) {
                    return new Error('两次输入的新密码不一致');
                }
                return true;
            },
            trigger: ['blur', 'input'],
        },
    ],
};

const handleSubmit = () => {
    props.onSubmit();
};
</script>

