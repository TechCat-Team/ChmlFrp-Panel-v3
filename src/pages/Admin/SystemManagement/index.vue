<template>
    <n-back-top :right="100" />
    <n-space vertical :size="16">
        <!-- 消息列表 -->
        <n-card title="系统消息管理" :bordered="false">
            <n-space vertical :size="16">
                <!-- 操作栏 -->
                <n-space justify="space-between">
                    <n-space>
                        <n-select
                            v-model:value="searchType"
                            :options="searchTypeOptions"
                            style="width: 120px"
                            placeholder="搜索类型"
                        />
                        <n-input
                            v-model:value="searchKeyword"
                            placeholder="请输入搜索内容"
                            clearable
                            style="width: 240px"
                            @keydown.enter="handleSearch"
                            @clear="handleReset"
                        >
                            <template #prefix>
                                <n-icon :component="SearchOutline" />
                            </template>
                        </n-input>
                        <n-button @click="handleSearch" :loading="loading"> 搜索 </n-button>
                        <n-button @click="handleReset"> 重置 </n-button>
                        <n-button @click="fetchMessages">
                            <template #icon>
                                <n-icon :component="RefreshOutline" />
                            </template>
                            刷新
                        </n-button>
                    </n-space>
                    <n-button type="primary" @click="handleOpenCreateModal">
                        <template #icon>
                            <n-icon :component="AddOutline" />
                        </template>
                        创建消息
                    </n-button>
                </n-space>

                <!-- 搜索结果提示 -->
                <div v-if="isSearchMode" style="margin-bottom: 16px">
                    <n-alert type="info" :show-icon="false">
                        搜索结果：{{ getSearchTypeLabel() }}包含"{{ searchKeyword }}"的消息，共找到
                        {{ pagination.itemCount }} 条
                        <n-button text type="primary" @click="handleReset" style="margin-left: 8px">
                            查看全部消息
                        </n-button>
                    </n-alert>
                </div>

                <!-- 表格 -->
                <n-data-table
                    :columns="columns"
                    :data="messages"
                    :pagination="pagination"
                    :loading="loading"
                    :bordered="false"
                    striped
                    :row-key="(row: SystemMessageListItem) => row.id"
                    :scroll-x="1200"
                    :remote="true"
                    @update:page="handlePageChange"
                    @update:page-size="handlePageSizeChange"
                />
            </n-space>
        </n-card>
    </n-space>

    <!-- 创建消息对话框 -->
    <n-modal
        v-model:show="showCreateModal"
        preset="card"
        title="创建系统消息"
        style="width: 800px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-form
            ref="createFormRef"
            :model="createForm"
            :rules="createRules"
            label-placement="left"
            label-width="120"
        >
            <n-form-item label="消息标题" path="title">
                <n-input
                    v-model:value="createForm.title"
                    placeholder="请输入消息标题（最大100字符）"
                    :maxlength="100"
                    show-count
                    clearable
                />
            </n-form-item>

            <n-form-item label="消息内容" path="contentMd">
                <n-input
                    v-model:value="createForm.contentMd"
                    type="textarea"
                    placeholder="请输入消息内容（Markdown格式）"
                    :rows="10"
                    clearable
                />
                <template #feedback>支持 Markdown 格式</template>
            </n-form-item>

            <n-form-item label="优先级" path="priority">
                <n-select
                    v-model:value="createForm.priority"
                    :options="priorityOptions"
                    placeholder="请选择优先级"
                    clearable
                />
            </n-form-item>

            <n-form-item label="目标用户" path="targetUsers">
                <n-input
                    v-model:value="targetUsersInput"
                    type="textarea"
                    placeholder='留空表示全体用户，或输入用户名数组，如：["user1","user2"]'
                    :rows="3"
                    clearable
                />
                <template #feedback>
                    留空或输入 null 表示全体用户，否则输入 JSON 数组格式的用户名
                </template>
            </n-form-item>

            <n-form-item label="发布时间" path="publishTime">
                <n-date-picker
                    v-model:value="createForm.publishTime"
                    type="datetime"
                    style="width: 100%"
                    format="yyyy-MM-dd HH:mm:ss"
                    placeholder="留空则使用当前时间"
                    clearable
                />
            </n-form-item>
        </n-form>
        <template #footer>
            <n-space justify="end">
                <n-button @click="showCreateModal = false">取消</n-button>
                <n-button type="primary" :loading="createLoading" @click="handleCreate">创建</n-button>
            </n-space>
        </template>
    </n-modal>

    <!-- 编辑消息对话框 -->
    <n-modal
        v-model:show="showEditModal"
        preset="card"
        title="编辑系统消息"
        style="width: 800px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-form
            ref="editFormRef"
            :model="editForm"
            :rules="editRules"
            label-placement="left"
            label-width="120"
        >
            <n-form-item label="消息标题" path="title">
                <n-input
                    v-model:value="editForm.title"
                    placeholder="留空则不修改（最大100字符）"
                    :maxlength="100"
                    show-count
                    clearable
                />
            </n-form-item>

            <n-form-item label="消息内容" path="contentMd">
                <n-input
                    v-model:value="editForm.contentMd"
                    type="textarea"
                    placeholder="留空则不修改（Markdown格式）"
                    :rows="10"
                    clearable
                />
                <template #feedback>
                    <div style="display: flex; justify-content: space-between; align-items: center">
                        <span>支持 Markdown 格式</span>
                        <n-button
                            size="small"
                            quaternary
                            type="primary"
                            @click="handlePreviewEditContent"
                            :disabled="!editForm.contentMd || editForm.contentMd.trim() === ''"
                        >
                            <template #icon>
                                <n-icon :component="EyeOutline" />
                            </template>
                            预览
                        </n-button>
                    </div>
                </template>
            </n-form-item>

            <n-form-item label="优先级" path="priority">
                <n-select
                    v-model:value="editForm.priority"
                    :options="priorityOptions"
                    placeholder="留空则不修改"
                    clearable
                />
            </n-form-item>

            <n-form-item label="目标用户" path="targetUsers">
                <n-input
                    v-model:value="editTargetUsersInput"
                    type="textarea"
                    placeholder='留空则不修改，null表示全体用户，或输入用户名数组，如：["user1","user2"]'
                    :rows="3"
                    clearable
                />
                <template #feedback>
                    留空则不修改，null 表示全体用户，否则输入 JSON 数组格式的用户名
                </template>
            </n-form-item>

            <n-form-item label="发布时间" path="publishTime">
                <n-date-picker
                    v-model:value="editForm.publishTime"
                    type="datetime"
                    style="width: 100%"
                    format="yyyy-MM-dd HH:mm:ss"
                    placeholder="留空则不修改"
                    clearable
                />
            </n-form-item>
        </n-form>
        <template #footer>
            <n-space justify="end">
                <n-button @click="showEditModal = false">取消</n-button>
                <n-button type="primary" :loading="editLoading" @click="handleEdit">更新</n-button>
            </n-space>
        </template>
    </n-modal>

    <!-- 预览对话框 -->
    <n-modal
        v-model:show="showPreviewModal"
        preset="card"
        title="内容预览"
        size="large"
        style="max-width: 800px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-card :bordered="false" embedded class="detail-content-card">
            <div class="markdown-content-wrapper">
                <div class="markdown-content" v-html="renderMarkdown(previewContent)" />
            </div>
        </n-card>
        <template #footer>
            <n-space justify="end">
                <n-button @click="showPreviewModal = false">关闭</n-button>
            </n-space>
        </template>
    </n-modal>

    <!-- 预览对话框 -->
    <n-modal
        v-model:show="showPreviewModal"
        preset="card"
        title="内容预览"
        size="large"
        style="max-width: 800px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-card :bordered="false" embedded class="detail-content-card">
            <div class="markdown-content-wrapper">
                <div class="markdown-content" v-html="renderMarkdown(previewContent)" />
            </div>
        </n-card>
        <template #footer>
            <n-space justify="end">
                <n-button @click="showPreviewModal = false">关闭</n-button>
            </n-space>
        </template>
    </n-modal>

    <!-- 消息详情对话框 -->
    <n-modal
        v-model:show="showDetailModal"
        preset="card"
        title="消息详情"
        size="large"
        style="max-width: 800px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-spin :show="detailLoading">
            <n-space vertical :size="16" v-if="currentDetail">
                <n-card :bordered="false" embedded class="detail-info-card">
                    <n-descriptions :column="2" bordered>
                        <n-descriptions-item label="消息ID">
                            <span class="detail-id">#{{ currentDetail.id }}</span>
                        </n-descriptions-item>
                        <n-descriptions-item label="优先级">
                            <n-tag :type="getPriorityType(currentDetail.priority)" size="medium" round>
                                {{ getPriorityLabel(currentDetail.priority) }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="标题">
                            <div class="detail-title">{{ currentDetail.title }}</div>
                        </n-descriptions-item>
                        <n-descriptions-item label="目标用户">
                            <div class="target-users">
                                <span v-if="!currentDetail.targetUsers || getDetailTargetUsers().length === 0" class="all-users">
                                    全体用户
                                </span>
                                <n-tag
                                    v-else
                                    v-for="(user, index) in getDetailTargetUsers()"
                                    :key="index"
                                    size="small"
                                    round
                                    type="info"
                                    class="user-tag"
                                >
                                    {{ user }}
                                </n-tag>
                            </div>
                        </n-descriptions-item>
                        <n-descriptions-item label="发布时间">
                            <div class="time-text">{{ formatTime(currentDetail.publishTime) }}</div>
                        </n-descriptions-item>
                        <n-descriptions-item label="创建时间">
                            <div class="time-text">{{ formatTime(currentDetail.createdAt) }}</div>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-card>

                <n-card :bordered="false" embedded class="detail-content-card">
                    <template #header>
                        <div class="content-header">
                            <n-icon :component="DocumentTextOutline" :size="20" />
                            <span>消息内容</span>
                        </div>
                    </template>
                    <div class="markdown-content-wrapper">
                        <div class="markdown-content" v-html="renderMarkdown(currentDetail.contentMd)" />
                    </div>
                </n-card>
            </n-space>
        </n-spin>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, h } from 'vue';
import {
    NCard,
    NSpace,
    NButton,
    NIcon,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NDatePicker,
    NAlert,
    NDataTable,
    NTag,
    NDescriptions,
    NDescriptionsItem,
    NSpin,
    useMessage,
    useDialog,
    FormInst,
    SelectOption,
    FormRules,
    DataTableColumns,
    PaginationProps,
    NDropdown,
} from 'naive-ui';
import {
    AddOutline,
    CreateOutline,
    TrashOutline,
    SearchOutline,
    RefreshOutline,
    EyeOutline,
    EllipsisVertical,
    DocumentTextOutline,
} from '@vicons/ionicons5';
import api from '@/api';
import type {
    CreateSystemMessageRequest,
    UpdateSystemMessageRequest,
    SystemMessage,
    SystemMessageListItem,
} from '@/api/v2/admin/admin';
import dayjs from 'dayjs';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

const message = useMessage();
const dialog = useDialog();

// 表单引用
const createFormRef = ref<FormInst | null>(null);
const editFormRef = ref<FormInst | null>(null);

// 状态管理
const loading = ref(false);
const createLoading = ref(false);
const editLoading = ref(false);
const detailLoading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const showPreviewModal = ref(false);
const isSearchMode = ref(false);

// 消息列表
const messages = ref<SystemMessageListItem[]>([]);
const currentDetail = ref<SystemMessage | null>(null);
const previewContent = ref<string>('');

// 处理targetUsers，可能是字符串或数组
const parseTargetUsers = (targetUsers: string[] | string | null): string[] | null => {
    if (targetUsers === null) {
        return null;
    }
    if (typeof targetUsers === 'string') {
        try {
            const parsed = JSON.parse(targetUsers);
            return Array.isArray(parsed) ? parsed : null;
        } catch (e) {
            return null;
        }
    }
    if (Array.isArray(targetUsers)) {
        return targetUsers;
    }
    return null;
};

// 搜索
const searchType = ref<'all' | 'title' | 'content' | 'id'>('all');
const searchKeyword = ref('');

// 分页配置
const pagination = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    pageSizes: [10, 20, 50, 100],
    showSizePicker: true,
    prefix: ({ itemCount }: { itemCount: number | undefined }) => `共 ${itemCount || 0} 条`,
} as PaginationProps);

// 搜索类型选项
const searchTypeOptions: SelectOption[] = [
    { label: '全部', value: 'all' },
    { label: '标题', value: 'title' },
    { label: '内容', value: 'content' },
    { label: 'ID', value: 'id' },
];

// 优先级选项
const priorityOptions: SelectOption[] = [
    { label: '普通 (1)', value: 1 },
    { label: '重要 (2)', value: 2 },
    { label: '紧急 (3)', value: 3 },
];

// 获取搜索类型标签
const getSearchTypeLabel = () => {
    const option = searchTypeOptions.find((opt) => opt.value === searchType.value);
    return option?.label || '搜索';
};

// 获取优先级标签
const getPriorityLabel = (priority: number) => {
    const option = priorityOptions.find((opt) => opt.value === priority);
    return option?.label || `优先级 ${priority}`;
};

// 获取优先级类型
const getPriorityType = (priority: number): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    if (priority === 3) return 'error';
    if (priority === 2) return 'warning';
    return 'info';
};

// 格式化时间
const formatTime = (time: string) => {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';
};

// 渲染Markdown
const renderMarkdown = (content: string) => {
    return content ? md.render(content) : '';
};

// 创建表单
const createForm = ref<{
    title: string;
    contentMd: string;
    priority: number;
    targetUsers: string[] | null;
    publishTime: number | null;
}>({
    title: '',
    contentMd: '',
    priority: 1,
    targetUsers: null,
    publishTime: null,
});

// 目标用户输入（用于创建）
const targetUsersInput = ref('');

// 监听目标用户输入变化，解析为数组
watch(targetUsersInput, (newVal) => {
    if (!newVal || newVal.trim() === '' || newVal.trim().toLowerCase() === 'null') {
        createForm.value.targetUsers = null;
    } else {
        try {
            const parsed = JSON.parse(newVal.trim());
            if (Array.isArray(parsed)) {
                createForm.value.targetUsers = parsed;
            } else {
                createForm.value.targetUsers = null;
            }
        } catch (e) {
            // 如果解析失败，暂时设置为null，表单验证会处理
            createForm.value.targetUsers = null;
        }
    }
});

// 编辑表单
const editForm = ref<{
    id: number;
    title: string | undefined;
    contentMd: string | undefined;
    priority: number | undefined;
    targetUsers: string[] | null | undefined;
    publishTime: number | null;
}>({
    id: 0,
    title: undefined,
    contentMd: undefined,
    priority: undefined,
    targetUsers: undefined,
    publishTime: null,
});

// 编辑目标用户输入
const editTargetUsersInput = ref('');

// 监听编辑目标用户输入变化
watch(editTargetUsersInput, (newVal) => {
    if (!newVal || newVal.trim() === '') {
        editForm.value.targetUsers = undefined;
    } else if (newVal.trim().toLowerCase() === 'null') {
        editForm.value.targetUsers = null;
    } else {
        try {
            const parsed = JSON.parse(newVal.trim());
            if (Array.isArray(parsed)) {
                editForm.value.targetUsers = parsed;
            } else {
                editForm.value.targetUsers = undefined;
            }
        } catch (e) {
            editForm.value.targetUsers = undefined;
        }
    }
});

// 表单验证规则
const createRules: FormRules = {
    title: [
        { required: true, message: '请输入消息标题', trigger: 'blur' },
        { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' },
    ],
    contentMd: [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
    targetUsers: [
        {
            validator: () => {
                if (
                    targetUsersInput.value &&
                    targetUsersInput.value.trim() !== '' &&
                    targetUsersInput.value.trim().toLowerCase() !== 'null'
                ) {
                    try {
                        const parsed = JSON.parse(targetUsersInput.value.trim());
                        if (!Array.isArray(parsed)) {
                            return new Error('目标用户必须是JSON数组格式');
                        }
                    } catch (e) {
                        return new Error('目标用户格式错误，请输入有效的JSON数组，如：["user1","user2"]');
                    }
                }
                return true;
            },
            trigger: 'blur',
        },
    ],
};

const editRules: FormRules = {
    title: [{ max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }],
    targetUsers: [
        {
            validator: () => {
                if (
                    editTargetUsersInput.value &&
                    editTargetUsersInput.value.trim() !== '' &&
                    editTargetUsersInput.value.trim().toLowerCase() !== 'null'
                ) {
                    try {
                        const parsed = JSON.parse(editTargetUsersInput.value.trim());
                        if (!Array.isArray(parsed)) {
                            return new Error('目标用户必须是JSON数组格式');
                        }
                    } catch (e) {
                        return new Error('目标用户格式错误，请输入有效的JSON数组，如：["user1","user2"]');
                    }
                }
                return true;
            },
            trigger: 'blur',
        },
    ],
};

// 表格列定义
const columns: DataTableColumns<SystemMessageListItem> = [
    {
        title: 'ID',
        key: 'id',
        width: 50,
        sorter: 'default',
    },
    {
        title: '标题',
        key: 'title',
        width: 120,
        ellipsis: {
            tooltip: true,
        },
    },
    {
        title: '优先级',
        key: 'priority',
        width: 100,
        align: 'center',
        render(row) {
            return h(
                NTag,
                {
                    type: getPriorityType(row.priority),
                    size: 'small',
                    round: true,
                },
                { default: () => getPriorityLabel(row.priority) }
            );
        },
    },
    {
        title: '目标用户',
        key: 'targetUsers',
        width: 100,
        ellipsis: {
            tooltip: true,
        },
        render(row) {
            const users = parseTargetUsers(row.targetUsers);
            if (users === null || users.length === 0) {
                return h('span', { style: { color: 'var(--n-text-color-3)' } }, '全体用户');
            }
            return h('span', users.join(', '));
        },
    },
    {
        title: '发布时间',
        key: 'publishTime',
        width: 180,
        render(row) {
            return formatTime(row.publishTime);
        },
    },
    {
        title: '创建时间',
        key: 'createdAt',
        width: 180,
        render(row) {
            return formatTime(row.createdAt);
        },
    },
    {
        title: '操作',
        key: 'actions',
        width: 65,
        fixed: 'right',
        render(row) {
            const options = [
                {
                    label: '查看详情',
                    key: 'detail',
                    icon: () => h(NIcon, { component: EyeOutline }),
                    props: {
                        onClick: () => handleViewDetail(row.id),
                    },
                },
                {
                    label: '编辑',
                    key: 'edit',
                    icon: () => h(NIcon, { component: CreateOutline }),
                    props: {
                        onClick: () => handleOpenEditModal(row),
                    },
                },
                {
                    type: 'divider',
                    key: 'd1',
                },
                {
                    label: '删除',
                    key: 'delete',
                    icon: () => h(NIcon, { component: TrashOutline }),
                    props: {
                        onClick: () => handleDeleteConfirm(row),
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
                                icon: () => h(NIcon, { component: EllipsisVertical, size: 18 }),
                            }
                        ),
                }
            );
        },
    },
];

// 获取消息列表
const fetchMessages = async () => {
    loading.value = true;
    try {
        const params: {
            page: number;
            size: number;
            type?: 'all' | 'title' | 'content' | 'id';
            value?: string;
        } = {
            page: pagination.page || 1,
            size: pagination.pageSize || 10,
        };

        if (isSearchMode.value && searchKeyword.value.trim() && searchType.value !== 'all') {
            params.type = searchType.value;
            params.value = searchKeyword.value.trim();
        }

        const res = await api.v2.admin.getSystemMessagesList(params);
        messages.value = res.data.messages;
        pagination.itemCount = res.data.total;
    } catch (error: any) {
        const msg = error?.message || '请求失败，请检查网络或联系管理员';
        message.error(msg);
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 处理分页变化
const handlePageChange = (page: number) => {
    pagination.page = page;
    fetchMessages();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchMessages();
};

// 搜索
const handleSearch = () => {
    if (!searchKeyword.value.trim() || searchType.value === 'all') {
        handleReset();
        return;
    }
    isSearchMode.value = true;
    pagination.page = 1;
    fetchMessages();
};

// 重置搜索
const handleReset = () => {
    searchKeyword.value = '';
    searchType.value = 'all';
    isSearchMode.value = false;
    pagination.page = 1;
    fetchMessages();
};

// 查看详情
const handleViewDetail = async (id: number) => {
    showDetailModal.value = true;
    detailLoading.value = true;
    try {
        const res = await api.v2.admin.getSystemMessageDetail(id);
        currentDetail.value = res.data;
    } catch (error: any) {
        message.error(`获取详情失败: ${error.message || '未知错误'}`);
        console.error(error);
        showDetailModal.value = false;
    } finally {
        detailLoading.value = false;
    }
};

// 预览编辑内容
const handlePreviewEditContent = () => {
    if (!editForm.value.contentMd || editForm.value.contentMd.trim() === '') {
        message.warning('请输入内容后再预览');
        return;
    }
    previewContent.value = editForm.value.contentMd;
    showPreviewModal.value = true;
};

// 获取详情中的目标用户数组
const getDetailTargetUsers = (): string[] => {
    if (!currentDetail.value) return [];
    const users = parseTargetUsers(currentDetail.value.targetUsers);
    return users || [];
};

// 打开创建模态框
const handleOpenCreateModal = () => {
    createForm.value = {
        title: '',
        contentMd: '',
        priority: 1,
        targetUsers: null,
        publishTime: null,
    };
    targetUsersInput.value = '';
    showCreateModal.value = true;
};

// 打开编辑模态框
const handleOpenEditModal = async (msg?: SystemMessageListItem) => {
    if (msg) {
        // 从列表中选择的消息，需要先获取详情（包含contentMd）
        try {
            const detailRes = await api.v2.admin.getSystemMessageDetail(msg.id);
            const detail = detailRes.data;
            const users = parseTargetUsers(msg.targetUsers);
            editForm.value = {
                id: detail.id,
                title: detail.title,
                contentMd: detail.contentMd,
                priority: detail.priority,
                targetUsers: detail.targetUsers,
                publishTime: detail.publishTime ? dayjs(detail.publishTime).valueOf() : null,
            };
            editTargetUsersInput.value = users ? JSON.stringify(users) : '';
            showEditModal.value = true;
        } catch (error: any) {
            message.error(`获取消息详情失败: ${error.message || '未知错误'}`);
            console.error(error);
        }
    } else {
        // 需要输入ID的情况（保留兼容）
        editForm.value = {
            id: 0,
            title: undefined,
            contentMd: undefined,
            priority: undefined,
            targetUsers: undefined,
            publishTime: null,
        };
        editTargetUsersInput.value = '';
        showEditModal.value = true;
    }
};

// 删除确认
const handleDeleteConfirm = (msg: SystemMessageListItem) => {
    dialog.warning({
        title: '确认删除',
        content: `确定要删除消息"${msg.title}"（ID: ${msg.id}）吗？此操作不可恢复！`,
        positiveText: '确认删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                await api.v2.admin.deleteSystemMessage(msg.id);
                message.success('消息删除成功');
                fetchMessages();
            } catch (error: any) {
                message.error(`删除失败: ${error.message || '未知错误'}`);
                console.error('删除消息失败:', error);
            }
        },
    });
};

// 创建消息
const handleCreate = async () => {
    if (!createFormRef.value) return;

    try {
        await createFormRef.value.validate();

        createLoading.value = true;

        const request: CreateSystemMessageRequest = {
            title: createForm.value.title,
            contentMd: createForm.value.contentMd,
            priority: createForm.value.priority,
            targetUsers: createForm.value.targetUsers,
        };

        // 如果有发布时间，格式化为字符串
        if (createForm.value.publishTime) {
            request.publishTime = dayjs(createForm.value.publishTime).format('YYYY-MM-DD HH:mm:ss');
        }

        await api.v2.admin.createSystemMessage(request);

        message.success('消息创建成功');
        showCreateModal.value = false;

        // 重置表单
        createForm.value = {
            title: '',
            contentMd: '',
            priority: 1,
            targetUsers: null,
            publishTime: null,
        };
        targetUsersInput.value = '';

        // 刷新列表
        fetchMessages();
    } catch (error: any) {
        if (error?.message && !error.message.includes('验证')) {
            message.error(`创建失败: ${error.message}`);
        }
        console.error('创建消息失败:', error);
    } finally {
        createLoading.value = false;
    }
};

// 编辑消息
const handleEdit = async () => {
    if (!editFormRef.value) return;

    try {
        await editFormRef.value.validate();

        if (!editForm.value.id || editForm.value.id < 1) {
            message.error('消息ID无效');
            return;
        }

        editLoading.value = true;

        const request: UpdateSystemMessageRequest = {
            id: editForm.value.id,
        };

        // 只添加有值的字段
        if (editForm.value.title !== undefined && editForm.value.title !== '') {
            request.title = editForm.value.title;
        }
        if (editForm.value.contentMd !== undefined && editForm.value.contentMd !== '') {
            request.contentMd = editForm.value.contentMd;
        }
        if (editForm.value.priority !== undefined && editForm.value.priority !== null) {
            request.priority = editForm.value.priority;
        }
        if (editForm.value.targetUsers !== undefined) {
            request.targetUsers = editForm.value.targetUsers;
        }
        if (editForm.value.publishTime) {
            request.publishTime = dayjs(editForm.value.publishTime).format('YYYY-MM-DD HH:mm:ss');
        }

        await api.v2.admin.updateSystemMessage(request);

        message.success('消息更新成功');
        showEditModal.value = false;

        // 重置表单
        editForm.value = {
            id: 0,
            title: undefined,
            contentMd: undefined,
            priority: undefined,
            targetUsers: undefined,
            publishTime: null,
        };
        editTargetUsersInput.value = '';

        // 刷新列表
        fetchMessages();
    } catch (error: any) {
        if (error?.message && !error.message.includes('验证')) {
            message.error(`更新失败: ${error.message}`);
        }
        console.error('更新消息失败:', error);
    } finally {
        editLoading.value = false;
    }
};

// 页面加载时获取数据
onMounted(() => {
    fetchMessages();
});
</script>

<style scoped>
.detail-id {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-weight: 600;
    color: var(--n-text-color-2);
}

.detail-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--n-text-color);
}

.target-users {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.all-users {
    color: var(--n-text-color-2);
    font-style: italic;
}

.user-tag {
    margin: 0;
}

.time-text {
    color: var(--n-text-color-2);
    font-size: 13px;
}

/* 详情内容卡片 */
.detail-content-card {
    margin-top: 16px;
}

.content-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 500;
    color: var(--n-text-color);
}

.markdown-content-wrapper {
    padding: 4px 0;
}

/* Markdown 样式 */
.markdown-content {
    font-size: 15px;
    line-height: 1.8;
    color: var(--n-text-color);
    word-wrap: break-word;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    color: var(--n-text-color);
    line-height: 1.5;
}

.markdown-content :deep(h1) {
    font-size: 24px;
    border-bottom: 2px solid var(--n-border-color);
    padding-bottom: 8px;
}

.markdown-content :deep(h2) {
    font-size: 20px;
}

.markdown-content :deep(h3) {
    font-size: 18px;
}

.markdown-content :deep(p) {
    margin: 12px 0;
    color: var(--n-text-color);
}

.markdown-content :deep(strong) {
    font-weight: 600;
    color: var(--n-text-color);
}

.markdown-content :deep(em) {
    font-style: italic;
    color: var(--n-text-color);
}

.markdown-content :deep(code) {
    background: var(--n-code-color);
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    color: var(--n-text-color);
}

.markdown-content :deep(pre) {
    background: var(--n-code-color);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    border: 1px solid var(--n-border-color);
}

.markdown-content :deep(pre code) {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 0.9em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
    margin: 12px 0;
    padding-left: 28px;
    color: var(--n-text-color);
}

.markdown-content :deep(li) {
    margin: 6px 0;
    color: var(--n-text-color);
}

.markdown-content :deep(blockquote) {
    border-left: 4px solid var(--n-border-color);
    padding: 12px 16px;
    margin: 16px 0;
    background: var(--n-color-embedded);
    border-radius: 4px;
    color: var(--n-text-color-2);
}

.markdown-content :deep(blockquote p) {
    margin: 0;
}

/* 链接样式 - 不使用紫色，使用文本颜色 */
.markdown-content :deep(a) {
    color: var(--n-text-color);
    text-decoration: underline;
    text-decoration-color: var(--n-text-color-3);
    text-underline-offset: 2px;
    transition: all 0.2s ease;
}

.markdown-content :deep(a:hover) {
    color: var(--n-text-color-1);
    text-decoration-color: var(--n-text-color-2);
}

.markdown-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    border: 1px solid var(--n-border-color);
    border-radius: 8px;
    overflow: hidden;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
    border: 1px solid var(--n-border-color);
    padding: 12px;
    text-align: left;
    color: var(--n-text-color);
}

.markdown-content :deep(th) {
    background: var(--n-color-embedded);
    font-weight: 600;
}

.markdown-content :deep(tr:nth-child(even)) {
    background: var(--n-color-embedded);
}

.markdown-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
}

.markdown-content :deep(hr) {
    border: none;
    border-top: 1px solid var(--n-border-color);
    margin: 24px 0;
}
</style>
