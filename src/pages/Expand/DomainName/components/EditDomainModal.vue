<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 600px" size="small" title="修改解析">
            <n-form
                style="margin-top: 10px"
                :model="model"
                ref="formRef"
                label-placement="left"
                label-width="auto"
                require-mark-placement="right-hanging"
                :size="size"
                :rules="rules"
            >
                <n-grid cols="1 s:2" x-gap="12" responsive="screen">
                    <n-grid-item>
                        <n-form-item label="域名" path="selectedDomain" :required="true" required-message="请选择域名">
                            <n-select
                                placeholder="请选择域名"
                                disabled
                                :options="domainNameOptions"
                                :value="model.selectedDomain"
                                @update:value="$emit('update:model', { ...model, selectedDomain: $event })"
                            />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="类型" :required="true" required-message="请选择记录类型">
                            <n-select
                                placeholder="请选择记录类型"
                                disabled
                                :options="recordTypeOptions"
                                :value="model.selectedRecordType"
                                @update:value="$emit('update:model', { ...model, selectedRecordType: $event })"
                            />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="记录" :required="true" required-message="请输入记录">
                            <n-input
                                :value="model.recordValue"
                                @update:value="$emit('update:model', { ...model, recordValue: $event })"
                                disabled
                                placeholder="请输入记录"
                            >
                                <template #suffix v-if="model.selectedRecordType !== 'SRV'">
                                    .{{ model.selectedDomain }}
                                </template>
                            </n-input>
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="TTL" :required="true" required-message="请选择TTL">
                            <n-select
                                placeholder="请选择TTL"
                                :value="model.TTLValue"
                                @update:value="$emit('update:model', { ...model, TTLValue: $event })"
                                :options="ttlOptions"
                            />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item :span="2">
                        <n-form-item label="目标" :required="true" required-message="请输入目标">
                            <n-input
                                :value="model.target"
                                @update:value="$emit('update:model', { ...model, target: $event })"
                                :placeholder="targetPlaceholder"
                            />
                        </n-form-item>
                    </n-grid-item>
                </n-grid>
                <div style="display: flex; justify-content: flex-end">
                    <n-button
                        round
                        type="primary"
                        :loading="loading"
                        @click="$emit('submit')"
                        :disabled="
                            !model.selectedDomain ||
                            !model.selectedRecordType ||
                            !model.recordValue ||
                            !model.TTLValue ||
                            !model.target
                        "
                    >
                        确定
                    </n-button>
                </div>
            </n-form>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import type { DomainFormModel } from '../types';
import { FORM_RULES } from '../constants';

interface Props {
    show: boolean;
    model: DomainFormModel;
    domainNameOptions: Array<{ label: string; value: string }>;
    recordTypeOptions: Array<{ label: string; value: string }>;
    ttlOptions: Array<{ label: string; value: string }>;
    targetPlaceholder: string;
    loading: boolean;
    size: string;
}

defineProps<Props>();

const rules = FORM_RULES;

defineEmits<{
    'update:show': [value: boolean];
    'update:model': [value: DomainFormModel];
    submit: [];
}>();
</script>

