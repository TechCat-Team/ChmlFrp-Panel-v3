<template>
    <n-modal v-model:show="showModel" preset="dialog" title="编辑节点" style="width: 800px">
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
                    <n-form-item label="节点IP" path="ip">
                        <n-input v-model:value="form.ip" placeholder="请输入节点IP地址" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="真实IP" path="real_IP">
                        <n-input v-model:value="form.real_IP" placeholder="真实IP地址" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="TCP 端口" path="port">
                        <n-input-number v-model:value="form.port" :min="1" :max="65535" />
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
                        <n-input-number v-model:value="form.adminport" :min="1" :max="65535" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="速度" path="speed">
                        <n-input v-model:value="form.speed" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="区域" path="area">
                        <n-input v-model:value="form.area" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="节点组" path="nodegroup">
                        <n-select v-model:value="form.nodegroup" :options="NODEGROUP_OPTIONS" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="是否国内" path="china">
                        <n-select v-model:value="form.china" :options="BOOLEAN_OPTIONS" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="支持Web" path="web">
                        <n-select v-model:value="form.web" :options="BOOLEAN_OPTIONS" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="支持UDP" path="udp">
                        <n-select v-model:value="form.udp" :options="BOOLEAN_OPTIONS" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="防御" path="fangyu">
                        <n-select v-model:value="form.fangyu" :options="BOOLEAN_OPTIONS" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="远程端口范围" path="rport">
                        <n-input v-model:value="form.rport" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="用户名" path="auth_username">
                        <n-input v-model:value="form.auth_username" placeholder="请输入用户名" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="密码" path="auth_password">
                        <n-input
                            v-model:value="form.auth_password"
                            type="password"
                            show-password-on="click"
                            placeholder="请输入密码"
                        />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="IPv6" path="ipv6">
                        <n-input v-model:value="form.ipv6" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="节点Token" path="nodetoken">
                        <n-input v-model:value="form.nodetoken" />
                    </n-form-item>
                </n-col>
                <n-col :span="12">
                    <n-form-item label="API Token" path="apitoken">
                        <n-input v-model:value="form.apitoken" />
                    </n-form-item>
                </n-col>
                <n-col :span="24">
                    <n-form-item label="坐标" path="coordinates">
                        <n-input v-model:value="form.coordinates" placeholder="经度,纬度" />
                    </n-form-item>
                </n-col>
                <n-col :span="24">
                    <n-form-item label="备注" path="notes">
                        <n-input v-model:value="form.notes" type="textarea" />
                    </n-form-item>
                </n-col>
            </n-row>
        </n-form>
        <template #action>
            <n-space>
                <n-button @click="showModel = false">取消</n-button>
                <n-button type="primary" :loading="loading" @click="handleSubmit">确认修改</n-button>
            </n-space>
        </template>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import { BOOLEAN_OPTIONS, NODEGROUP_OPTIONS } from '../constants';
import type { EditForm, Node, UpdateNodePayload } from '../types';

const props = defineProps<{
    show: boolean;
    node: Node | null;
    loading?: boolean;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    submit: [payload: UpdateNodePayload];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const formRef = ref<FormInst | null>(null);

const form = reactive<EditForm>({
    name: '',
    ip: '',
    real_IP: '',
    port: null,
    quic_port: null,
    adminport: null,
    speed: '',
    area: '',
    nodegroup: '',
    china: '',
    web: '',
    udp: '',
    fangyu: '',
    notes: '',
    rport: '',
    auth: '',
    auth_username: '',
    auth_password: '',
    nodetoken: '',
    apitoken: '',
    coordinates: '',
    ipv6: '',
});

const rules: FormRules = {
    name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
    ip: [{ required: true, message: '请输入节点IP', trigger: 'blur' }],
};

// 用节点数据填充编辑表单
const fillForm = (node: Node) => {
    form.name = node.name;
    form.ip = node.ip;
    form.real_IP = node.realIp;
    form.port = node.port;
    form.quic_port = node.quicPort ?? null;
    form.adminport = parseInt(node.adminPort);
    form.speed = node.speed;
    form.area = node.area;
    form.nodegroup = node.nodegroup;
    // 兼容构思数据库
    form.china = node.china === 'yes' || node.china === 'true' ? 'true' : 'false';
    form.web = node.web === 'yes' || node.web === 'true' ? 'true' : 'false';
    form.udp = node.udp;
    form.fangyu = node.fangyu;
    form.notes = node.notes;
    form.rport = node.rport;
    form.auth = node.auth;

    // 解码Base64的auth为用户名和密码
    try {
        const decodedAuth = atob(node.auth);
        const [username, password] = decodedAuth.split(':');
        form.auth_username = username || '';
        form.auth_password = password || '';
    } catch (error) {
        form.auth_username = '';
        form.auth_password = '';
    }

    form.nodetoken = node.nodetoken;
    form.apitoken = node.apitoken;
    form.coordinates = node.coordinates;
    form.ipv6 = node.ipv6;
};

// 每次打开时回填当前节点数据
watch(
    () => props.show,
    (visible) => {
        if (visible && props.node) fillForm(props.node);
    }
);

const handleSubmit = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();
    } catch {
        return; // 表单验证未通过
    }

    // 将用户名和密码转换为Base64编码的auth
    const auth = btoa(`${form.auth_username}:${form.auth_password}`);

    emit('submit', {
        name: form.name,
        ip: form.ip,
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
        nodetoken: form.nodetoken,
        apitoken: form.apitoken,
        coordinates: form.coordinates,
        ipv6: form.ipv6,
    });
};
</script>
