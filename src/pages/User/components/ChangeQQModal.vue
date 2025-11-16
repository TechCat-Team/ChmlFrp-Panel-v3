<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 400px">
            <n-form ref="formRef" :model="model" :rules="rules">
                <n-form-item-row label="新QQ号" path="newQQ">
                    <n-input
                        round
                        maxlength="20"
                        v-model:value="model.newQQ"
                        show-count
                        clearable
                        placeholder="请输入新的QQ号"
                    />
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                :disabled="!model.newQQ"
                :loading="loading"
                @click="handleSubmit"
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
import { updateQQRules } from '@/utils/authRules';

interface Props {
    show: boolean;
    loading: boolean;
    model: {
        newQQ: string;
    };
    onSubmit: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [value: boolean];
}>();

const formRef = ref<FormInst | null>(null);
const rules = updateQQRules;

const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch (errors) {
        return;
    }
    props.onSubmit();
};

defineExpose({
    formRef,
});
</script>

