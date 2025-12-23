<template>
    <n-card title="使用兑换码">
        <template #header-extra> </template>
        <n-form ref="formRef" :model="model" label-placement="left" label-width="auto">
            <n-form-item path="exchangeCode" label="兑换码" :show-require-mark="true">
                <n-input placeholder="请输入兑换码" v-model:value="model.exchangeCode" round />
            </n-form-item>
            <n-row :gutter="[0, 24]">
                <n-col :span="24">
                    <div style="display: flex; justify-content: flex-end">
                        <n-button quaternary round :loading="historyLoading" @click="onViewHistory">
                            查看历史
                        </n-button>
                        <n-button
                            :loading="loading"
                            :disabled="model.exchangeCode === null || loading"
                            round
                            type="primary"
                            @click="handleSubmit"
                        >
                            兑换
                        </n-button>
                    </div>
                </n-col>
            </n-row>
        </n-form>
    </n-card>

    <!-- 历史记录模态框 -->
    <n-modal
        v-model:show="showHistoryModal"
        preset="card"
        title="礼品卡使用历史"
        style="max-width: 800px"
        :bordered="false"
        size="huge"
    >
        <n-empty v-if="!historyData || historyData.length === 0" description="暂无使用记录" />
        <n-data-table
            v-else
            :columns="historyColumns"
            :data="historyData"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
        />
    </n-modal>
</template>

<script lang="ts" setup>
import { ref, h } from 'vue';
import { FormInst, NTag, NText, DataTableColumns } from 'naive-ui';
import type { GiftcardHistoryItem } from '@/api/v2/giftcard/giftcard';

interface Props {
    loading: boolean;
    model: {
        exchangeCode: string | null;
    };
    onSubmit: () => void;
    historyLoading?: boolean;
    historyData?: GiftcardHistoryItem[];
    onViewHistory?: () => void;
}

const props = defineProps<Props>();

const formRef = ref<FormInst | null>(null);
const showHistoryModal = ref(false);

const handleSubmit = () => {
    props.onSubmit();
};

const onViewHistory = () => {
    if (props.onViewHistory) {
        props.onViewHistory();
    }
    showHistoryModal.value = true;
};

// 格式化时间
const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

// 历史记录表格列配置
const historyColumns: DataTableColumns<GiftcardHistoryItem> = [
    {
        title: '使用时间',
        key: 'usageTime',
        render: (row) => formatTime(row.usageTime),
        width: 180,
    },
    {
        title: '奖励类型',
        key: 'rewardType',
        render: (row) => {
            const type = row.rewardType === '会员' ? 'success' : 'info';
            return h(NTag, { type, size: 'small' }, () => row.rewardType);
        },
        width: 100,
    },
    {
        title: '内容',
        key: 'content',
        render: (row) => {
            if (row.rewardType === '会员') {
                return h('div', [
                    h(NText, { strong: true }, () => row.memberType),
                    h(NText, null, () => ` - ${row.memberDays} 天`),
                ]);
            } else {
                return h('div', [
                    h(NText, null, () => '积分：'),
                    h(NText, { type: 'success', strong: true }, () => `+${row.points}`),
                ]);
            }
        },
    },
    {
        title: '卡片ID',
        key: 'cardId',
        width: 100,
    },
];

defineExpose({
    formRef,
});
</script>
