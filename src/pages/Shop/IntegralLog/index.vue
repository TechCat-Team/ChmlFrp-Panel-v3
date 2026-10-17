<template>
    <n-back-top :right="100" />
    <n-card title="积分明细">
        <div style="margin-bottom: 16px">
            <n-space>
                <n-select
                    v-model:value="selectedType"
                    :options="typeOptions"
                    placeholder="收支类型"
                    clearable
                    style="width: 140px"
                />
                <n-select
                    v-model:value="selectedSource"
                    :options="sourceOptions"
                    placeholder="变动来源"
                    clearable
                    style="width: 160px"
                />
                <n-date-picker
                    v-model:value="dateRange"
                    type="datetimerange"
                    clearable
                    placeholder="选择时间范围"
                    :is-date-disabled="disableFutureDate"
                />
                <n-button type="primary" :loading="loading" @click="handleSearch"> 查询 </n-button>
                <n-button @click="handleReset"> 重置 </n-button>
            </n-space>
        </div>

        <n-data-table
            :columns="columns"
            :data="logs"
            :pagination="pagination"
            :loading="loading"
            :remote="true"
            :scroll-x="1100"
            striped
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
        />
    </n-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, h } from 'vue';
import {
    NBackTop,
    NButton,
    NCard,
    NDataTable,
    NDatePicker,
    NSelect,
    NSpace,
    NTag,
    useMessage,
} from 'naive-ui';
import type { DataTableColumns, PaginationProps } from 'naive-ui';
import { storeToRefs } from 'pinia';
import api from '@/api';
import type { IntegralLogItem, GetIntegralLogsParams } from '@/api/v2/integral/integral';
import { useScreenStore } from '@/stores/useScreen';

const message = useMessage();

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 筛选条件
const selectedType = ref<'收入' | '支出' | null>(null);
const selectedSource = ref<string | null>(null);
const dateRange = ref<[number, number] | null>(null);

const typeOptions = [
    { label: '收入', value: '收入' },
    { label: '支出', value: '支出' },
];

const sourceOptions = [
    { label: '充值', value: '充值' },
    { label: '签到', value: '签到' },
    { label: '礼品卡', value: '礼品卡' },
    { label: '套餐购买', value: '套餐购买' },
    { label: '套餐升级', value: '套餐升级' },
    { label: '证书删除', value: '证书删除' },
    { label: '积分兑换', value: '积分兑换' },
    { label: '管理员调整', value: '管理员调整' },
];

// 数据
const logs = ref<IntegralLogItem[]>([]);
const loading = ref(false);

const paginationPrefix = ({ itemCount }: { itemCount: number | undefined }): string => {
    if (screenWidth.value < 600) {
        return '';
    }
    return `共 ${itemCount || 0} 条记录`;
};

const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    showSizePicker: true,
    showQuickJumper: true,
    itemCount: 0,
    prefix: paginationPrefix,
});

const disableFutureDate = (timestamp: number) => timestamp > Date.now();

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

const formatLogTime = (value: string): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const columns: DataTableColumns<IntegralLogItem> = [
    {
        title: '时间',
        key: 'createTime',
        width: 180,
        render: (row) => formatLogTime(row.createTime),
    },
    {
        title: '类型',
        key: 'changeType',
        width: 90,
        render(row) {
            const isIncome = row.changeType === '收入';
            return h(
                NTag,
                { type: isIncome ? 'success' : 'warning', size: 'small', round: true },
                { default: () => row.changeType }
            );
        },
    },
    {
        title: '来源',
        key: 'source',
        width: 120,
        render: (row) => h(NTag, { type: 'default', size: 'small', round: true }, { default: () => row.source }),
    },
    {
        title: '变动积分',
        key: 'amount',
        width: 120,
        render(row) {
            const isIncome = row.changeType === '收入';
            return h(
                'span',
                { style: { color: isIncome ? '#18a058' : '#d03050', fontWeight: 600 } },
                `${isIncome ? '+' : '-'}${row.amount}`
            );
        },
    },
    {
        title: '变动前',
        key: 'balanceBefore',
        width: 110,
    },
    {
        title: '变动后',
        key: 'balanceAfter',
        width: 110,
    },
    {
        title: '说明',
        key: 'description',
        minWidth: 200,
        ellipsis: { tooltip: true },
        render: (row) => row.description || '-',
    },
    {
        title: '关联单号',
        key: 'relatedId',
        width: 220,
        ellipsis: { tooltip: true },
        render: (row) => row.relatedId || '-',
    },
];

const fetchLogs = async () => {
    loading.value = true;
    try {
        const params: GetIntegralLogsParams = {
            page: pagination.page || 1,
            size: pagination.pageSize || 10,
        };
        if (selectedType.value) {
            params.type = selectedType.value;
        }
        if (selectedSource.value) {
            params.source = selectedSource.value;
        }
        if (dateRange.value && dateRange.value.length === 2) {
            params.start_time = formatDateTime(dateRange.value[0]);
            params.end_time = formatDateTime(dateRange.value[1]);
        }

        const response = await api.v2.integral.getIntegralLogs(params);
        logs.value = response.data.logs;
        pagination.itemCount = response.data.total;
    } catch (error: any) {
        message.error(error?.message || '获取积分明细失败，请稍后重试');
        console.error(error);
        logs.value = [];
        pagination.itemCount = 0;
    } finally {
        loading.value = false;
    }
};

const handlePageChange = (page: number) => {
    pagination.page = page;
    fetchLogs();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    fetchLogs();
};

const handleSearch = () => {
    pagination.page = 1;
    fetchLogs();
};

const handleReset = () => {
    selectedType.value = null;
    selectedSource.value = null;
    dateRange.value = null;
    pagination.page = 1;
    fetchLogs();
};

onMounted(() => {
    fetchLogs();
});
</script>
