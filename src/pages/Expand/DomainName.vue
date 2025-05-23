<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px" title="域名列表">
        <template #header-extra>
            <n-button round quaternary @click="fetchDomainData" :loading="loading">
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="createDomainName" :loading="createDomainNameLoading" type="primary" round quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                新增域名
            </n-button>
        </template>
    </n-card>
    <n-grid v-if="loading" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="190.6px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="24" :y-gap="24" responsive="screen" class="domain-grid">
        <n-grid-item v-for="(domain, index) in domainData" :key="domain.id" class="grid-item">
            <n-dropdown
                trigger="click"
                :overlap="true"
                placement="bottom-end"
                :show-arrow="false"
                :options="generateOptions(domain, index)"
                class="custom-dropdown"
            >
                <n-spin
                    :show="domainLoading[index]"
                    :description="domainLoading[index] ? '加载中...' : null"
                    class="full-height-spin"
                >
                    <n-card
                        size="small"
                        :title="cleanRecord(domain.record) + '.' + domain.domain"
                        :segmented="{ content: true, footer: 'soft' }"
                        header-style="padding: 16px;"
                        footer-style="padding: 12px 16px;"
                        class="custom-card"
                    >
                        <template #header-extra>
                            <n-tooltip
                                v-if="domain.type === 'SRV' && isSpecialRecord(domain.record)"
                                trigger="hover"
                                placement="top"
                            >
                                <template #trigger>
                                    <n-tag round :bordered="false" type="primary" size="small" class="type-tag">
                                        {{ domain.type }}
                                        <n-icon :component="InformationCircleOutline" size="14" class="ml-1" />
                                    </n-tag>
                                </template>
                                {{ getTooltipMessage(domain.record, domain.domain) }}
                            </n-tooltip>
                            <n-tag v-else round :bordered="false" type="primary" size="small" class="type-tag">
                                {{ domain.type }}
                            </n-tag>
                        </template>

                        <n-tag round :bordered="false" type="primary" size="small">
                            {{ domain.remarks || '未命名服务' }}
                        </n-tag>

                        <template #footer>
                            <div class="footer-content">
                                <div class="footer-item">
                                    <span class="item-label">记录名</span>
                                    <n-text depth="3">{{ domain.record }}</n-text>
                                </div>
                                <div class="footer-item">
                                    <span class="item-label">域名</span>
                                    <n-text depth="3">{{ domain.domain }}</n-text>
                                </div>
                                <div class="footer-item">
                                    <span class="item-label">目标地址</span>
                                    <n-text code>{{ domain.target }}</n-text>
                                </div>
                                <div class="footer-item">
                                    <span class="item-label">TTL</span>
                                    <n-text strong>{{ domain.ttl }}</n-text>
                                </div>
                            </div>
                        </template>
                    </n-card>
                </n-spin>
            </n-dropdown>
        </n-grid-item>
    </n-grid>
    <n-card v-if="!loading && domainData.length === 0">
        <n-empty description="您似乎还没创建免费域名">
            <template #extra>
                <n-button
                    size="small"
                    :loading="createDomainNameLoading"
                    @click="createDomainName"
                    :disabled="createDomainNameLoading"
                >
                    <template #icon>
                        <n-icon v-if="!createDomainNameLoading" :component="AddOutline" />
                    </template>
                    创建免费域名
                </n-button>
            </template>
        </n-empty>
    </n-card>
    <n-modal v-model:show="createDomainNameModal">
        <n-card style="width: 600px" size="small" :bordered="false" role="dialog" aria-modal="true">
            <n-tabs type="line" size="large" @update:value="handleTabChange">
                <n-tab-pane name="自定义解析">
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
                                <n-form-item
                                    label="域名"
                                    path="selectValue"
                                    :required="true"
                                    required-message="请选择域名"
                                >
                                    <n-select
                                        placeholder="请选择域名"
                                        :options="domainNameOptions"
                                        v-model:value="model.selectedDomain"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="类型" :required="true" required-message="请选择记录类型">
                                    <n-select
                                        placeholder="请选择记录类型"
                                        :options="recordTypeOptions"
                                        v-model:value="model.selectedRecordType"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="记录" :required="true" required-message="请输入记录">
                                    <n-input v-model:value="model.recordValue">
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
                                        v-model:value="model.TTLValue"
                                        :options="TTLOptions"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item :span="2">
                                <n-form-item label="目标" :required="true" required-message="请输入目标">
                                    <n-input v-model:value="model.target" :placeholder="targetPlaceholder" />
                                </n-form-item>
                            </n-grid-item>
                        </n-grid>
                        <div style="display: flex; justify-content: flex-end">
                            <n-button
                                round
                                type="primary"
                                :loading="determineLoading"
                                @click="handleSubmit"
                                :disabled="model.target === null"
                            >
                                确定
                            </n-button>
                        </div>
                    </n-form>
                </n-tab-pane>
                <n-tab-pane name="快速解析">
                    <n-alert title="注意" type="info" v-if="fastModel.selectedRecordType === 'CNAME'">
                        免费域名无备案，如需在境内节点提供HTTP/HTTPS/其它法定范围内的公开服务，请使用您自行备案过的域名，免费域名无效
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
                        <n-grid :key="model.selectedRecordType" cols="1 s:2" x-gap="12" responsive="screen">
                            <n-grid-item>
                                <n-form-item
                                    label="域名"
                                    path="selectValue"
                                    :required="true"
                                    required-message="请选择域名"
                                >
                                    <n-select
                                        placeholder="请选择域名"
                                        :options="domainNameOptions"
                                        v-model:value="fastModel.selectedDomain"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="类型" :required="true" required-message="请选择记录类型">
                                    <n-select
                                        placeholder="请选择记录类型"
                                        :options="fastRecordTypeOptions"
                                        v-model:value="fastModel.selectedRecordType"
                                    />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="记录" :required="true" required-message="请输入记录">
                                    <n-input v-model:value="fastModel.recordValue">
                                        <template #suffix> .{{ fastModel.selectedDomain }} </template>
                                    </n-input>
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="隧道" :required="true" required-message="请选择隧道">
                                    <n-skeleton
                                        v-if="loadingSelectedTunnel"
                                        height="34px"
                                        width="100%"
                                        style="border-radius: 3px"
                                    />
                                    <n-select
                                        v-else
                                        placeholder="请选择隧道"
                                        :options="tunnelOptions"
                                        v-model:value="fastModel.selectedTunnel"
                                        @update:value="handleTunnelChange"
                                    />
                                </n-form-item>
                            </n-grid-item>
                        </n-grid>
                        <div style="display: flex; justify-content: flex-end">
                            <n-button round type="primary" :loading="determineLoading" @click="handleFastSubmit">
                                确定
                            </n-button>
                        </div>
                    </n-form>
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </n-modal>
    <n-modal v-model:show="resetDomainNameModal">
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
                        <n-form-item label="域名" path="selectValue" :required="true" required-message="请选择域名">
                            <n-select
                                placeholder="请选择域名"
                                disabled
                                :options="domainNameOptions"
                                v-model:value="model.selectedDomain"
                            />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="类型" :required="true" required-message="请选择记录类型">
                            <n-select
                                placeholder="请选择记录类型"
                                disabled
                                :options="recordTypeOptions"
                                v-model:value="model.selectedRecordType"
                            />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="记录" :required="true" required-message="请输入记录">
                            <n-input v-model:value="model.recordValue" disabled>
                                <template #suffix v-if="model.selectedRecordType !== 'SRV'">
                                    .{{ model.selectedDomain }}
                                </template>
                            </n-input>
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item>
                        <n-form-item label="TTL" :required="true" required-message="请选择TTL">
                            <n-select placeholder="请选择TTL" v-model:value="model.TTLValue" :options="TTLOptions" />
                        </n-form-item>
                    </n-grid-item>
                    <n-grid-item :span="2">
                        <n-form-item label="目标" :required="true" required-message="请输入目标">
                            <n-input v-model:value="model.target" :placeholder="targetPlaceholder" />
                        </n-form-item>
                    </n-grid-item>
                </n-grid>
                <div style="display: flex; justify-content: flex-end">
                    <n-button
                        round
                        type="primary"
                        :loading="determineLoading"
                        @click="resetDomainName"
                        :disabled="model.target === null"
                    >
                        确定
                    </n-button>
                </div>
            </n-form>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import {
    RefreshOutline,
    AddOutline,
    TrashOutline,
    CreateOutline,
    EyeOutline,
    InformationCircleOutline,
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
// 获取登录信息
import { useUserStore } from '@/stores/user';

import api from '@/api';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const message = useMessage();
const dialog = useDialog();

const determineLoading = ref(false);
const createDomainNameModal = ref(false);
const createDomainNameLoading = ref(false);
const resetDomainNameModal = ref(false);
const loading = ref(false);
const loadingSelectedTunnel = ref(false);

const size = ref('medium');

// 无限滚动
const count = ref(16);
const handleLoad = () => {
    count.value += 1;
};

const rules = {
    selectedDomain: { required: true, message: '请选择域名' },
    selectedRecordType: { required: true, message: '请选择记录类型' },
    recordValue: { required: true, message: '请输入记录', trigger: 'blur' },
    TTLValue: { required: true, message: '请选择TTL' },
    target: { required: true, message: '请输入目标' },
};

const fastRules = ref({
    selectedDomain: [{ required: true, message: '请选择域名' }],
    selectedRecordType: [{ required: true, message: '请选择记录类型' }],
    recordValue: [{ required: true, message: '请输入记录' }],
    selectedTunnel: [{ required: true, message: '请选择隧道' }],
});

interface freeDomain {
    id: number;
    userid: number;
    domain: string;
    record: string;
    type: string;
    target: string;
    remarks?: string;
    ttl: string;
}

const domainData = ref<freeDomain[]>([]);

const fetchDomainData = async () => {
    loading.value = true;
    try {
        const response = await api.v2.domain.getUserFreeSubdomains(userInfo?.usertoken || '');
        domainData.value = response.data;
    } catch (error) {
        message.error('获取创建的免费域名数据失败: ' + (error as Error).message);
    } finally {
        loading.value = false;
    }
};

// 在组件挂载时调用API
onMounted(() => {
    fetchDomainData();
});

const createDomainName = async () => {
    createDomainNameLoading.value = true;
    await subDomainData();
    createDomainNameModal.value = true;
    createDomainNameLoading.value = false;
};

const specialRecordMessages: Record<string, string> = {
    '_minecraft._tcp.': 'MCJava版服务器',
    '_xmpp-server._tcp.': 'XMPP (即时通讯) 服务',
    '_ark._udp.': 'ARK: Survival Evolved (方舟:生存进化) 服务',
    '_sip._tcp.': 'VoIP (SIP) 服务',
    '_ldap._tcp.': 'LDAP 目录服务',
    '_http._tcp.': 'HTTP 服务',
    '_caldav._tcp.': 'CalDAV 服务',
    '_imap._tcp.': 'IMAP 邮件服务',
    '_ftp._tcp.': 'FTP 服务',
    '_smtp._tcp.': 'SMTP 邮件服务',
    '_pop3._tcp.': 'POP3 邮件服务',
    '_nntp._tcp.': 'NNTP 新闻组服务',
    '_rsync._tcp.': 'rsync 文件同步服务',
    '_cstrike._tcp.': 'Counter-Strike 游戏服务器',
};

const isSpecialRecord = (record: string): boolean => {
    return Object.keys(specialRecordMessages).some((key) => record.includes(key));
};

const getTooltipMessage = (record: string, domain: string): string => {
    const cleanedRecord = cleanRecord(record);
    const message = Object.keys(specialRecordMessages).find((key) => record.includes(key));

    return message
        ? `此域名通过SRV解析隐藏了${specialRecordMessages[message]}端口，可直接通过${cleanedRecord + '.' + domain}连接`
        : '';
};

const cleanRecord = (record: string) => {
    const tcpIndex = record.indexOf('_tcp.');
    const udpIndex = record.indexOf('_udp.');

    let indexToRemove = -1;
    if (tcpIndex !== -1) {
        indexToRemove = tcpIndex + 5;
    } else if (udpIndex !== -1) {
        indexToRemove = udpIndex + 4;
    }

    if (indexToRemove !== -1) {
        return record.substring(indexToRemove);
    }

    return record;
};

const model = ref({
    selectedDomain: '',
    selectedRecordType: 'A',
    recordValue: '',
    TTLValue: '10分钟' as
        | '1分钟'
        | '2分钟'
        | '5分钟'
        | '10分钟'
        | '15分钟'
        | '30分钟'
        | '1小时'
        | '2小时'
        | '5小时'
        | '12小时'
        | '1天',
    target: '',
});

const fastModel = ref({
    selectedDomain: '',
    selectedRecordType: 'CNAME',
    selectedTunnel: null,
    recordValue: '',
});

interface Domain {
    id: number;
    domain: string;
    remarks: string | null;
    icpFiling: boolean;
}

// 用于存储域名选项的数据
const domainNameOptions = ref<{ label: string; value: string }[]>([]);

// 从 API 获取域名数据并将其格式化为 n-select 的选项格式
const subDomainData = async () => {
    try {
        const domains = (await api.v2.domain.listAvailableDomains()).data;

        domainNameOptions.value = domains.map((domain: Domain) => ({
            label: domain.domain, // 显示的域名名称
            value: domain.domain, // 选项的值
        }));
    } catch (error) {
        message.error('获取域名数据失败: ' + (error as Error).message);
    }
};

const recordTypeOptions = ['A', 'AAAA', 'CNAME', 'SRV'].map((v) => ({
    label: v,
    value: v,
}));

const fastRecordTypeOptions = ['CNAME', 'Java版MC'].map((v) => ({
    label: v,
    value: v,
}));

const TTLOptions = [
    '1分钟',
    '2分钟',
    '5分钟',
    '10分钟',
    '15分钟',
    '30分钟',
    '1小时',
    '2小时',
    '5小时',
    '12小时',
    '1天',
].map((v) => ({
    label: v,
    value: v,
}));

const targetPlaceholder = computed(() => {
    switch (model.value.selectedRecordType) {
        case 'A':
            return '请输入IPv4地址';
        case 'AAAA':
            return '请输入IPv6地址';
        case 'CNAME':
            return '请输入域名';
        case 'SRV':
            return '请输入服务目标';
        default:
            return '这这，这不对吧，有这个选项吗？';
    }
});

const handleSubmit = async () => {
    determineLoading.value = true;
    try {
        await api.v2.domain.createFreeSubdomain({
            token: userInfo?.usertoken || '',
            domain: model.value.selectedDomain,
            record: model.value.recordValue,
            type: model.value.selectedRecordType,
            ttl: model.value.TTLValue,
            target: model.value.target,
            remarks: '自定义地址',
        });

        createDomainNameModal.value = false;
        dialog.success({
            title: '成功',
            content:
                '域名解析创建成功，但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效。简而言之，您创建的免费域名需要等待一段时间后才能正常使用。',
            positiveText: '我知道了',
            onPositiveClick: () => {
                message.success('免费域名创建成功');
                fetchDomainData();
            },
        });
    } catch (error) {
        message.error('创建免费域名失败: ' + (error as Error).message);
    }
    determineLoading.value = false;
};

const handleFastSubmit = async () => {
    determineLoading.value = true;
    let fastRecord = fastModel.value.recordValue;
    let fastTarget = selectedTunnelInfo.value?.ip;
    let fastType = fastModel.value.selectedRecordType;
    const fastTunnelInfo = selectedTunnelInfo.value?.label;

    if (fastModel.value.selectedRecordType === 'CNAME') {
        dialog.warning({
            title: '注意',
            content:
                '免费域名无备案，如需在境内节点提供HTTP/HTTPS/其它法定范围内的公开服务，请使用您自行备案过的域名，免费域名无效',
            positiveText: '我真的明白了',
        });
    }

    if (fastModel.value.selectedRecordType === 'Java版MC') {
        fastType = 'SRV';
        fastRecord = '_minecraft._tcp.' + fastModel.value.recordValue;
        fastTarget = '5 0 ' + selectedTunnelInfo.value?.dorp + ' ' + selectedTunnelInfo.value?.ip;
    }

    try {
        await api.v2.domain.createFreeSubdomain({
            token: userInfo?.usertoken || '',
            domain: fastModel.value.selectedDomain,
            record: fastRecord,
            type: fastType,
            ttl: '10分钟',
            target: fastTarget || '',
            remarks: '解析 ' + fastModel.value.selectedRecordType + ' 到 ' + fastTunnelInfo,
        });

        createDomainNameModal.value = false;
        dialog.success({
            title: '成功',
            content: '域名解析创建成功，但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效',
            positiveText: '我知道了',
            onPositiveClick: () => {
                message.success('免费域名创建成功');
                fetchDomainData();
            },
        });
    } catch (error) {
        message.error('创建免费域名失败: ' + (error as Error).message);
    }
    determineLoading.value = false;
};

const resetDomainName = async () => {
    determineLoading.value = true;
    try {
        await api.v2.domain.updateFreeSubdomain({
            token: userInfo?.usertoken || '',
            domain: model.value.selectedDomain,
            record: model.value.recordValue,
            ttl: model.value.TTLValue,
            target: model.value.target,
            remarks: '自定义解析',
        });

        resetDomainNameModal.value = false;
        dialog.success({
            title: '成功',
            content: '域名解析修改成功！但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效',
            positiveText: '我知道了',
            onPositiveClick: () => {
                message.success('免费域名修改成功！');
                fetchDomainData();
            },
        });
    } catch (error) {
        message.error('修改免费域名失败: ' + (error as Error).message);
    }
    determineLoading.value = false;
};

const renderIcon = (icon: Component, color?: string) => {
    return () => {
        return h(NIcon, { color }, { default: () => h(icon) });
    };
};

// 初始化 loading 状态
const domainLoading = ref<boolean[]>([]);

watch(
    domainData,
    (newDomainData) => {
        domainLoading.value = newDomainData.map(() => false);
    },
    { immediate: true }
);

const generateOptions = (domain: freeDomain, index: number) => [
    {
        label: '访问',
        key: '1',
        icon: renderIcon(EyeOutline),
        props: {
            onClick: () => {
                window.open('http://' + domain.record + '.' + domain.domain, '_blank');
            },
        },
    },
    {
        label: '修改解析',
        key: '2',
        icon: renderIcon(CreateOutline),
        props: {
            onClick: () => {
                model.value.selectedDomain = domain.domain || 'null';
                model.value.selectedRecordType = domain.type;
                model.value.recordValue = domain.record;
                model.value.TTLValue = domain.ttl as
                    | '1分钟'
                    | '2分钟'
                    | '5分钟'
                    | '10分钟'
                    | '15分钟'
                    | '30分钟'
                    | '1小时'
                    | '2小时'
                    | '5小时'
                    | '12小时'
                    | '1天';
                model.value.target = domain.target;
                resetDomainNameModal.value = true;
            },
        },
    },
    {
        label: '删除域名',
        key: '3',
        icon: renderIcon(TrashOutline, '#f5222d'),
        props: {
            onClick: () => {
                deleteDomain(domain, index);
            },
        },
    },
];

const deleteDomain = async (domain: freeDomain, index: number) => {
    domainLoading.value[index] = true;
    try {
        await api.v2.domain.deleteFreeSubdomain({
            token: userInfo?.usertoken || '',
            domain: domain.domain,
            record: domain.record,
        });

        domainData.value.splice(index, 1);
        message.success(`删除域名: ${domain.record}.${domain.domain}，成功！`);
    } catch (error) {
        message.error('删除免费域名失败: ' + (error as Error).message);
        domainLoading.value[index] = false;
    }
    domainLoading.value.splice(index, 1);
};

interface SelectedTunnelInfo {
    label: string;
    ip: string;
    dorp: string;
}

const selectedTunnelInfo = ref<SelectedTunnelInfo | null>(null);

interface TunnelOption {
    name: string;
    node: string;
    ip: string;
    dorp: string;
    label: string;
    value: string;
}

const tunnelOptions = ref<TunnelOption[]>([]);

// 监听隧道变化，提取对应的ip
const handleTunnelChange = (selectedTunnel: string) => {
    const tunnel = tunnelOptions.value.find((t) => t.value === selectedTunnel);
    if (tunnel) {
        selectedTunnelInfo.value = {
            label: tunnel.label,
            ip: tunnel.ip,
            dorp: tunnel.dorp,
        };
    }
};

const handleTabChange = (activeName: string) => {
    loadingSelectedTunnel.value = true;

    if (activeName === '快速解析') {
        api.v2.tunnel
            .getTunnelList(userInfo?.usertoken || '')
            .then((response) => {
                tunnelOptions.value = response.data!.map(
                    (tunnel: {
                        id: number;
                        name: string;
                        localip: string;
                        type: string;
                        nport: number;
                        dorp: string;
                        node: string;
                        state: string;
                        userid: number;
                        encryption: string;
                        compression: string;
                        ap: string;
                        uptime: string | null;
                        ip: string | null;
                    }) => ({
                        label: `${tunnel.name} - ${tunnel.node}`,
                        value: tunnel.name,
                        node: tunnel.node,
                        ip: tunnel.ip ? tunnel.ip : '',
                        dorp: tunnel.dorp,
                        name: tunnel.name,
                    })
                );
            })
            .catch((error) => {
                message.error('获取隧道数据失败: ' + (error as Error).message);
            });
    }
    loadingSelectedTunnel.value = false;
};
</script>

<style scoped>
.custom-card {
    border-radius: 12px;
    /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); */
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.custom-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.type-tag {
    margin-left: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.remark-tag {
    background-color: rgba(241, 241, 241, 0.8);
    color: #666;
}

.footer-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-label {
    font-size: 0.9em;
    color: #666;
    margin-right: 12px;
}

.full-height-spin {
    height: 100%;
}

.custom-dropdown {
    border-radius: 12px;
}

.grid-item {
    transition: opacity 0.2s ease;
}

.grid-item:hover {
    opacity: 0.95;
}
</style>
