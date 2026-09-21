<template>
    <n-card title="封禁记录" :bordered="false">
        <template #header-extra>
            <n-space align="center" :size="8">
                <n-tag v-if="records.length" :bordered="false" size="small" round type="error">
                    共 {{ records.length }} 条
                </n-tag>
                <n-button size="small" quaternary :loading="loading" @click="loadRecords">
                    <template #icon>
                        <n-icon :component="RefreshOutline" />
                    </template>
                    刷新
                </n-button>
            </n-space>
        </template>

        <n-alert v-if="records.length" type="warning" :bordered="false" class="ban-alert">
            如对封禁处理有异议，可点击对应记录右侧的「申诉」按钮提交申诉材料，我们会复核后通过您填写的联系方式回复。
        </n-alert>

        <n-data-table
            :columns="columns"
            :data="records"
            :loading="loading"
            :bordered="false"
            :row-key="rowKey"
            :scroll-x="1230"
            striped
        />
    </n-card>

    <BanAppealModal v-model:show="showAppealModal" :record="appealRecord" @submitted="loadRecords" />
</template>

<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NIcon, NTag, NTooltip, useMessage, type DataTableColumns } from 'naive-ui';
import { RefreshOutline } from '@vicons/ionicons5';
import { formatApiDateTime } from '@/utils/formatApiDateTime';
import { getMyBanRecords, type MyBanRecord } from '@/api/v2/user/violation';
import BanAppealModal from './BanAppealModal.vue';
import {
    BAN_APPEAL_STATUS_LABEL,
    BAN_APPEAL_STATUS_TAG,
    BAN_TYPE_LABEL,
    BAN_TYPE_TAG,
} from '../constants';

const message = useMessage();

const records = ref<MyBanRecord[]>([]);
const loading = ref(false);
const showAppealModal = ref(false);
const appealRecord = ref<MyBanRecord | null>(null);

const rowKey = (row: MyBanRecord) => row.id;

const loadRecords = async () => {
    loading.value = true;
    try {
        const response = await getMyBanRecords();
        records.value = response.data?.ban_records ?? [];
    } catch (error: any) {
        records.value = [];
        message.error(error?.message || '加载封禁记录失败');
    } finally {
        loading.value = false;
    }
};

const openAppeal = (row: MyBanRecord) => {
    appealRecord.value = row;
    showAppealModal.value = true;
};

// 已解封的记录直接展示「已解封」，其余展示最近一次申诉的状态
const statusLabel = (row: MyBanRecord) =>
    row.unbanned_at ? '已解封' : BAN_APPEAL_STATUS_LABEL[row.appeal_status];

const statusTagType = (row: MyBanRecord) =>
    row.unbanned_at ? 'success' : BAN_APPEAL_STATUS_TAG[row.appeal_status];

const disabledAppealTip = (row: MyBanRecord) => {
    if (row.unbanned_at) {
        return '该封禁记录已解封，无需申诉';
    }
    if (row.appeal_status === 'pending') {
        return '申诉审核中，暂不可重复提交';
    }
    if (row.appeal_status === 'approved') {
        return '申诉已通过，无需再次提交';
    }
    return '当前不可提交申诉';
};

const renderAppealAction = (row: MyBanRecord) => {
    if (row.can_appeal) {
        return h(
            NButton,
            { size: 'small', type: 'primary', tertiary: true, onClick: () => openAppeal(row) },
            { default: () => '申诉' }
        );
    }
    return h(
        NTooltip,
        { trigger: 'hover' },
        {
            trigger: () =>
                h(
                    NButton,
                    { size: 'small', tertiary: true, disabled: true },
                    { default: () => '申诉' }
                ),
            default: () => disabledAppealTip(row),
        }
    );
};

const columns = computed<DataTableColumns<MyBanRecord>>(() => [
    {
        title: '封禁时间',
        key: 'banned_at',
        width: 170,
        ellipsis: { tooltip: true },
        render: (row) => formatApiDateTime(row.banned_at),
    },
    {
        title: '违规类型',
        key: 'type',
        width: 110,
        align: 'center',
        render: (row) =>
            h(
                NTag,
                { type: BAN_TYPE_TAG[row.type], size: 'small', round: true },
                { default: () => BAN_TYPE_LABEL[row.type] }
            ),
    },
    {
        title: '违规隧道',
        key: 'tunnel_name',
        width: 160,
        ellipsis: { tooltip: true },
    },
    {
        title: '违规URL',
        key: 'url',
        width: 240,
        ellipsis: { tooltip: true },
    },
    {
        title: '所属节点',
        key: 'node_name',
        width: 130,
        ellipsis: { tooltip: true },
        render: (row) => h('span', { class: 'ban-mono' }, row.node_name || '-'),
    },
    {
        title: '封禁原因',
        key: 'reason',
        width: 220,
        ellipsis: { tooltip: true },
    },
    {
        title: '申诉状态',
        key: 'appeal_status',
        width: 110,
        align: 'center',
        render: (row) =>
            h(
                NTag,
                { type: statusTagType(row), size: 'small', round: true },
                { default: () => statusLabel(row) }
            ),
    },
    {
        title: '操作',
        key: 'actions',
        width: 90,
        align: 'center',
        fixed: 'right',
        render: renderAppealAction,
    },
]);

onMounted(loadRecords);
</script>

<style scoped lang="scss">
.ban-alert {
    margin-bottom: 12px;
}

:deep(.ban-mono) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: var(--n-text-color-2);
}
</style>
