<template>
    <n-modal v-model:show="showModel" preset="dialog" title="新增节点" style="width: 800px">
        <n-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-placement="left"
            label-width="120px"
            require-mark-placement="right-hanging"
        >
            <n-row :gutter="[16, 16]">
                <n-col :span="12">
                    <n-form-item label="节点名称" path="name">
                        <n-input v-model:value="form.name" placeholder="请输入节点名称" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="真实IP" path="real_IP">
                        <n-input v-model:value="form.real_IP" placeholder="请输入真实IP地址" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="域名前缀" path="domain_prefix">
                        <n-input v-model:value="form.domain_prefix" placeholder="只能包含小写字母、数字和短横线" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="TCP 端口" path="port">
                        <n-input-number v-model:value="form.port" :min="1" :max="65535" placeholder="默认7000" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="QUIC 端口" path="quic_port">
                        <n-input-number
                            v-model:value="form.quic_port"
                            :min="1"
                            :max="65535"
                            :precision="0"
                            clearable
                            placeholder="留空禁用 QUIC"
                        />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="管理端口" path="adminport">
                        <n-input-number v-model:value="form.adminport" :min="1" :max="65535" placeholder="默认8233" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="速度" path="speed">
                        <n-input v-model:value="form.speed" placeholder="默认100" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="区域" path="area">
                        <n-input v-model:value="form.area" placeholder="默认未知" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="节点组" path="nodegroup">
                        <n-select v-model:value="form.nodegroup" :options="NODEGROUP_OPTIONS" placeholder="默认user" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="是否国内" path="china">
                        <n-select v-model:value="form.china" :options="BOOLEAN_OPTIONS" placeholder="默认是" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="支持Web" path="web">
                        <n-select v-model:value="form.web" :options="BOOLEAN_OPTIONS" placeholder="默认是" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="支持UDP" path="udp">
                        <n-select v-model:value="form.udp" :options="BOOLEAN_OPTIONS" placeholder="默认是" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="防御" path="fangyu">
                        <n-select v-model:value="form.fangyu" :options="BOOLEAN_OPTIONS" placeholder="默认否" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="远程端口范围" path="rport">
                        <n-input v-model:value="form.rport" placeholder="默认10000-50000" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="用户名" path="auth_username">
                        <n-input-group>
                            <n-input v-model:value="form.auth_username" placeholder="自动生成" />
                            <n-button @click="generateRandomUsername">
                                <template #icon>
                                    <n-icon><RefreshIcon /></n-icon>
                                </template>
                            </n-button>
                        </n-input-group>
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="密码" path="auth_password">
                        <n-input-group>
                            <n-input
                                v-model:value="form.auth_password"
                                type="password"
                                show-password-on="click"
                                placeholder="自动生成"
                            />
                            <n-button @click="generateRandomPassword">
                                <template #icon>
                                    <n-icon><RefreshIcon /></n-icon>
                                </template>
                            </n-button>
                        </n-input-group>
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="IPv6" path="ipv6">
                        <n-input v-model:value="form.ipv6" placeholder="IPv6地址" />
                    </n-form-item>
                </n-col>
                <n-col :span="24">
                    <n-form-item label="备注" path="notes">
                        <n-input v-model:value="form.notes" type="textarea" placeholder="节点备注信息" />
                    </n-form-item>
                </n-col>
            </n-row>
        </n-form>
        <template #action>
            <n-space>
                <n-button @click="showModel = false">取消</n-button>
                <n-button type="primary" :loading="loading" @click="handleSubmit">确认创建</n-button>
            </n-space>
        </template>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { NIcon } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { Refresh as RefreshIcon } from '@vicons/ionicons5';
import { BOOLEAN_OPTIONS, NODEGROUP_OPTIONS } from '../constants';
import type { CreateForm, CreateNodePayload } from '../types';

const props = defineProps<{
    show: boolean;
    loading?: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    submit: [payload: CreateNodePayload];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const formRef = ref<FormInst | null>(null);

// 创建表单默认值
const createDefaultForm = (): CreateForm => ({
    name: '',
    domain_prefix: '',
    real_IP: '',
    port: 7000,
    quic_port: null,
    adminport: 8233,
    speed: '',
    area: '',
    nodegroup: 'user',
    china: 'true',
    web: 'true',
    udp: 'true',
    fangyu: 'true',
    notes: '',
    rport: '10000-65535',
    auth_username: '',
    auth_password: '',
    ipv6: 'null',
});

const form = reactive<CreateForm>(createDefaultForm());

const rules: FormRules = {
    name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
    real_IP: [{ required: true, message: '请输入真实IP', trigger: 'blur' }],
    domain_prefix: [
        { required: true, message: '请输入域名前缀', trigger: 'blur' },
        { pattern: /^[a-z0-9-.]+$/, message: '域名前缀只能包含小写字母、数字和短横线、点', trigger: 'blur' },
    ],
};

// 生成随机字符串（仅大小写字母 + 数字）
const generateRandomString = (length: number): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// 生成随机用户名
const generateRandomUsername = () => {
    form.auth_username = 'user_' + generateRandomString(8);
};

// 生成随机密码
const generateRandomPassword = () => {
    form.auth_password = generateRandomString(16);
};

// 重置创建表单，并自动生成用户名和密码
const resetForm = () => {
    Object.assign(form, createDefaultForm());
    generateRandomUsername();
    generateRandomPassword();
};

// 每次打开时重置表单
watch(
    () => props.show,
    (visible) => {
        if (visible) resetForm();
    },
    { immediate: true }
);

const handleSubmit = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();
    } catch {
        return; // 表单验证未通过
    }

    // 将用户名和密码转换为 Base64 编码的 auth
    const auth = btoa(`${form.auth_username}:${form.auth_password}`);

    emit('submit', {
        name: form.name,
        domain_prefix: form.domain_prefix,
        real_IP: form.real_IP,
        port: form.port,
        quic_port: form.quic_port,
        adminport: form.adminport,
        speed: form.speed,
        area: form.area,
        nodegroup: form.nodegroup,
        china: form.china === 'true' ? 'yes' : 'no',
        web: form.web === 'true' ? 'yes' : 'no',
        udp: form.udp,
        fangyu: form.fangyu,
        notes: form.notes,
        rport: form.rport,
        auth,
        ipv6: form.ipv6,
    });
};
</script>
