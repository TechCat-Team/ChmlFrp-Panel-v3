<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 800px" :title="title" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-alert title="注意" type="info" style="margin-bottom: 8px" v-if="
                formData.domainNameLabel === '自定义' &&
                (formData.type === 'HTTP' || formData.type === 'HTTPS') &&
                nodeInfo.china !== 'no'
            ">
                自定义域名解析到中国境内节点(中国特别行政区除外)建站，您的域名必须在工信部备案，不备案将被拦截导致无法访问。
            </n-alert>
            <n-alert title="注意" type="info" style="margin-bottom: 8px" v-if="
                (formData.type === 'TCP') &&
                nodeInfo.china !== 'no'
            ">
                中国境内节点禁止使用TCP隧道建站，如果您是用于网站用途，请使用中国境外节点或解析自己的已备案域名至{{ nodeInfo.ip }}，通过 您解析的域名:外网端口 访问
            </n-alert>
            <n-alert title="注意" style="margin-bottom: 32px" type="warning"
                v-if="formData.domainNameLabel === '自定义' && (formData.type === 'HTTP' || formData.type === 'HTTPS')">
                请使用自定义域名需要将您的 {{ formData.domain }} 域名通过CNAME解析至 {{ nodeInfo.ip }} 才能正常访问。
            </n-alert>
            <n-alert title="注意" type="info" style="margin-bottom: 32px" v-if="isEdit &&
                formData.domainNameLabel === '免费域名' && (formData.type === 'HTTP' || formData.type === 'HTTPS')
            ">
                免费域名禁止用于中国境内节点(中国特别行政区除外)建站，如果您给国内节点解析免费域名并建站，会被备案拦截导致无法访问。此外，更改节点后免费域名解析会自动更改。
            </n-alert>
            <n-row :gutter="15" style="margin-top: 15px">
                <n-form ref="tunnelForm" :model="formData" size="medium" label-width="100px">
                    <n-col :span="12">
                        <n-form-item label="隧道名称" path="name">
                            <n-input v-model:value="formData.name" placeholder="请输入隧道名称" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="本地IP" path="localip">
                            <n-input v-model:value="formData.localip" placeholder="请输入本地IP" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点选择" path="node" @click="isEdit ? undefined : $emit('select-node')">
                            <n-select v-model:value="formData.node" :options="nodeOptions" placeholder="请选择节点"
                                @update:value="$emit('node-change', $event)" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item v-if="formData.type === 'TCP' || formData.type === 'UDP'" label="端口类型" path="type">
                            <n-select v-model:value="formData.type" :options="typeOptionsTCPUDP" placeholder="请选择端口类型"
                                clearable @update:value="$emit('type-change', $event)" />
                        </n-form-item>
                        <n-form-item v-else label="端口类型" path="type">
                            <n-select v-model:value="formData.type" :options="isEdit ? typeOptionsHTTPHTTPS : typeOptions"
                                placeholder="请选择端口类型" clearable @update:value="$emit('type-change', $event)" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="内网端口" path="nport">
                            <n-input 
                                v-model:value="formData.nport" 
                                clearable 
                                placeholder="请输入内网端口"
                                :maxlength="5"
                                @keypress="handlePortKeypress"
                                @update:value="handleNportInput"
                                @blur="handleNportBlur"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item v-if="formData.type === 'HTTP' || formData.type === 'HTTPS'" label="域名类型"
                            path="domainNameLabel">
                            <n-select :disabled="isEdit" v-model:value="formData.domainNameLabel" :options="domainTypeOptions"
                                placeholder="请选择域名类型" @update:value="$emit('domain-type-change', $event)" />
                        </n-form-item>
                        <n-form-item v-else label="外网端口" path="dorp">
                            <n-input 
                                v-model:value="formData.dorp" 
                                clearable 
                                :maxlength="5"
                                :placeholder="getDorpPlaceholder()"
                                @keypress="handlePortKeypress"
                                @update:value="handleDorpInput"
                                @blur="handleDorpBlur"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="24" v-if="
                        formData.domainNameLabel === '自定义' &&
                        (formData.type === 'HTTP' || formData.type === 'HTTPS')
                    ">
                        <n-form-item label="域名" path="dorp">
                            <n-input v-model:value="formData.domain" placeholder="请输入您的域名" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col v-if="
                        formData.domainNameLabel === '免费域名' &&
                        (formData.type === 'HTTP' || formData.type === 'HTTPS')
                    " :span="12">
                        <n-form-item :label="isEdit ? '免费域名选择' : '请选择免费域名'" path="choose">
                            <n-select v-model:value="formData.choose" :options="domainNameOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col v-if="
                        formData.domainNameLabel === '免费域名' &&
                        (formData.type === 'HTTP' || formData.type === 'HTTPS')
                    " :span="12">
                        <n-form-item :label="isEdit ? '域名前缀' : '新建域名'" path="dorp">
                            <n-input v-model:value="formData.recordValue" placeholder="请输入域名前缀">
                                <template #suffix> .{{ formData.choose }} </template>
                            </n-input>
                        </n-form-item>
                    </n-col>
                    <n-collapse style="margin-top: 10px">
                        <n-collapse-item title="高级设置">
                            <n-alert type="info" style="margin-bottom: 16px">
                                {{ isEdit ? '不懂请不要设置，否则可能会导致无法启动隧道' : '不懂请不要设置，否则可能会导致无法使用隧道' }}
                            </n-alert>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据加密</n-p>
                                    <n-switch v-model:value="formData.encryption" />
                                </n-flex>
                            </n-col>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据压缩</n-p>
                                    <n-switch v-model:value="formData.compression" />
                                </n-flex>
                            </n-col>
                            <n-form-item label="额外参数" path="ap" style="margin-top: 8px">
                                <n-input v-model:value="formData.ap" type="textarea" />
                            </n-form-item>
                        </n-collapse-item>
                    </n-collapse>
                </n-form>
            </n-row>
            <template #footer>
                <n-flex justify="end">
                    <n-button v-if="formData.type === 'TCP' || formData.type === 'UDP'"
                        @click="$emit('random-port')">随机外网端口</n-button>
                    <n-button @click="$emit('random-name')">随机隧道名</n-button>
                    <n-button @click="$emit('cancel')">取消</n-button>
                    <n-button v-if="!isEdit" @click="$emit('back')">上一步</n-button>
                    <n-button type="primary" @click="$emit('submit')" :loading="loading">确定</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { useMessage } from 'naive-ui';
import type { TunnelFormData, NodeInfo } from '../types';

interface Props {
    show: boolean;
    title: string;
    isEdit: boolean;
    formData: TunnelFormData;
    nodeInfo: NodeInfo;
    nodeOptions: { label: string; value: string }[];
    typeOptions: { label: string; value: string }[];
    typeOptionsTCPUDP: { label: string; value: string; disabled?: boolean }[];
    typeOptionsHTTPHTTPS: { label: string; value: string; disabled?: boolean }[];
    domainTypeOptions: { label: string; value: string }[];
    domainNameOptions: { label: string; value: string }[];
    loading: boolean;
}

const props = defineProps<Props>();
const message = useMessage();

// 限制端口输入只能输入数字
const handlePortKeypress = (e: KeyboardEvent) => {
    // 允许：数字、退格、删除、Tab、方向键等
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(e.key)) {
        return;
    }
    // 只允许数字
    if (!/^\d$/.test(e.key)) {
        e.preventDefault();
    }
};

// 获取节点的外网端口范围
const getNodePortRange = (): { min: number; max: number } | null => {
    if (!props.nodeInfo || !props.nodeInfo.rport) {
        return null;
    }
    const rportStr = String(props.nodeInfo.rport);
    const portRange = rportStr.split('-');
    if (portRange.length !== 2) {
        return null;
    }
    const minPort = parseInt(portRange[0]) || 1;
    const maxPort = parseInt(portRange[1]) || 65535;
    return { min: minPort, max: maxPort };
};

// 获取外网端口的 placeholder 提示
const getDorpPlaceholder = (): string => {
    const portRange = getNodePortRange();
    if (portRange) {
        return `请输入外网端口 (${portRange.min}-${portRange.max})`;
    }
    return '请输入外网端口 (1-65535)';
};

// 验证并限制内网端口范围（1-65535）
const validateNport = (value: string): string => {
    if (!value || value === '') {
        return '';
    }
    // 移除所有非数字字符
    let numStr = value.replace(/\D/g, '');
    if (!numStr) {
        return '';
    }
    // 转换为数字并限制范围
    let num = parseInt(numStr, 10);
    if (isNaN(num)) {
        return '';
    }
    // 限制在1-65535之间
    if (num < 1) {
        num = 1;
    } else if (num > 65535) {
        num = 65535;
    }
    return String(num);
};

// 验证并限制外网端口范围（根据节点限制）
const validateDorp = (value: string): string => {
    if (!value || value === '') {
        return '';
    }
    // 移除所有非数字字符
    let numStr = value.replace(/\D/g, '');
    if (!numStr) {
        return '';
    }
    // 转换为数字
    let num = parseInt(numStr, 10);
    if (isNaN(num)) {
        return '';
    }
    
    // 获取节点的端口范围
    const portRange = getNodePortRange();
    if (portRange) {
        // 根据节点限制调整范围
        if (num < portRange.min) {
            num = portRange.min;
        } else if (num > portRange.max) {
            num = portRange.max;
        }
    } else {
        // 如果没有节点信息，使用默认范围 1-65535
        if (num < 1) {
            num = 1;
        } else if (num > 65535) {
            num = 65535;
        }
    }
    return String(num);
};

// 处理内网端口输入（只允许数字，不验证范围）
const handleNportInput = (value: string) => {
    // 只移除非数字字符，不验证范围
    const numStr = value.replace(/\D/g, '');
    props.formData.nport = numStr;
};

// 处理内网端口失去焦点（验证并修正范围）
const handleNportBlur = () => {
    const validatedValue = validateNport(props.formData.nport);
    if (validatedValue !== props.formData.nport && props.formData.nport) {
        props.formData.nport = validatedValue;
        message.warning('端口范围必须在 1-65535 之间');
    }
};

// 处理外网端口输入（只允许数字，不验证范围）
const handleDorpInput = (value: string) => {
    // 只移除非数字字符，不验证范围
    const numStr = value.replace(/\D/g, '');
    props.formData.dorp = numStr;
    // 输入过程中不触发 port-change 事件，避免实时弹出提示
};

// 处理外网端口失去焦点（验证并修正范围）
const handleDorpBlur = () => {
    const validatedValue = validateDorp(props.formData.dorp);
    if (validatedValue !== props.formData.dorp && props.formData.dorp) {
        props.formData.dorp = validatedValue;
        const portRange = getNodePortRange();
        if (portRange) {
            message.warning(`外网端口范围必须在 ${portRange.min}-${portRange.max} 之间`);
        } else {
            message.warning('端口范围必须在 1-65535 之间');
        }
    }
    // 失去焦点后触发 port-change 事件，用于检查端口合规性
    emit('port-change', props.formData.dorp ? Number(props.formData.dorp) : undefined);
};

const emit = defineEmits<{
    'update:show': [value: boolean];
    'select-node': [];
    'node-change': [value: string];
    'type-change': [value: string];
    'domain-type-change': [value: string];
    'port-change': [value: number | undefined];
    'random-port': [];
    'random-name': [];
    cancel: [];
    back: [];
    submit: [];
}>();
</script>

