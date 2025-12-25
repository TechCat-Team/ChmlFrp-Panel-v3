<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card class="modal-card" size="large" :bordered="false">
            <!-- Header -->
            <div class="header">
                <div class="title">申请 SSL 证书</div>
                <div class="subtitle">按步骤完成证书配置</div>
            </div>

            <!-- Steps -->
            <div class="steps-wrapper">
                <n-steps :current="currentStep" size="small" :vertical="isMobile">
                    <n-step title="域名" />
                    <n-step title="证书提供商" />
                    <n-step title="验证方式" />
                </n-steps>
            </div>

            <n-form ref="formRef" :model="model" :rules="rules" label-placement="top">
                <!-- Step 1: Domains -->
                <template v-if="currentStep === 1">
                    <n-form-item label="域名" path="domains">
                        <n-dynamic-input 
                            v-model:value="model.domains" 
                            :min="1" 
                            :max="20"
                            @update:value="handleDomainsChange"
                        >
                            <template #default="{ value }">
                                <n-input
                                    :value="value || ''"
                                    placeholder="example.com 或 *.example.com"
                                    @update:value="(val: string) => updateDomain(value, val)"
                                />
                            </template>
                        </n-dynamic-input>

                        <template #feedback>
                            <n-text depth="3" style="font-size: 12px"> 支持多域名和泛域名，最多20个域名 </n-text>
                        </template>
                    </n-form-item>
                </template>

                <!-- Step 2: Provider -->
                <template v-if="currentStep === 2">
                    <n-form-item label="证书提供商" path="provider">
                        <n-grid cols="1 s:2 m:3" :x-gap="12" responsive="screen">
                            <n-grid-item v-for="item in providerOptions" :key="item.value">
                                <n-card
                                    hoverable
                                    class="select-card"
                                    :class="{
                                        active: model.provider === item.value,
                                        disabled: item.disabled,
                                    }"
                                    @click="!item.disabled && selectProvider(item.value)"
                                >
                                    <div class="card-title">{{ item.label }}</div>
                                    <div class="card-desc">{{ item.description }}</div>
                                </n-card>
                            </n-grid-item>
                        </n-grid>
                    </n-form-item>
                </template>

                <!-- Step 3: Challenge -->
                <template v-if="currentStep === 3">
                    <n-form-item label="验证方式" path="challengeType">
                        <n-grid cols="1 s:2" :x-gap="12" responsive="screen">
                            <n-grid-item v-for="item in challengeOptions" :key="item.value">
                                <n-card
                                    hoverable
                                    class="select-card"
                                    :class="{
                                        active: model.challengeType === item.value,
                                        disabled: item.disabled,
                                    }"
                                    @click="!item.disabled && selectChallenge(item.value)"
                                >
                                    <div class="card-title">{{ item.label }}</div>
                                    <div class="card-desc">{{ item.description }}</div>
                                    <n-text
                                        v-if="item.disabledReason"
                                        depth="3"
                                        style="font-size: 12px; margin-top: 6px"
                                    >
                                        {{ item.disabledReason }}
                                    </n-text>
                                </n-card>
                            </n-grid-item>
                        </n-grid>
                    </n-form-item>
                </template>

                <!-- Footer -->
                <div class="footer">
                    <n-button v-if="currentStep > 1" quaternary @click="prevStep"> 上一步 </n-button>

                    <n-button type="primary" round :disabled="!canNext" :loading="loading" @click="nextStep">
                        {{ currentStep === 3 ? '提交申请' : '下一步' }}
                    </n-button>
                </div>
            </n-form>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import type { FormInst } from 'naive-ui';
import type { CertificateFormModel } from '../types';
import type { SSLProvider, ChallengeType } from '@/api/v2/ssl/ssl';

interface Props {
    show: boolean;
    model: CertificateFormModel;
    loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [boolean];
    'update:model': [CertificateFormModel];
    submit: [];
}>();

const currentStep = ref(1);
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth < 640;
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});

const providerOptions = [
    { label: "Let's Encrypt", value: 'letsencrypt', description: '推荐，最常用', disabled: false },
    { label: 'ZeroSSL', value: 'zerossl', description: '备选，偶尔申请失败', disabled: false },
    { label: 'Google', value: 'google', description: 'Google Trust Services', disabled: true },
];

const hasWildcard = computed(() => 
    props.model.domains.some((d: string | null | undefined) => 
        d && typeof d === 'string' && d.trim().length > 0 && d.trim().startsWith('*.')
    )
);

const hasMultipleDomains = computed(() => 
    props.model.domains.filter((d: string | null | undefined) => 
        d && typeof d === 'string' && d.trim().length > 0
    ).length > 1
);

const http01Disabled = computed(() => hasWildcard.value || hasMultipleDomains.value);

const challengeOptions = computed(() => [
    {
        label: 'HTTP-01',
        value: 'http01',
        description: '文件验证，仅支持单域名',
        disabled: http01Disabled.value,
        disabledReason: http01Disabled.value ? '多域名或泛域名不支持 HTTP-01' : '',
    },
    {
        label: 'DNS-01',
        value: 'dns01',
        description: 'DNS验证，支持泛域名和多域名',
        disabled: false,
    },
]);

watch(http01Disabled, (disabled) => {
    if (disabled && props.model.challengeType === 'http01') {
        emit('update:model', {
            ...props.model,
            challengeType: 'dns01',
        });
    }
});

const formRef = ref<FormInst | null>(null);

const rules = {
    domains: { required: true, message: '请输入域名' },
    provider: { required: true, message: '请选择证书提供商' },
    challengeType: { required: true, message: '请选择验证方式' },
};

const handleDomainsChange = (domains: (string | null)[]) => {
    // 将 null 值转换为空字符串，保持类型一致性
    const validDomains: string[] = domains.length > 0 
        ? domains.map(d => (d === null || d === undefined) ? '' : String(d))
        : [''];
    emit('update:model', { ...props.model, domains: validDomains });
};

const updateDomain = (oldValue: string | null, newValue: string | null) => {
    const domains = [...props.model.domains];
    const index = domains.findIndex(d => d === oldValue);
    if (index !== -1) {
        domains[index] = (newValue === null || newValue === undefined) ? '' : String(newValue);
        emit('update:model', { ...props.model, domains });
    }
};

const selectProvider = (value: string) => {
    emit('update:model', { ...props.model, provider: value as SSLProvider });
};

const selectChallenge = (value: string) => {
    emit('update:model', { ...props.model, challengeType: value as ChallengeType });
};

const canNext = computed(() => {
    const m = props.model;
    if (currentStep.value === 1) {
        // 检查至少有一个非空域名
        return m.domains.some((d: string | null | undefined) => 
            d && typeof d === 'string' && d.trim().length > 0
        );
    }
    if (currentStep.value === 2) return !!m.provider;
    if (currentStep.value === 3) return !!m.challengeType;
    return false;
});

const nextStep = async () => {
    if (currentStep.value < 3) {
        currentStep.value++;
    } else {
        await formRef.value?.validate();
        emit('submit');
    }
};

const prevStep = () => {
    currentStep.value--;
};
</script>

<style scoped>
.modal-card {
    width: 100%;
    max-width: 740px;
    margin: 0 auto;
}

.header {
    margin-bottom: 12px;
}

.title {
    font-size: 20px;
    font-weight: 600;
}

.subtitle {
    font-size: 13px;
    color: var(--n-text-color-3);
}

.steps-wrapper {
    margin-bottom: 24px;
    width: 100%;
}

/* 确保Steps组件对称显示 */
.steps-wrapper :deep(.n-steps) {
    width: 100%;
    justify-content: space-between;
}

.steps-wrapper :deep(.n-step) {
    flex: 1;
    min-width: 0;
}

.steps-wrapper :deep(.n-step__title) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.select-card {
    cursor: pointer;
    border: 1px solid var(--n-border-color);
    transition: all 0.2s ease;
}

.select-card:hover {
    border-color: var(--n-primary-color);
}

.select-card.active {
    border-color: var(--n-primary-color);
    background-color: var(--n-primary-color-hover);
}

.select-card.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.card-title {
    font-weight: 500;
}

.card-desc {
    margin-top: 6px;
    font-size: 12px;
    color: var(--n-text-color-3);
}

.footer {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    gap: 12px;
}

/* 手机端适配 */
@media (max-width: 640px) {
    .modal-card {
        max-width: 100%;
        margin: 16px;
    }

    .title {
        font-size: 18px;
    }

    .subtitle {
        font-size: 12px;
    }

    .steps-wrapper {
        margin-bottom: 20px;
    }

    /* 手机端Steps垂直显示时的样式 */
    .steps-wrapper :deep(.n-steps--vertical) {
        padding-left: 0;
    }

    .steps-wrapper :deep(.n-step) {
        padding-left: 24px;
    }

    .footer {
        flex-direction: column-reverse;
    }

    .footer .n-button {
        width: 100%;
    }
}

/* 平板端适配 */
@media (min-width: 641px) and (max-width: 1024px) {
    .modal-card {
        max-width: 90%;
    }
}
</style>
