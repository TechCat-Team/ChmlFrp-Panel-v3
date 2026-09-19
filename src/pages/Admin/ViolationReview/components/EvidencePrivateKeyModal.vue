<template>
    <n-modal
        v-model:show="showModel"
        preset="card"
        title="证据解密私钥"
        size="large"
        style="max-width: 720px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-space vertical :size="14">
            <n-alert type="info" :bordered="false">
                证据图片为端到端加密，服务端只持有公钥、无法解密。私钥仅保存在当前浏览器会话中
                （sessionStorage），不会上传到服务端；关闭浏览器后需要重新填写。
            </n-alert>

            <n-space align="center" :size="8">
                <span class="status-label">当前状态</span>
                <n-tag :type="hasPrivateKey ? 'success' : 'warning'" size="small" round>
                    {{ hasPrivateKey ? '已设置' : '未设置' }}
                </n-tag>
            </n-space>

            <n-input
                v-model:value="draft"
                type="textarea"
                :autosize="{ minRows: 6, maxRows: 12 }"
                :disabled="saving"
                :placeholder="placeholder"
            />
        </n-space>

        <template #footer>
            <n-space justify="space-between" :size="12">
                <n-button quaternary :disabled="!hasPrivateKey || saving" @click="handleClear">
                    清除已保存私钥
                </n-button>
                <n-space :size="12">
                    <n-button :disabled="saving" @click="showModel = false">取消</n-button>
                    <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
                </n-space>
            </n-space>
        </template>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useEvidencePrivateKey } from '../composables/useEvidencePrivateKey';

const props = defineProps<{
    show: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const message = useMessage();
const { hasPrivateKey, savePrivateKey, resetPrivateKey } = useEvidencePrivateKey();

// 不回填已保存的私钥，避免在屏幕上二次暴露密文材料
const draft = ref('');
const saving = ref(false);

const placeholder = computed(() =>
    hasPrivateKey.value
        ? '已设置私钥；如需更换，请粘贴新的私钥覆盖'
        : '粘贴 RSA 私钥（PKCS#8 PEM，以 -----BEGIN PRIVATE KEY----- 开头）'
);

const handleSave = async () => {
    if (saving.value) {
        return;
    }
    const value = draft.value.trim();
    if (!value) {
        if (hasPrivateKey.value) {
            message.info('未填写新私钥，已保留当前私钥');
            showModel.value = false;
        } else {
            message.error('请先粘贴 RSA 私钥内容');
        }
        return;
    }

    saving.value = true;
    try {
        await savePrivateKey(value);
        draft.value = '';
        message.success('解密私钥已保存，仅对当前浏览器会话生效');
        showModel.value = false;
    } catch (error: any) {
        message.error(error?.message || '私钥格式不正确');
    } finally {
        saving.value = false;
    }
};

const handleClear = () => {
    resetPrivateKey();
    draft.value = '';
    message.success('解密私钥已清除');
    showModel.value = false;
};
</script>

<style scoped lang="scss">
.status-label {
    font-size: 13px;
    color: var(--n-text-color-2);
}
</style>
