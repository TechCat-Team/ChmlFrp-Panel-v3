<template>
    <n-card size="small">
        <template #header>
            {{ card.name }}
            <span style="color: gray; font-size: 14px">{{ card.id }}</span>
        </template>
        <template #header-extra>
            <n-tooltip trigger="hover">
                <template #trigger>
                    <n-tag round :bordered="false" :type="card.status?.type">
                        {{ card.status?.label }}
                    </n-tag>
                </template>
                {{ card.status?.description }}
            </n-tooltip>
        </template>
        <n-thing content-style="margin-top: 10px;">
            <template #description>
                <n-space size="small" style="margin-top: 4px">
                    <n-tag
                        round
                        v-for="(tag, tagIndex) in card.tags"
                        :key="tagIndex"
                        :bordered="false"
                        type="primary"
                        size="small"
                    >
                        {{ tag }}
                    </n-tag>
                </n-space>
            </template>
            <a
                v-if="card.type === 'tcp' || card.type === 'udp'"
                @click="handleCopyAddress(card.ip + ':' + card.dorp)"
                style="cursor: pointer; color: inherit"
            >
                连接地址：{{ card.ip }}:{{ card.dorp }}
            </a>
            <a v-else @click="handleCopyAddress(card.dorp)" style="cursor: pointer; color: inherit">
                连接地址：{{ card.dorp }}
            </a>
            <br />
            <span v-if="card.uptime" style="color: gray; font-size: 10px">
                {{ card.uptime }}
            </span>
            <span v-else style="color: gray; font-size: 10px"> 尚未启动过此隧道 </span>
        </n-thing>
        <template #action>
            <n-grid cols="8" :x-gap="6" align="center">
                <n-grid-item :span="7">
                    <n-row align="center" justify="start" style="margin-top: 6px">
                        <n-col :span="8">
                            <div style="display: flex; align-items: center">
                                <n-icon :component="ArrowUpOutline" />
                                <n-number-animation
                                    show-separator
                                    :from="0"
                                    :to="formatBytes(card.today_traffic_in).value"
                                />
                                {{ formatBytes(card.today_traffic_in).suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            <div style="display: flex; align-items: center">
                                <n-icon :component="ArrowDownOutline" />
                                <n-number-animation
                                    show-separator
                                    :from="0"
                                    :to="formatBytes(card.today_traffic_out).value"
                                />
                                {{ formatBytes(card.today_traffic_out).suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            <div style="display: flex; align-items: center">
                                连接数
                                <n-number-animation show-separator :from="0" :to="card.cur_conns" />
                            </div>
                        </n-col>
                    </n-row>
                </n-grid-item>
                <n-grid-item :span="1" style="display: flex; justify-content: flex-end">
                    <n-dropdown
                        trigger="click"
                        :options="dropdownOptions"
                        @select="handleDropdownSelect"
                        placement="bottom-end"
                    >
                        <n-button quaternary circle size="medium" style="--n-padding: 8px">
                            <template #icon>
                                <n-icon size="16"><BuildOutline /></n-icon>
                            </template>
                        </n-button>
                    </n-dropdown>
                </n-grid-item>
            </n-grid>
        </template>
    </n-card>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { NIcon, useMessage } from 'naive-ui';
import {
    BuildOutline,
    ArrowUpOutline,
    ArrowDownOutline,
    CreateOutline,
    CodeSlashOutline,
    TrashOutline,
    StatsChartOutline,
    RefreshOutline,
    CodeDownloadOutline,
} from '@vicons/ionicons5';
import type { TunnelCard } from '@/types/tunnel';
import { formatBytes } from '@/utils/formatters';

interface Props {
    card: TunnelCard;
    canDelete?: boolean;
}

interface Emits {
    (e: 'edit', card: TunnelCard): void;
    (e: 'config', card: TunnelCard): void;
    (e: 'refresh', card: TunnelCard): void;
    (e: 'stats', card: TunnelCard): void;
    (e: 'offline', card: TunnelCard): void;
    (e: 'delete', card: TunnelCard): void;
}

const props = withDefaults(defineProps<Props>(), {
    canDelete: true,
});

const emit = defineEmits<Emits>();
const message = useMessage();

const dropdownOptions = computed(() => [
    {
        label: '编辑隧道',
        key: 'edit',
        icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
    },
    {
        label: '获取配置代码',
        key: 'config',
        icon: () => h(NIcon, null, { default: () => h(CodeSlashOutline) }),
    },
    {
        type: 'divider',
        key: 'd1',
    },
    {
        label: '刷新流量等数据',
        key: 'refresh',
        icon: () => h(NIcon, null, { default: () => h(RefreshOutline) }),
    },
    {
        label: '获取近七天流量',
        key: 'stats',
        icon: () => h(NIcon, null, { default: () => h(StatsChartOutline) }),
    },
    {
        type: 'divider',
        key: 'd2',
    },
    {
        label: '强制下线隧道',
        key: 'offline',
        icon: () => h(NIcon, { color: '#ff4d4f' }, { default: () => h(CodeDownloadOutline) }),
        props: {
            style: { color: '#ff4d4f' },
        },
        disabled: !props.canDelete,
    },
    {
        label: '删除隧道',
        key: 'delete',
        icon: () => h(NIcon, { color: '#ff4d4f' }, { default: () => h(TrashOutline) }),
        props: {
            style: { color: '#ff4d4f' },
        },
        disabled: !props.canDelete,
    },
]);

const handleDropdownSelect = (key: string) => {
    switch (key) {
        case 'edit':
            emit('edit', props.card);
            break;
        case 'config':
            emit('config', props.card);
            break;
        case 'refresh':
            emit('refresh', props.card);
            break;
        case 'stats':
            emit('stats', props.card);
            break;
        case 'offline':
            emit('offline', props.card);
            break;
        case 'delete':
            emit('delete', props.card);
            break;
    }
};

const handleCopyAddress = (text: string) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            message.success('连接地址复制成功');
        })
        .catch((err) => {
            console.error('[隧道卡片]复制连接地址失败:', err);
            message.error('连接地址复制失败');
        });
};
</script>

