<template>
    <n-card v-if="userInfo?.realname === '未实名'" title="实名认证" style="margin-bottom: 15px">
        <n-form ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="auto">
            <n-form-item path="name" label="姓名" :show-require-mark="true">
                <n-input v-model:value="model.name" round placeholder="请输入真实姓名" />
            </n-form-item>
            <n-form-item path="idCard" label="身份证" :show-require-mark="true">
                <n-input v-model:value="model.idCard" round placeholder="请输入身份证号" />
            </n-form-item>
            <n-row :gutter="[0, 24]">
                <n-col :span="24">
                    <div style="display: flex; justify-content: flex-end">
                        <n-button
                            :loading="loading"
                            :disabled="model.name === null || model.idCard === null || loading"
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
import { realNameRules } from '@/utils/authRules';

interface Props {
    loading: boolean;
    model: {
        name: string | null;
        idCard: string | null;
    };
    userInfo?: {
        realname?: string;
    };
    onSubmit: () => void;
}

const props = defineProps<Props>();

const formRef = ref<FormInst | null>(null);
const rules = realNameRules;

const handleSubmit = async () => {
    if (!formRef.value?.validate()) {
        return;
    }
    props.onSubmit();
};

defineExpose({
    formRef,
});
</script>

