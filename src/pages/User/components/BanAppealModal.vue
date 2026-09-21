<template>
    <n-modal
        v-model:show="showModel"
        preset="card"
        title="提交申诉"
        size="large"
        style="max-width: 620px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" require-mark-placement="right-hanging">
            <n-alert v-if="record" type="error" :bordered="false" class="record-summary">
                <template #header>被申诉的封禁记录 · #{{ record.id }}</template>
                <div class="summary-line">
                    <span class="summary-label">违规隧道：</span>{{ record.tunnel_name || '-' }}
                </div>
                <div class="summary-line">
                    <span class="summary-label">违规URL：</span>{{ record.url || '-' }}
                </div>
                <div class="summary-line">
                    <span class="summary-label">封禁时间：</span>{{ formattedBannedAt }}
                </div>
                <div v-if="record.reason" class="summary-line">
                    <span class="summary-label">封禁原因：</span>{{ record.reason }}
                </div>
            </n-alert>

            <n-form-item label="申诉理由" path="reason">
                <n-input
                    v-model:value="form.reason"
                    type="textarea"
                    placeholder="请说明申诉理由，例如封禁内容与实际用途不符、已完成整改等"
                    :maxlength="BAN_APPEAL_REASON_MAX"
                    show-count
                    :autosize="{ minRows: 4, maxRows: 8 }"
                />
            </n-form-item>

            <n-form-item label="联系方式" path="contact">
                <n-input
                    v-model:value="form.contact"
                    placeholder="请填写 QQ 号或邮箱，便于我们回复申诉结果"
                    :maxlength="100"
                    clearable
                />
            </n-form-item>

            <n-form-item label="佐证图片">
                <n-space vertical :size="8" class="upload-wrap">
                    <n-upload
                        v-model:file-list="fileList"
                        :default-upload="false"
                        list-type="image-card"
                        accept="image/*"
                        :max="BAN_APPEAL_IMAGE_MAX"
                    />
                    <n-text depth="3" class="upload-tip">
                        选填，最多 {{ BAN_APPEAL_IMAGE_MAX }} 张、单张不超过 {{ maxImageSizeText }}，支持 JPG / PNG /
                        WEBP；请勿上传与申诉无关的内容。
                    </n-text>
                </n-space>
            </n-form-item>
        </n-form>

        <template #footer>
            <n-space justify="end">
                <n-button :disabled="submitting" @click="showModel = false">取消</n-button>
                <n-button type="primary" :loading="submitting" @click="handleSubmit">提交申诉</n-button>
            </n-space>
        </template>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useMessage, type FormInst, type FormRules, type UploadFileInfo } from 'naive-ui';
import { formatApiDateTime } from '@/utils/formatApiDateTime';
import { formatBytes } from '@/utils/formatBytes';
import { submitViolationAppeal, type MyBanRecord } from '@/api/v2/user/violation';
import {
    BAN_APPEAL_IMAGE_MAX,
    BAN_APPEAL_IMAGE_MAX_BYTES,
    BAN_APPEAL_REASON_MAX,
} from '../constants';

const props = defineProps<{
    show: boolean;
    record: MyBanRecord | null;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    submitted: [];
}>();

const message = useMessage();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const formRef = ref<FormInst | null>(null);
const form = ref({ reason: '', contact: '' });
const fileList = ref<UploadFileInfo[]>([]);
const submitting = ref(false);

const formattedBannedAt = computed(() => formatApiDateTime(props.record?.banned_at));

const maxImageSizeText = computed(() => {
    const { value, suffix } = formatBytes(BAN_APPEAL_IMAGE_MAX_BYTES);
    return `${value} ${suffix}`;
});

const rules: FormRules = {
    reason: {
        required: true,
        trigger: ['input', 'blur'],
        validator: (_rule, value: string) => {
            const reason = (value || '').trim();
            if (!reason) {
                return new Error('请填写申诉理由');
            }
            if (reason.length < 10) {
                return new Error('申诉理由不少于 10 个字，以便我们了解情况');
            }
            return true;
        },
    },
    contact: {
        required: true,
        trigger: ['input', 'blur'],
        message: '请填写 QQ 号或邮箱，便于回复申诉结果',
    },
};

// 每次打开弹窗重置表单与校验状态
watch(
    () => props.show,
    (show) => {
        if (!show) {
            return;
        }
        form.value = { reason: '', contact: '' };
        fileList.value = [];
        submitting.value = false;
        formRef.value?.restoreValidation();
    }
);

const collectImages = () =>
    fileList.value.map((item) => item.file).filter((file): file is File => file instanceof File);

const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }

    const target = props.record;
    if (!target) {
        return;
    }

    const images = collectImages();
    const oversize = images.find((file) => file.size > BAN_APPEAL_IMAGE_MAX_BYTES);
    if (oversize) {
        message.error(`图片「${oversize.name}」超过单张 ${maxImageSizeText.value} 的上限`);
        return;
    }

    submitting.value = true;
    try {
        await submitViolationAppeal(
            {
                banRecordId: target.id,
                reason: form.value.reason.trim(),
                contact: form.value.contact.trim(),
            },
            images
        );
        message.success('申诉已提交，我们会尽快复核并通过您填写的联系方式回复');
        emit('submitted');
        showModel.value = false;
    } catch (error: any) {
        message.error(error?.message || '申诉提交失败，请稍后重试');
    } finally {
        submitting.value = false;
    }
};
</script>

<style scoped lang="scss">
.record-summary {
    margin-bottom: 16px;

    .summary-line {
        line-height: 1.8;
        font-size: 13px;
    }

    .summary-label {
        color: var(--n-text-color-2);
    }
}

.upload-wrap {
    width: 100%;
}

.upload-tip {
    font-size: 12px;
    line-height: 1.6;
}
</style>
