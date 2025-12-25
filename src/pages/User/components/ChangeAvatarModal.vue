<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 400px">
            <n-tabs
                class="card-tabs"
                default-value="Link"
                size="large"
                animated
                pane-wrapper-style="margin: 0 -4px"
                pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
            >
                <n-tab-pane name="Link" tab="图片链接">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        图片链接仅支持直链，且无反盗链的链接
                    </n-alert>
                    <n-form ref="formRef" :model="model" :rules="rules">
                        <n-form-item-row label="图片直链" path="newUserImage">
                            <n-input round v-model:value="model.newUserImage" placeholder="请输入图片直链" />
                        </n-form-item-row>
                        <n-button
                            round
                            type="primary"
                            block
                            :loading="loading"
                            @click="handleSubmit"
                            secondary
                            strong
                            style="margin-top: 16px"
                        >
                            提交
                        </n-button>
                    </n-form>
                </n-tab-pane>
                <n-tab-pane name="QQ" tab="根据QQ">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        这里可以根据您绑定的QQ号自动获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48" :src="qqImg" />
                        <n-p>{{ qq }}</n-p>
                    </n-flex>
                    <n-button
                        round
                        type="primary"
                        block
                        :loading="loading"
                        @click="handleSetQQAvatar"
                        secondary
                        strong
                        style="margin-top: 16px"
                    >
                        提交
                    </n-button>
                </n-tab-pane>
                <n-tab-pane name="Cravatar" tab="Cravatar">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        根据您的邮箱绑定的Cravatar获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48" :src="cravatarImg" />
                        <n-p>{{ email }}</n-p>
                    </n-flex>
                    <n-button
                        round
                        type="primary"
                        block
                        :loading="loading"
                        @click="handleSetCravatarAvatar"
                        secondary
                        strong
                        style="margin-top: 16px"
                    >
                        提交
                    </n-button>
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { FormInst } from 'naive-ui';
import { updateUserImageRules } from '@/utils/authRules';

interface Props {
    show: boolean;
    loading: boolean;
    model: {
        newUserImage: string;
    };
    qqImg: string;
    cravatarImg: string;
    qq?: string;
    email?: string;
    onSubmit: () => void;
    onSetQQAvatar: () => void;
    onSetCravatarAvatar: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [value: boolean];
}>();

const formRef = ref<FormInst | null>(null);
const rules = updateUserImageRules;

const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch (e) {
        return;
    }
    props.onSubmit();
};

const handleSetQQAvatar = () => {
    props.onSetQQAvatar();
};

const handleSetCravatarAvatar = () => {
    props.onSetCravatarAvatar();
};

defineExpose({
    formRef,
});
</script>
