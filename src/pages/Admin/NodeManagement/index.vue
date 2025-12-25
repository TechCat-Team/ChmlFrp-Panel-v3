<template>
    <n-back-top :right="100" />
    <div class="node-management">
        <n-card title="节点管理" :bordered="false">
            <template #header-extra>
                <n-space>
                    <n-button type="primary" @click="handleOpenCreateModal">
                        <template #icon>
                            <n-icon><AddIcon /></n-icon>
                        </template>
                        新增节点
                    </n-button>
                    <n-button @click="fetchNodes">
                        <template #icon>
                            <n-icon><RefreshIcon /></n-icon>
                        </template>
                        刷新
                    </n-button>
                </n-space>
            </template>

            <!-- 搜索框 -->
            <n-space vertical :size="16" style="margin-bottom: 16px">
                <n-input
                    v-model:value="searchQuery"
                    placeholder="搜索节点名、域名或真实IP...（支持拼音搜索）"
                    clearable
                    @input="handleSearch"
                >
                    <template #prefix>
                        <n-icon :component="SearchIcon" />
                    </template>
                </n-input>
            </n-space>
            <n-watermark
                :content="`禁止截图\n${userInfoStore?.username}`"
                cross
                selectable
                :font-size="16"
                :line-height="16"
                :width="192"
                :height="128"
                :x-offset="12"
                :y-offset="28"
                :rotate="-15"
                :font-color="'rgba(128, 128, 128, 0.1)'"
            >
                <n-data-table
                    :columns="columns"
                    :data="filteredNodes"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll-x="1400"
                    striped
                    :single-line="false"
                    size="medium"
                    :row-props="rowProps"
                />
            </n-watermark>
        </n-card>

        <!-- 新增节点模态框 -->
        <n-modal v-model:show="showCreateModal" preset="dialog" title="新增节点" style="width: 800px">
            <n-form
                ref="createFormRef"
                :model="createForm"
                :rules="createRules"
                label-placement="left"
                label-width="120px"
                require-mark-placement="right-hanging"
            >
                <n-row :gutter="[16, 16]">
                    <n-col :span="12">
                        <n-form-item label="节点名称" path="name">
                            <n-input v-model:value="createForm.name" placeholder="请输入节点名称" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="真实IP" path="real_IP">
                            <n-input v-model:value="createForm.real_IP" placeholder="请输入真实IP地址" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="域名前缀" path="domain_prefix">
                            <n-input
                                v-model:value="createForm.domain_prefix"
                                placeholder="只能包含小写字母、数字和短横线"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="连接端口" path="port">
                            <n-input-number
                                v-model:value="createForm.port"
                                :min="1"
                                :max="65535"
                                placeholder="默认7000"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="管理端口" path="adminport">
                            <n-input-number
                                v-model:value="createForm.adminport"
                                :min="1"
                                :max="65535"
                                placeholder="默认8233"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="速度" path="speed">
                            <n-input v-model:value="createForm.speed" placeholder="默认100" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="区域" path="area">
                            <n-input v-model:value="createForm.area" placeholder="默认未知" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点组" path="nodegroup">
                            <n-select
                                v-model:value="createForm.nodegroup"
                                :options="nodegroupOptions"
                                placeholder="默认user"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="是否国内" path="china">
                            <n-select v-model:value="createForm.china" :options="booleanOptions" placeholder="默认是" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="支持Web" path="web">
                            <n-select v-model:value="createForm.web" :options="booleanOptions" placeholder="默认是" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="支持UDP" path="udp">
                            <n-select v-model:value="createForm.udp" :options="booleanOptions" placeholder="默认是" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="防御" path="fangyu">
                            <n-select
                                v-model:value="createForm.fangyu"
                                :options="booleanOptions"
                                placeholder="默认否"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="远程端口范围" path="rport">
                            <n-input v-model:value="createForm.rport" placeholder="默认10000-50000" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="用户名" path="auth_username">
                            <n-input-group>
                                <n-input v-model:value="createForm.auth_username" placeholder="自动生成" />
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
                                    v-model:value="createForm.auth_password"
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
                            <n-input v-model:value="createForm.ipv6" placeholder="IPv6地址" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="24">
                        <n-form-item label="备注" path="notes">
                            <n-input v-model:value="createForm.notes" type="textarea" placeholder="节点备注信息" />
                        </n-form-item>
                    </n-col>
                </n-row>
            </n-form>
            <template #action>
                <n-space>
                    <n-button @click="showCreateModal = false">取消</n-button>
                    <n-button type="primary" :loading="createLoading" @click="handleCreate">确认创建</n-button>
                </n-space>
            </template>
        </n-modal>

        <!-- 编辑节点模态框 -->
        <n-modal v-model:show="showEditModal" preset="dialog" title="编辑节点" style="width: 800px">
            <n-form
                ref="editFormRef"
                :model="editForm"
                :rules="editRules"
                label-placement="left"
                label-width="120px"
                require-mark-placement="right-hanging"
            >
                <n-row :gutter="[16, 16]">
                    <n-col :span="12">
                        <n-form-item label="节点名称" path="name">
                            <n-input v-model:value="editForm.name" placeholder="请输入节点名称" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点IP" path="ip">
                            <n-input v-model:value="editForm.ip" placeholder="请输入节点IP地址" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="真实IP" path="real_IP">
                            <n-input v-model:value="editForm.real_IP" placeholder="真实IP地址" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="连接端口" path="port">
                            <n-input-number v-model:value="editForm.port" :min="1" :max="65535" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="管理端口" path="adminport">
                            <n-input-number v-model:value="editForm.adminport" :min="1" :max="65535" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="速度" path="speed">
                            <n-input v-model:value="editForm.speed" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="区域" path="area">
                            <n-input v-model:value="editForm.area" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点组" path="nodegroup">
                            <n-select v-model:value="editForm.nodegroup" :options="nodegroupOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="是否国内" path="china">
                            <n-select v-model:value="editForm.china" :options="booleanOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="支持Web" path="web">
                            <n-select v-model:value="editForm.web" :options="booleanOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="支持UDP" path="udp">
                            <n-select v-model:value="editForm.udp" :options="booleanOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="防御" path="fangyu">
                            <n-select v-model:value="editForm.fangyu" :options="booleanOptions" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="远程端口范围" path="rport">
                            <n-input v-model:value="editForm.rport" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="用户名" path="auth_username">
                            <n-input v-model:value="editForm.auth_username" placeholder="请输入用户名" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="密码" path="auth_password">
                            <n-input
                                v-model:value="editForm.auth_password"
                                type="password"
                                show-password-on="click"
                                placeholder="请输入密码"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="IPv6" path="ipv6">
                            <n-input v-model:value="editForm.ipv6" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点Token" path="nodetoken">
                            <n-input v-model:value="editForm.nodetoken" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="API Token" path="apitoken">
                            <n-input v-model:value="editForm.apitoken" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="24">
                        <n-form-item label="坐标" path="coordinates">
                            <n-input v-model:value="editForm.coordinates" placeholder="经度,纬度" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="24">
                        <n-form-item label="备注" path="notes">
                            <n-input v-model:value="editForm.notes" type="textarea" />
                        </n-form-item>
                    </n-col>
                </n-row>
            </n-form>
            <template #action>
                <n-space>
                    <n-button @click="showEditModal = false">取消</n-button>
                    <n-button type="primary" :loading="editLoading" @click="handleEdit">确认修改</n-button>
                </n-space>
            </template>
        </n-modal>
        <!-- 配置代码模态框 -->
        <n-modal v-model:show="ConfigModal" @update:show="handleConfigModalClose">
            <n-card
                style="max-width: 800px"
                title="配置代码"
                :bordered="false"
                size="medium"
                role="dialog"
                aria-modal="true"
                closable
                @close="handleConfigModalClose"
            >
                <n-collapse :default-expanded-names="['1', '2']">
                    <!-- 一键部署代码 -->
                    <n-collapse-item title="一键部署代码" name="1">
                        <n-space vertical>
                            <n-card size="small">
                                <template #header>
                                    <n-space justify="space-between" style="width: 100%">
                                        <span>Linux</span>
                                        <n-button text @click="copyToClipboard(deployCode)">
                                            <template #icon>
                                                <n-icon :component="CopyOutline" />
                                            </template>
                                            复制
                                        </n-button>
                                    </n-space>
                                </template>
                                <n-code :code="deployCode" word-wrap language="bash" />
                            </n-card>
                        </n-space>
                    </n-collapse-item>

                    <!-- Frps.ini 配置 -->
                    <n-collapse-item title="Frps.ini 配置" name="2">
                        <n-card size="small">
                            <n-code :code="frpsIniConfig" language="ini" word-wrap />
                            <template #action>
                                <n-space>
                                    <n-button
                                        secondary
                                        type="primary"
                                        size="small"
                                        @click="copyToClipboard(frpsIniConfig)"
                                    >
                                        <template #icon>
                                            <n-icon :component="CopyOutline" />
                                        </template>
                                        复制配置
                                    </n-button>
                                </n-space>
                            </template>
                        </n-card>
                    </n-collapse-item>
                </n-collapse>
            </n-card>
        </n-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, h, computed } from 'vue';
import {
    NCard,
    NDataTable,
    NButton,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NSelect,
    NSpace,
    NRow,
    NCol,
    NIcon,
    NTag,
    useMessage,
    NBackTop,
    NInputGroup,
    NCode,
    NCollapse,
    NCollapseItem,
    NEllipsis,
    NDropdown,
    useDialog,
} from 'naive-ui';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    CopyOutline,
    CheckmarkCircle,
    CloseCircle,
    Shield,
    People,
    Diamond,
    CodeSlash,
    Create,
    EllipsisVertical,
    TrashOutline,
    Search as SearchIcon,
    OpenOutline,
} from '@vicons/ionicons5';
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import { matchPinyinSearch } from '@/utils/pinyinSearch';

const ConfigModal = ref(false);
const currentCodeNode = ref<Node | null>(null);

// 节点接口定义
interface Node {
    id: number;
    name: string;
    ip: string;
    realIp: string;
    port: number;
    adminPort: string;
    speed: string;
    area: string;
    state: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth: string;
    nodetoken: string;
    apitoken: string;
    coordinates: string;
    ipv6: string;
    toowhite: boolean;
}

// 创建表单接口
interface CreateForm {
    name: string;
    domain_prefix: string;
    real_IP: string;
    port: number | null;
    adminport: number | null;
    speed: string;
    area: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth_username: string;
    auth_password: string;
    ipv6: string;
}

// 编辑表单接口
interface EditForm {
    name: string;
    ip: string;
    real_IP: string;
    port: number | null;
    adminport: number | null;
    speed: string;
    area: string;
    nodegroup: string;
    china: string;
    web: string;
    udp: string;
    fangyu: string;
    notes: string;
    rport: string;
    auth: string;
    auth_username: string;
    auth_password: string;
    nodetoken: string;
    apitoken: string;
    coordinates: string;
    ipv6: string;
}

const userStore = useUserStore();
const userInfoStore = userStore.userInfo;
const message = useMessage();
const dialog = useDialog();

// 响应式数据
const loading = ref(false);
const createLoading = ref(false);
const editLoading = ref(false);
const nodes = ref<Node[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const currentEditNode = ref<Node | null>(null);
const searchQuery = ref('');

// 表单引用
const createFormRef = ref<FormInst | null>(null);
const editFormRef = ref<FormInst | null>(null);

// 创建表单
const createForm = reactive<CreateForm>({
    name: '',
    domain_prefix: '',
    real_IP: '',
    port: 7000,
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

// 编辑表单
const editForm = reactive<EditForm>({
    name: '',
    ip: '',
    real_IP: '',
    port: null,
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

// 选项配置
const nodegroupOptions = [
    { label: '用户组', value: 'user' },
    { label: 'VIP组', value: 'vip' },
];

const booleanOptions = [
    { label: '是', value: 'true' },
    { label: '否', value: 'false' },
];

// 表单验证规则
const createRules: FormRules = {
    name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
    real_IP: [{ required: true, message: '请输入真实IP', trigger: 'blur' }],
    domain_prefix: [
        { required: true, message: '请输入域名前缀', trigger: 'blur' },
        { pattern: /^[a-z0-9-.]+$/, message: '域名前缀只能包含小写字母、数字和短横线、点', trigger: 'blur' },
    ],
};

const editRules: FormRules = {
    name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
    ip: [{ required: true, message: '请输入节点IP', trigger: 'blur' }],
};

// 计算过滤后的节点列表
const filteredNodes = computed(() => {
    if (!searchQuery.value.trim()) {
        return nodes.value;
    }

    const query = searchQuery.value.trim();
    return nodes.value.filter((node) => {
        // 使用拼音搜索功能
        const matchName = matchPinyinSearch(node.name, query);
        const matchDomain = matchPinyinSearch(node.ip, query);
        const matchRealIp = matchPinyinSearch(node.realIp, query);
        const matchArea = matchPinyinSearch(node.area, query);

        return matchName || matchDomain || matchRealIp || matchArea;
    });
});

// 分页配置
const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
        pagination.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize;
        pagination.page = 1;
    },
    prefix: (info: any) => `共 ${info.itemCount} 条`,
});

// 表格列配置
const columns: DataTableColumns<Node> = [
    {
        title: 'ID',
        key: 'id',
        width: 70,
        sorter: 'default',
        align: 'center',
        render(row) {
            return h(
                'span',
                {
                    style: 'font-weight: 600; color: #18a058;',
                },
                row.id
            );
        },
    },
    {
        title: '节点名称',
        key: 'name',
        width: 150,
        sorter: 'default',
        render(row) {
            return h(
                NEllipsis,
                {},
                {
                    default: () =>
                        h(
                            'span',
                            {
                                style: 'font-weight: 500;',
                            },
                            row.name
                        ),
                }
            );
        },
    },
    {
        title: '域名',
        key: 'ip',
        width: 160,
        ellipsis: {
            tooltip: true,
        },
        render(row) {
            return h(
                'span',
                {
                    style: 'font-family: monospace; font-size: 13px;',
                },
                row.ip
            );
        },
    },
    {
        title: '真实IP',
        key: 'realIp',
        width: 160,
        ellipsis: {
            tooltip: true,
        },
        render(row) {
            return h(
                'span',
                {
                    style: 'font-family: monospace; font-size: 13px; color: #666;',
                },
                row.realIp
            );
        },
    },
    {
        title: '状态',
        key: 'state',
        width: 90,
        align: 'center',
        render(row) {
            const statusMap: Record<string, { type: 'success' | 'error' | 'warning'; text: string; icon: any }> = {
                online: { type: 'success', text: '在线', icon: CheckmarkCircle },
                offline: { type: 'error', text: '离线', icon: CloseCircle },
            };
            const status = statusMap[row.state] || { type: 'error', text: '未知', icon: CloseCircle };
            return h(
                NTag,
                {
                    type: status.type,
                    size: 'small',
                    round: true,
                },
                {
                    default: () =>
                        h(
                            NSpace,
                            { size: 4, align: 'center' },
                            {
                                default: () => [h(NIcon, { size: 14, component: status.icon }), h('span', status.text)],
                            }
                        ),
                }
            );
        },
    },
    {
        title: '区域',
        key: 'area',
        width: 120,
        ellipsis: {
            tooltip: true,
        },
        render(row) {
            return h(
                NSpace,
                { size: 4, align: 'center' },
                {
                    default: () => [h('span', row.area)],
                }
            );
        },
    },
    {
        title: '速度(m)',
        key: 'speed',
        width: 100,
        align: 'center',
        render(row) {
            return h(
                NTag,
                {
                    type: 'info',
                    size: 'small',
                    bordered: false,
                },
                {
                    default: () =>
                        h(
                            NSpace,
                            { size: 4, align: 'center' },
                            {
                                default: () => [h('span', row.speed)],
                            }
                        ),
                }
            );
        },
    },
    {
        title: '国内',
        key: 'china',
        width: 80,
        align: 'center',
        render(row) {
            const isChina = row.china === 'yes' || row.china === 'true';
            return h(
                NTag,
                {
                    type: isChina ? 'success' : 'default',
                    size: 'small',
                    round: true,
                    bordered: false,
                },
                {
                    default: () =>
                        h(NIcon, {
                            size: 16,
                            component: isChina ? CheckmarkCircle : CloseCircle,
                        }),
                }
            );
        },
    },
    {
        title: 'Web',
        key: 'web',
        width: 80,
        align: 'center',
        render(row) {
            const hasWeb = row.web === 'yes' || row.web === 'true';
            return h(
                NTag,
                {
                    type: hasWeb ? 'success' : 'default',
                    size: 'small',
                    round: true,
                    bordered: false,
                },
                {
                    default: () =>
                        h(NIcon, {
                            size: 16,
                            component: hasWeb ? CheckmarkCircle : CloseCircle,
                        }),
                }
            );
        },
    },
    {
        title: 'UDP',
        key: 'udp',
        width: 80,
        align: 'center',
        render(row) {
            const hasUdp = row.udp === 'true';
            return h(
                NTag,
                {
                    type: hasUdp ? 'success' : 'default',
                    size: 'small',
                    round: true,
                    bordered: false,
                },
                {
                    default: () =>
                        h(NIcon, {
                            size: 16,
                            component: hasUdp ? CheckmarkCircle : CloseCircle,
                        }),
                }
            );
        },
    },
    {
        title: '权限',
        key: 'nodegroup',
        width: 90,
        align: 'center',
        render(row) {
            const isUser = row.nodegroup === 'user';
            return h(
                NTag,
                {
                    type: isUser ? 'primary' : 'warning',
                    size: 'small',
                    round: true,
                },
                {
                    default: () =>
                        h(
                            NSpace,
                            { size: 4, align: 'center' },
                            {
                                default: () => [
                                    h(NIcon, { size: 14, component: isUser ? People : Diamond }),
                                    h('span', isUser ? '用户' : '会员'),
                                ],
                            }
                        ),
                }
            );
        },
    },
    {
        title: '防御',
        key: 'fangyu',
        width: 80,
        align: 'center',
        render(row) {
            const hasFangyu = row.fangyu === 'true';
            return h(
                NTag,
                {
                    type: hasFangyu ? 'success' : 'default',
                    size: 'small',
                    round: true,
                    bordered: false,
                },
                {
                    default: () =>
                        h(NIcon, {
                            size: 16,
                            component: hasFangyu ? Shield : CloseCircle,
                        }),
                }
            );
        },
    },
    {
        title: '操作',
        key: 'actions',
        width: 80,
        align: 'center',
        fixed: 'right',
        render(row) {
            const options = [
                {
                    label: '编辑',
                    key: 'edit',
                    icon: () => h(NIcon, { component: Create }),
                    props: {
                        onClick: () => handleEditClick(row),
                    },
                },
                {
                    label: '查看代码',
                    key: 'code',
                    icon: () => h(NIcon, { component: CodeSlash }),
                    props: {
                        onClick: () => handleCodeClick(row),
                    },
                },
                {
                    label: '访问面板',
                    key: 'panel',
                    icon: () => h(NIcon, { component: OpenOutline }),
                    props: {
                        onClick: () => handlePanelAccess(row),
                    },
                },
                {
                    type: 'divider',
                    key: 'd1',
                },
                {
                    label: '删除',
                    key: 'delete',
                    icon: () => h(NIcon, { component: TrashOutline, style: 'color: #d03050;' }),
                    props: {
                        onClick: () => handleDeleteClick(row),
                        style: 'color: #d03050;',
                    },
                },
            ];

            return h(
                NDropdown,
                {
                    trigger: 'click',
                    options: options,
                    placement: 'bottom-end',
                    showArrow: true,
                },
                {
                    default: () =>
                        h(
                            NButton,
                            {
                                size: 'small',
                                quaternary: true,
                                circle: true,
                            },
                            {
                                icon: () =>
                                    h(NIcon, {
                                        component: EllipsisVertical,
                                        size: 18,
                                    }),
                            }
                        ),
                }
            );
        },
    },
];

// 打开新增节点模态框
const handleOpenCreateModal = () => {
    resetCreateForm();
    showCreateModal.value = true;
};

// 获取节点列表
const fetchNodes = async () => {
    loading.value = true;
    try {
        const adminToken = userInfoStore?.usertoken || '';
        const res = await api.v2.admin.getNodes(adminToken);
        nodes.value = (res.data?.nodes as any[]) || [];
    } catch (error: any) {
        const msg = error?.message || '请求失败，请检查网络或联系管理员';
        message.error(msg);
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 创建节点
const handleCreate = async () => {
    if (!createFormRef.value) return;

    try {
        await createFormRef.value.validate();
        createLoading.value = true;

        // 将用户名和密码转换为Base64编码的auth
        const authString = `${createForm.auth_username}:${createForm.auth_password}`;
        const authBase64 = btoa(authString);

        // 构建请求数据，不包含ip字段，auth使用Base64编码
        const requestData = {
            name: createForm.name,
            domain_prefix: createForm.domain_prefix,
            real_IP: createForm.real_IP,
            port: createForm.port,
            adminport: createForm.adminport,
            speed: createForm.speed,
            area: createForm.area,
            nodegroup: createForm.nodegroup,
            china: createForm.china === 'true' ? 'yes' : 'no',
            web: createForm.web === 'true' ? 'yes' : 'no',
            udp: createForm.udp,
            fangyu: createForm.fangyu,
            notes: createForm.notes,
            rport: createForm.rport,
            auth: authBase64,
            ipv6: createForm.ipv6,
        };

        const adminToken = userInfoStore?.usertoken || '';
        await api.v2.admin.createNode(adminToken, requestData as unknown as Record<string, unknown>);
        message.success('节点创建成功');
        showCreateModal.value = false;
        resetCreateForm();
        await fetchNodes();
    } catch (error: any) {
        if (error?.message) {
            return; // 表单验证错误
        }
        message.error(`节点创建失败: ${error?.message || '请检查网络或联系管理员'}`);
        console.error(error);
    } finally {
        createLoading.value = false;
    }
};

// 编辑节点点击处理
const handleEditClick = (node: Node) => {
    currentEditNode.value = node;

    // 填充编辑表单
    editForm.name = node.name;
    editForm.ip = node.ip;
    editForm.real_IP = node.realIp;
    editForm.port = node.port;
    editForm.adminport = parseInt(node.adminPort);
    editForm.speed = node.speed;
    editForm.area = node.area;
    editForm.nodegroup = node.nodegroup;
    // 兼容构思数据库
    editForm.china = node.china === 'yes' ? 'true' : 'false';
    editForm.web = node.web === 'yes' ? 'true' : 'false';
    editForm.udp = node.udp;
    editForm.fangyu = node.fangyu;
    editForm.notes = node.notes;
    editForm.rport = node.rport;
    editForm.auth = node.auth;

    // 解码Base64的auth为用户名和密码
    try {
        const decodedAuth = atob(node.auth);
        const [username, password] = decodedAuth.split(':');
        editForm.auth_username = username || '';
        editForm.auth_password = password || '';
    } catch (error) {
        editForm.auth_username = '';
        editForm.auth_password = '';
    }

    editForm.nodetoken = node.nodetoken;
    editForm.apitoken = node.apitoken;
    editForm.coordinates = node.coordinates;
    editForm.ipv6 = node.ipv6;

    showEditModal.value = true;
};

// 编辑节点
const handleEdit = async () => {
    if (!editFormRef.value || !currentEditNode.value) return;

    try {
        await editFormRef.value.validate();
        editLoading.value = true;

        // 将用户名和密码转换为Base64编码的auth
        const authString = `${editForm.auth_username}:${editForm.auth_password}`;
        const authBase64 = btoa(authString);

        // 构建请求数据，auth使用Base64编码
        const requestData = {
            name: editForm.name,
            ip: editForm.ip,
            real_IP: editForm.real_IP,
            port: editForm.port,
            adminport: editForm.adminport,
            speed: editForm.speed,
            area: editForm.area,
            nodegroup: editForm.nodegroup,
            china: editForm.china === 'true' ? 'yes' : 'no',
            web: editForm.web === 'true' ? 'yes' : 'no',
            udp: editForm.udp,
            fangyu: editForm.fangyu,
            notes: editForm.notes,
            rport: editForm.rport,
            auth: authBase64,
            nodetoken: editForm.nodetoken,
            apitoken: editForm.apitoken,
            coordinates: editForm.coordinates,
            ipv6: editForm.ipv6,
        };

        const adminToken = userInfoStore?.usertoken || '';
        await api.v2.admin.updateNode(
            adminToken,
            currentEditNode.value.id,
            requestData as unknown as Record<string, unknown>
        );
        message.success('节点信息更新成功');
        showEditModal.value = false;
        await fetchNodes();
    } catch (error: any) {
        if (error?.message) {
            return; // 表单验证错误
        }
        message.error(`节点信息更新失败: ${error?.message || '请检查网络或联系管理员'}`);
        console.error(error);
    } finally {
        editLoading.value = false;
    }
};

// 生成随机字符串
const generateRandomString = (length: number, includeSpecialChars: boolean = false): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*';

    let chars = letters + numbers;
    if (includeSpecialChars) {
        chars += specialChars;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// 生成随机用户名
const generateRandomUsername = () => {
    createForm.auth_username = 'user_' + generateRandomString(8, false);
};

// 生成随机密码
const generateRandomPassword = () => {
    createForm.auth_password = generateRandomString(16, true);
};

// 重置创建表单
const resetCreateForm = () => {
    Object.assign(createForm, {
        name: '',
        domain_prefix: '',
        real_IP: '',
        port: 7000,
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
    // 自动生成随机用户名和密码
    generateRandomUsername();
    generateRandomPassword();
};

const copyToClipboard = (text: string) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            message.success('复制成功');
        })
        .catch((err) => {
            console.error('[节点管理]复制失败:', err);
            message.error('复制失败');
        });
};

// 处理代码按钮点击
const handleCodeClick = (node: Node) => {
    currentCodeNode.value = node;
    ConfigModal.value = true;
};

// 处理配置代码模态框关闭
const handleConfigModalClose = () => {
    ConfigModal.value = false;
    currentCodeNode.value = null;
};

// 处理访问面板
const handlePanelAccess = (node: Node) => {
    try {
        // 解码auth获取用户名和密码
        const decodedAuth = atob(node.auth);
        const [username, password] = decodedAuth.split(':');

        if (!username || !password) {
            message.error('节点认证信息不完整，无法访问面板');
            return;
        }

        // 创建Basic Auth URL
        const authUrl = `http://${username}:${password}@${node.realIp}:${node.adminPort}`;

        // 在新标签页打开面板
        window.open(authUrl, '_blank');

        message.success(`正在打开节点 "${node.name}" 的管理面板`);
    } catch (error) {
        console.error('访问面板失败:', error);
        message.error('访问面板失败，请检查节点认证信息');
    }
};

// 处理删除节点
const handleDeleteClick = (node: Node) => {
    dialog.warning({
        title: '确认删除',
        content: `确定要删除节点 "${node.name}" 吗？\n\n此操作将会：\n• 删除节点数据库记录\n• 自动删除对应的DNS记录（${node.ip}）\n\n此操作不可恢复！`,
        positiveText: '确认删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            await handleDelete(node);
        },
    });
};

// 删除节点
const handleDelete = async (node: Node) => {
    const loadingMessage = message.loading('正在删除节点...', { duration: 0 });

    try {
        const adminToken = userInfoStore?.usertoken || '';
        const res = await api.v2.admin.deleteNode(adminToken, node.id);
        loadingMessage.destroy();
        const data: any = (res as any).data;
        if (data && typeof data === 'object') {
            if (data.dnsDeleted) {
                message.success(`节点 "${data.nodeName}" 删除成功，DNS记录已自动删除`);
            } else if (data.nodeName) {
                message.warning(`节点 "${data.nodeName}" 删除成功，但DNS记录删除失败（可能不存在或已被删除）`);
            } else {
                message.success('节点删除成功');
            }
        } else {
            message.success('节点删除成功');
        }
        await fetchNodes();
    } catch (error: any) {
        loadingMessage.destroy();
        const msg = error?.message || '删除节点失败，请检查网络连接';
        message.error(msg);
        console.error(error);
    }
};

// 生成 frps.ini 配置
const frpsIniConfig = computed(() => {
    if (!currentCodeNode.value) return '';

    const node = currentCodeNode.value;

    // 解码auth获取用户名和密码
    let username = 'admin';
    let password = 'password';
    try {
        const decodedAuth = atob(node.auth);
        const [user, pass] = decodedAuth.split(':');
        username = user || 'admin';
        password = pass || 'password';
    } catch (error) {
        console.error('解码auth失败:', error);
    }

    // 判断是否允许建站
    const canWeb = node.web === 'yes' || node.web === 'true';

    // 构建vhost配置（仅在允许建站时添加）
    const vhostConfig = canWeb
        ? `vhost_http_port = 80
vhost_https_port = 443
`
        : '';

    return `[common]
bind_addr = 0.0.0.0
bind_port = ${node.port}
kcp_bind_port = ${node.port}
dashboard_port = ${node.adminPort}
dashboard_user = ${username}
dashboard_pwd = ${password}
${vhostConfig}token = ${node.nodetoken}
bind_udp_port = 7001
max_pool_count = 100000000
tcp_mux = true
authentication_timeout = 0
log_level = warn
log_max_days = 3
api_enable = true
api_baseurl = http://cf-v2.uapis.cn/cfg
api_token = ${node.apitoken}`;
});

// 生成一键部署代码
const deployCode = computed(() => {
    if (!currentCodeNode.value) return '';

    const node = currentCodeNode.value;

    // 解码auth获取用户名和密码
    let username = 'admin';
    let password = 'password';
    try {
        const decodedAuth = atob(node.auth);
        const [user, pass] = decodedAuth.split(':');
        username = user || 'admin';
        password = pass || 'password';
    } catch (error) {
        console.error('解码auth失败:', error);
    }

    // 判断是否可建站
    const canWeb = node.web === 'yes' || node.web === 'true' ? 'true' : 'false';

    return `curl -O https://www.chmlfrp.net/script/linux/server_deploy.sh && chmod +x server_deploy.sh && sudo ./server_deploy.sh --skip-source-check ${node.port} ${node.adminPort} ${username} ${password} ${node.nodetoken} 7001 http://cf-v2.uapis.cn/cfg "${node.apitoken}" ${canWeb}`;
});

// 搜索处理函数
const handleSearch = () => {
    // 搜索时重置到第一页
    pagination.page = 1;
};

// 表格行属性
const rowProps = () => {
    return {
        style: 'cursor: pointer; transition: all 0.3s;',
        onMouseenter: (e: MouseEvent) => {
            const target = e.currentTarget as HTMLElement;
            target.style.transform = 'scale(1.005)';
        },
        onMouseleave: (e: MouseEvent) => {
            const target = e.currentTarget as HTMLElement;
            target.style.transform = 'scale(1)';
        },
    };
};

// 页面加载时获取数据
onMounted(() => {
    fetchNodes();
});
</script>
