<template>
    <n-back-top :right="100" />
    <n-card title="用户日志">
        <n-alert title="提示" type="info">
            平台仅保留近180天的操作日志供在线查询。超出此期限的日志已被归档封存。若有审计或合规等需要，请向
            support@chcat.cn 发送邮件提交查询申请。
        </n-alert>
        <!-- 搜索筛选区域 -->
        <div style="margin-bottom: 16px; margin-top: 16px">
            <n-space>
                <n-date-picker
                    v-model:value="dateRange"
                    type="datetimerange"
                    clearable
                    placeholder="选择时间范围"
                    :is-date-disabled="disablePreviousDate"
                />
                <n-select
                    v-model:value="selectedCategory"
                    :options="categoryOptions"
                    placeholder="选择操作分类"
                    clearable
                    style="width: 150px"
                />
                <n-select
                    v-model:value="selectedAction"
                    :options="actionOptions"
                    placeholder="选择操作类型"
                    clearable
                    style="width: 200px"
                    :disabled="!selectedCategory"
                />
                <n-button type="primary" @click="handleSearch" :loading="loading"> 查询 </n-button>
                <n-button @click="handleReset"> 重置 </n-button>
            </n-space>
        </div>

        <!-- 数据表格 -->
        <n-data-table
            :columns="columns"
            :data="logs"
            :pagination="pagination"
            :loading="loading"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
            :remote="true"
            :scroll-x="1200"
            striped
        />
    </n-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, h, computed, watch } from 'vue';
import {
    NDataTable,
    NDatePicker,
    NSelect,
    NButton,
    NSpace,
    NCard,
    NTag,
    NBackTop,
    useMessage,
    NTooltip,
} from 'naive-ui';
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import type { LogItem } from '@/api/v2/user/user';

const message = useMessage();
const userStore = useUserStore();
const userInfo = userStore.userInfo;

// 获取屏幕宽度
const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 时间范围
const dateRange = ref<[number, number] | null>(null);

// 选中的操作分类
const selectedCategory = ref<string | null>(null);

// 选中的操作类型
const selectedAction = ref<string | null>(null);

// 操作分类选项
const categoryOptions = [
    { label: '账户相关', value: 'account' },
    { label: '隧道相关', value: 'tunnel' },
    { label: '域名相关', value: 'domain' },
];

// 操作类型选项（根据分类动态更新）
const actionOptions = computed(() => {
    if (!selectedCategory.value) {
        return [];
    }

    const actions: Record<string, Array<{ label: string; value: string }>> = {
        account: [
            { label: '登录', value: 'login' },
            { label: '邮箱验证码登录', value: 'email_code_login' },
            { label: '重置密码', value: 'reset_password' },
            { label: '重置Token', value: 'reset_token' },
            { label: '修改邮箱', value: 'reset_email' },
        ],
        tunnel: [
            { label: '创建隧道', value: 'create_tunnel' },
            { label: '删除隧道', value: 'delete_tunnel' },
            { label: '更新隧道', value: 'update_tunnel' },
            { label: '下线单个隧道', value: 'offline_tunnel' },
            { label: '下线所有隧道', value: 'offline_all_tunnels' },
        ],
        domain: [
            { label: '创建免费二级域名', value: 'create_free_subdomain' },
            { label: '删除免费二级域名', value: 'delete_free_subdomain' },
            { label: '修改免费二级域名', value: 'update_free_subdomain' },
        ],
    };

    return actions[selectedCategory.value] || [];
});

// 当分类改变时，清空操作类型选择
watch(selectedCategory, () => {
    selectedAction.value = null;
});

// 日志数据
const logs = ref<LogItem[]>([]);

// 加载状态
const loading = ref(false);

// 分页前缀函数（根据屏幕宽度自适应）
const paginationPrefix = ({ itemCount }: { itemCount: number | undefined }): string => {
    // 手机端不显示前缀文本
    if (screenWidth.value < 600) {
        return '';
    }
    const count = itemCount || 0;
    return `共 ${count} 条记录`;
};

// 分页配置
const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    showSizePicker: true,
    showQuickJumper: true,
    itemCount: 0,
    prefix: paginationPrefix,
});

// 操作类型显示映射
const actionDisplayMap: Record<string, string> = {
    login: '登录',
    reset_password: '重置密码',
    reset_token: '重置Token',
    reset_email: '修改邮箱',
    create_tunnel: '创建隧道',
    delete_tunnel: '删除隧道',
    update_tunnel: '更新隧道',
    offline_tunnel: '下线单个隧道',
    offline_all_tunnels: '下线所有隧道',
    create_free_subdomain: '创建免费二级域名',
    delete_free_subdomain: '删除免费二级域名',
    update_free_subdomain: '修改免费二级域名',
};

// 操作类型颜色映射
const actionTypeMap: Record<string, { type: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
    login: { type: 'info' },
    reset_password: { type: 'warning' },
    reset_token: { type: 'warning' },
    reset_email: { type: 'warning' },
    create_tunnel: { type: 'success' },
    delete_tunnel: { type: 'error' },
    update_tunnel: { type: 'warning' },
    offline_tunnel: { type: 'warning' },
    offline_all_tunnels: { type: 'error' },
    create_free_subdomain: { type: 'success' },
    delete_free_subdomain: { type: 'error' },
    update_free_subdomain: { type: 'warning' },
};

// 分类显示映射
const categoryDisplayMap: Record<string, string> = {
    account: '账户相关',
    tunnel: '隧道相关',
    domain: '域名相关',
};

// 表格列定义
const columns: DataTableColumns<LogItem> = [
    {
        title: 'ID',
        key: 'id',
        width: 80,
        fixed: 'left',
    },
    {
        title: '操作分类',
        key: 'category',
        width: 100,
        render(row) {
            const categoryText = categoryDisplayMap[row.category] || row.category;
            return h(NTag, { type: 'default', size: 'small', round: true }, { default: () => categoryText });
        },
    },
    {
        title: '操作类型',
        key: 'action',
        width: 150,
        render(row) {
            const actionText = actionDisplayMap[row.action] || row.action;
            const config = actionTypeMap[row.action] || { type: 'default' };
            return h(NTag, { type: config.type, size: 'small', round: true }, { default: () => actionText });
        },
    },
    {
        title: 'IP地址',
        key: 'ip_address',
        width: 200,
        render(row) {
            const address = row.address || '-';
            const ipAddress = row.ip_address || '-';
            const tooltipContent = `地址: ${address}\nIP: ${ipAddress}`;
            return h(
                NTooltip,
                {
                    trigger: 'hover',
                },
                {
                    trigger: () => h('span', { style: { cursor: 'default' } }, address),
                    default: () => h('div', { style: { whiteSpace: 'pre-line' } }, tooltipContent),
                }
            );
        },
        ellipsis: {
            tooltip: true,
        },
    },
    {
        title: 'User Agent',
        key: 'user_agent',
        width: 300,
        ellipsis: {
            tooltip: true,
        },
    },
    {
        title: '状态',
        key: 'status',
        width: 100,
        render(row) {
            const statusType = row.status === 'success' ? 'success' : 'error';
            const statusText = row.status === 'success' ? '成功' : '失败';
            return h(NTag, { type: statusType, size: 'small', round: true }, { default: () => statusText });
        },
    },
    {
        title: '资源名称',
        key: 'resource_name',
        width: 200,
        render(row) {
            return row.resource_name || '-';
        },
    },
    {
        title: '时间',
        key: 'timestamp',
        width: 180,
        render(row) {
            if (!row.timestamp) return '-';
            const date = new Date(row.timestamp);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        },
    },
];

// 禁用未来日期
const disablePreviousDate = (timestamp: number) => {
    return timestamp > Date.now();
};

// 格式化时间为 API 需要的格式 (yyyy-MM-dd HH:mm:ss)
const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取日志数据
const fetchLogs = async () => {
    if (!userInfo?.usertoken) {
        message.error('请先登录');
        return;
    }

    loading.value = true;
    try {
        const params: any = {
            token: userInfo.usertoken,
            page: pagination.page || 1,
            size: pagination.pageSize || 10,
        };

        // 添加筛选条件
        if (selectedCategory.value) {
            params.category = selectedCategory.value;
        }
        if (selectedAction.value) {
            params.action = selectedAction.value;
        }
        if (dateRange.value && dateRange.value.length === 2) {
            params.start_time = formatDateTime(dateRange.value[0]);
            params.end_time = formatDateTime(dateRange.value[1]);
        }

        const response = await api.v2.user.getUserLogs(params);

        logs.value = response.data.logs;
        pagination.itemCount = response.data.total;
    } catch (error: any) {
        const msg = error?.message || '获取日志失败，请检查网络或联系管理员';
        message.error(msg);
        console.error(error);
        logs.value = [];
        pagination.itemCount = 0;
    } finally {
        loading.value = false;
    }
};

// 处理分页变化
const handlePageChange = (page: number) => {
    pagination.page = page;
    fetchLogs();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1; // 回到第一页
    fetchLogs();
};

// 查询日志
const handleSearch = () => {
    pagination.page = 1; // 重置到第一页
    fetchLogs();
};

// 重置筛选条件
const handleReset = () => {
    dateRange.value = null;
    selectedCategory.value = null;
    selectedAction.value = null;
    pagination.page = 1;
    fetchLogs();
};

// 组件挂载时加载数据
onMounted(() => {
    fetchLogs();
});
</script>
