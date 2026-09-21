<template>
    <n-card title="封禁记录" :bordered="false">
        <template #header-extra>
            <n-tag v-if="records.length" :bordered="false" size="small" round type="error">
                共 {{ records.length }} 条
            </n-tag>
        </template>

        <n-alert v-if="records.length" type="warning" :bordered="false" class="ban-alert">
            如对封禁处理有异议，可点击对应记录右侧的「申诉」按钮提交申诉材料，我们会复核后通过您填写的联系方式回复。
        </n-alert>

        <n-data-table
            :columns="columns"
            :data="records"
            :bordered="false"
            :row-key="rowKey"
            :scroll-x="1230"
            striped
        />
    </n-card>

    <BanAppealModal v-model:show="showAppealModal" :record="appealRecord" @submitted="handleAppealSubmitted" />
</template>

<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import { NButton, NTag, NTooltip, type DataTableColumns } from 'naive-ui';
import { formatApiDateTime } from '@/utils/formatApiDateTime';
import BanAppealModal from './BanAppealModal.vue';
import {
    BAN_APPEAL_STATUS_LABEL,
    BAN_APPEAL_STATUS_TAG,
    BAN_TYPE_LABEL,
    BAN_TYPE_TAG,
    canSubmitAppeal,
    type BanRecord,
} from '../constants';

// TODO: 待接入封禁记录查询接口后替换为服务端数据
const records = ref<BanRecord[]>([
    {
        id: 1024,
        type: 'porn',
        tunnelName: 'web-tunnel',
        url: 'https://web-01.example.com/img',
        nodeName: '香港-01',
        reason: '隧道指向的站点存在色情内容，违反服务条款第 3.2 条',
        bannedAt: '2026-09-12 14:32:10',
        appealStatus: 'none',
    },
    {
        id: 987,
        type: 'site',
        tunnelName: 'mc-server',
        url: 'https://mc.example.com:25565',
        nodeName: '上海-03',
        reason: '隧道被用于搭建未备案的违规站点',
        bannedAt: '2026-08-30 09:05:44',
        appealStatus: 'rejected',
    },
    {
        id: 902,
        type: 'other',
        tunnelName: 'api-test',
        url: 'https://api.example.com/v1/report',
        nodeName: '北京-02',
        reason: '长时间大带宽占用，影响节点其他用户使用',
        bannedAt: '2026-08-11 21:48:03',
        appealStatus: 'pending',
    },
]);

const showAppealModal = ref(false);
const appealRecord = ref<BanRecord | null>(null);

const rowKey = (row: BanRecord) => row.id;

const openAppeal = (row: BanRecord) => {
    appealRecord.value = row;
    showAppealModal.value = true;
};

// 提交成功后回写本地申诉状态（后端接口接入后应改为重新拉取列表）
const handleAppealSubmitted = () => {
    if (appealRecord.value) {
        appealRecord.value.appealStatus = 'pending';
    }
};

const renderAppealAction = (row: BanRecord) => {
    if (canSubmitAppeal(row.appealStatus)) {
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
            default: () => `${BAN_APPEAL_STATUS_LABEL[row.appealStatus]}，暂不可再次申诉`,
        }
    );
};

const columns = computed<DataTableColumns<BanRecord>>(() => [
    {
        title: '封禁时间',
        key: 'bannedAt',
        width: 170,
        ellipsis: { tooltip: true },
        render: (row) => formatApiDateTime(row.bannedAt),
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
        key: 'tunnelName',
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
        key: 'nodeName',
        width: 130,
        ellipsis: { tooltip: true },
        render: (row) => h('span', { class: 'ban-mono' }, row.nodeName || '-'),
    },
    {
        title: '封禁原因',
        key: 'reason',
        width: 220,
        ellipsis: { tooltip: true },
    },
    {
        title: '申诉状态',
        key: 'appealStatus',
        width: 110,
        align: 'center',
        render: (row) =>
            h(
                NTag,
                { type: BAN_APPEAL_STATUS_TAG[row.appealStatus], size: 'small', round: true },
                { default: () => BAN_APPEAL_STATUS_LABEL[row.appealStatus] }
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
