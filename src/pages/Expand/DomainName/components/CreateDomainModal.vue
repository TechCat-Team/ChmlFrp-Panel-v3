<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 600px" size="small" :bordered="false" role="dialog" aria-modal="true">
            <n-tabs type="line" size="large" @update:value="$emit('tab-change', $event)">
                <n-tab-pane name="自定义解析">
                    <n-form style="margin-top: 10px" ref="formRef" :model="model" :rules="rules">
                        <n-grid cols="1 s:2" x-gap="12" responsive="screen">
                            <n-grid-item>
                                <n-form-item
                                    label="域名"
                                    path="selectedDomain"
                                    :required="true"
                                    required-message="请选择域名"
                                >
                                    <n-select
                                        placeholder="请选择域名"
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
                </n-tab-pane>
                <n-tab-pane name="快速解析">
                    <n-alert title="注意" type="info" v-if="fastModel.selectedRecordType === 'CNAME'">
                        {{ cnameWarning }}
                    </n-alert>
                    <n-form
                        style="margin-top: 10px"
                        :model="fastModel"
                        ref="formRefFast"
                        label-placement="left"
                        label-width="auto"
                        require-mark-placement="right-hanging"
                        :size="size"
                        :rules="fastRules"
                    >
                        <n-grid cols="1 s:2" x-gap="12" responsive="screen">
                            <n-grid-item>
                                <n-form-item
                                    label="域名"
                                    path="selectedDomain"
                                    :required="true"
                                    required-message="请选择域名"
                                >
                                    <n-select
                                        placeholder="请选择域名"
                                        :options="domainNameOptions"
                                        :value="fastModel.selectedDomain"
                                        @update:value="$emit('update:fast-model', { ...fastModel, selectedDomain: $event })"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="类型" :required="true" required-message="请选择记录类型">
                                    <n-select
                                        placeholder="请选择记录类型"
                                        :options="fastRecordTypeOptions"
                                        :value="fastModel.selectedRecordType"
                                        @update:value="$emit('update:fast-model', { ...fastModel, selectedRecordType: $event })"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="记录" :required="true" required-message="请输入记录">
                                    <n-input
                                        :value="fastModel.recordValue"
                                        @update:value="$emit('update:fast-model', { ...fastModel, recordValue: $event })"
                                        placeholder="请输入记录"
                                    >
                                        <template #suffix> .{{ fastModel.selectedDomain }} </template>
                                    </n-input>
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="隧道" :required="true" required-message="请选择隧道">
                                    <n-skeleton
                                        v-if="loadingTunnel"
                                        height="34px"
                                        width="100%"
                                        style="border-radius: 3px"
                                    />
                                    <n-select
                                        v-else
                                        placeholder="请选择隧道"
                                        :options="tunnelOptions"
                                        :value="fastModel.selectedTunnel"
                                        @update:value="$emit('update:fast-model', { ...fastModel, selectedTunnel: $event })"
                                    />
                                </n-form-item>
                            </n-grid-item>
                        </n-grid>
                        <div style="display: flex; justify-content: flex-end">
                            <n-button
                                round
                                type="primary"
                                :loading="loading"
                                @click="$emit('fast-submit')"
                                :disabled="
                                    !fastModel.selectedDomain ||
                                    !fastModel.selectedRecordType ||
                                    !fastModel.recordValue ||
                                    !fastModel.selectedTunnel
                                "
                            >
                                确定
                            </n-button>
                        </div>
                    </n-form>
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import type { DomainFormModel, FastDomainFormModel } from '../types';
import { FORM_RULES, FAST_FORM_RULES } from '../constants';

interface Props {
    show: boolean;
    model: DomainFormModel;
    fastModel: FastDomainFormModel;
    domainNameOptions: Array<{ label: string; value: string }>;
    recordTypeOptions: Array<{ label: string; value: string }>;
    fastRecordTypeOptions: Array<{ label: string; value: string }>;
    ttlOptions: Array<{ label: string; value: string }>;
    tunnelOptions: Array<{ label: string; value: string; ip: string; dorp: string; name: string; node: string }>;
    targetPlaceholder: string;
    loading: boolean;
    loadingTunnel: boolean;
    size: string;
    cnameWarning: string;
}

defineProps<Props>();

const rules = FORM_RULES;
const fastRules = FAST_FORM_RULES;

defineEmits<{
    'update:show': [value: boolean];
    'update:model': [value: DomainFormModel];
    'update:fast-model': [value: FastDomainFormModel];
    'tab-change': [value: string];
    submit: [];
    'fast-submit': [];
}>();
</script>

