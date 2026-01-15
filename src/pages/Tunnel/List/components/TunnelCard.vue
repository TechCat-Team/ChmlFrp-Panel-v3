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
                @click="props.onCopyAddress(card.ip + ':' + card.dorp)"
                style="cursor: pointer; color: inherit"
            >
                连接地址：{{ card.ip }}:{{ card.dorp }}
            </a>
            <a v-else @click="props.onCopyAddress(card.dorp)" style="cursor: pointer; color: inherit">
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
                                <n-number-animation show-separator :from="0" :to="trafficIn.value" />
                                {{ trafficIn.suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            <div style="display: flex; align-items: center">
                                <n-icon :component="ArrowDownOutline" />
                                <n-number-animation show-separator :from="0" :to="trafficOut.value" />
                                {{ trafficOut.suffix }}
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
                                <n-icon size="16">
                                    <BuildOutline />
                                </n-icon>
                            </template>
                        </n-button>
                    </n-dropdown>
                </n-grid-item>
            </n-grid>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue';
import { NIcon, useMessage } from 'naive-ui';
import {
    ArrowUpOutline,
    ArrowDownOutline,
    BuildOutline,
    CreateOutline,
    CodeSlashOutline,
    TrashOutline,
    StatsChartOutline,
    CodeDownloadOutline,
    RefreshOutline,
    PlayOutline,
} from '@vicons/ionicons5';
import { formatBytes } from '@/utils/formatBytes';
import type { TunnelCard } from '../types';

interface Props {
    card: TunnelCard;
    deletetTunnelSuccess: boolean;
    isMobile?: boolean;
    onEdit: (card: TunnelCard) => void;
    onGetConfig: (card: TunnelCard) => void;
    onRefresh: (card: TunnelCard) => void;
    onGetStats: (card: TunnelCard) => void;
    onOffline: (card: TunnelCard) => void;
    onDelete: (card: TunnelCard) => void;
    onCopyAddress: (address: string) => void;
    onStart: (card: TunnelCard) => void;
}

const props = defineProps<Props>();
const message = useMessage();
const trafficIn = computed(() => formatBytes(props.card.today_traffic_in));
const trafficOut = computed(() => formatBytes(props.card.today_traffic_out));

const dropdownOptions = computed(() => {
    const options = [];
    
    // 只在非手机端显示启动隧道功能
    if (!props.isMobile) {
        options.push({
            label: '启动隧道',
            key: 'start',
            icon: () => h(NIcon, null, { default: () => h(PlayOutline) }),
        });
        options.push({
            type: 'divider',
            key: 'd0',
        });
    }
    
    options.push({
        label: '编辑隧道',
        key: 'edit',
        icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
    });
    options.push({
        label: '获取配置代码',
        key: 'config',
        icon: () => h(NIcon, null, { default: () => h(CodeSlashOutline) }),
    });
    options.push({
        type: 'divider',
        key: 'd1',
    });
    options.push({
        label: '刷新流量等数据',
        key: 'refresh',
        icon: () => h(NIcon, null, { default: () => h(RefreshOutline) }),
    });
    options.push({
        label: '获取近七天流量',
        key: 'stats',
        icon: () => h(NIcon, null, { default: () => h(StatsChartOutline) }),
    });
    options.push({
        type: 'divider',
        key: 'd2',
    });
    options.push({
        label: '强制下线隧道',
        key: 'offtunnel',
        icon: () => h(NIcon, { color: '#ff4d4f' }, { default: () => h(CodeDownloadOutline) }),
        props: {
            style: { color: '#ff4d4f' },
        },
        disabled: !props.deletetTunnelSuccess,
    });
    options.push({
        label: '删除隧道',
        key: 'delete',
        icon: () => h(NIcon, { color: '#ff4d4f' }, { default: () => h(TrashOutline) }),
        props: {
            style: { color: '#ff4d4f' },
        },
        disabled: !props.deletetTunnelSuccess,
    });
    
    return options;
});

const handleDropdownSelect = (key: string) => {
    switch (key) {
        case 'start':
            props.onStart(props.card);
            break;
        case 'edit':
            props.onEdit(props.card);
            break;
        case 'config':
            props.onGetConfig(props.card);
            break;
        case 'refresh':
            if (props.card.state === 'true') {
                props.onRefresh(props.card);
            } else {
                message.warning('隧道不在线，无法刷新数据');
            }
            break;
        case 'stats':
            props.onGetStats(props.card);
            break;
        case 'offtunnel':
            if (props.card.state === 'true') {
                props.onOffline(props.card);
            } else {
                message.warning('隧道不在线，无法强制下线');
            }
            break;
        case 'delete':
            props.onDelete(props.card);
            break;
    }
};
</script>
