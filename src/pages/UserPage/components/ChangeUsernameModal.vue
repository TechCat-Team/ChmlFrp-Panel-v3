<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 400px">
            <n-form ref="formRef" :model="model" :rules="rules">
                <n-form-item-row label="更改后的用户名" path="newUserName">
                    <n-input round v-model:value="model.newUserName" placeholder="请输入新的用户名" />
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                @click="handleSubmit"
                :disabled="!model.newUserName"
                :loading="loading"
                block
                secondary
                strong
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { FormInst } from 'naive-ui';
import { updateUserNameRules } from '@/utils/authRules';

interface Props {
    show: boolean;
    loading: boolean;
    model: {
        newUserName: string;
    };
    onSubmit: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [value: boolean];
}>();

const formRef = ref<FormInst | null>(null);
const rules = updateUserNameRules;

const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch (e: any) {
        return;
    }
    props.onSubmit();
};

defineExpose({
    formRef,
});
</script>

