<template>
    <n-card title="使用兑换码">
        <n-form ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="auto">
            <n-form-item path="exchangeCode" label="兑换码" :show-require-mark="true">
                <n-input
                    placeholder="请输入兑换码，如：XXXX-XXXX-XXXX-XXXX"
                    v-model:value="model.exchangeCode"
                    round
                />
            </n-form-item>
            <n-row :gutter="[0, 24]">
                <n-col :span="24">
                    <div style="display: flex; justify-content: flex-end">
                        <n-button
                            :loading="loading"
                            :disabled="model.exchangeCode === null || loading"
                            round
                            type="primary"
                            @click="handleSubmit"
                        >
                            验证
                        </n-button>
                    </div>
                </n-col>
            </n-row>
        </n-form>
    </n-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { FormInst } from 'naive-ui';
import { exchangeCodeRules } from '@/utils/authRules';

interface Props {
    loading: boolean;
    model: {
        exchangeCode: string | null;
    };
    onSubmit: () => void;
}

const props = defineProps<Props>();

const formRef = ref<FormInst | null>(null);
const rules = exchangeCodeRules;

const handleSubmit = () => {
    props.onSubmit();
};

defineExpose({
    formRef,
});
</script>

