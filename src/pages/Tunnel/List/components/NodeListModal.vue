<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card :style="widthStyle" title="选择节点" closable :bordered="false" role="dialog" aria-modal="true" @close="$emit('update:show', false)">
            <n-alert type="info" style="bottom: 12px"> 为确保您的体验，请尽量选择负载低，距离近的节点。 </n-alert>
            <n-flex justify="space-between" align="center">
                <n-flex>
                    <n-checkbox :checked="filters.udp" @update:checked="handleFiltersUpdate('udp', $event)"> UDP </n-checkbox>
                </n-flex>
                <n-flex>
                    <n-button-group>
                        <n-button round size="small" :type="filters.web === 'all' ? 'primary' : 'default'"
                            @click="filterWeb('all')">
                            全部
                        </n-button>
                        <n-button size="small" :type="filters.web === 'yes' ? 'primary' : 'default'"
                            @click="filterWeb('yes')">
                            可建站
                        </n-button>
                        <n-button round size="small" :type="filters.web === 'no' ? 'primary' : 'default'"
                            @click="filterWeb('no')">
                            不可建站
                        </n-button>
                    </n-button-group>
                    <n-button-group>
                        <n-button round size="small" :type="filters.region === 'all' ? 'primary' : 'default'"
                            @click="filterRegion('all')">
                            全部
                        </n-button>
                        <n-button size="small" :type="filters.region === 'china' ? 'primary' : 'default'"
                            @click="filterRegion('china')">
                            国内
                        </n-button>
                        <n-button round size="small" :type="filters.region === 'overseas' ? 'primary' : 'default'"
                            @click="filterRegion('overseas')">
                            境外
                        </n-button>
                    </n-button-group>
                </n-flex>
            </n-flex>
            <n-empty v-if="nodeCards.length === 0" description="当前没有节点在线" />
            <n-empty v-else-if="filteredNodeCards.length === 0" description="您选择的分类没有任何节点" />
            <n-collapse v-else style="margin-top: 12px" :expanded-names="expandedPanels" @update:expanded-names="$emit('update:expandedPanels', $event)">
                <n-collapse-item v-if="vipNodeCards.length > 0" name="vip" title="会员节点">
                    <template #header-extra>
                        <n-tag size="small" round type="warning"> {{ vipNodeCards.length }} 个节点 </n-tag>
                    </template>
                    <n-grid cols="1 m:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
                        <n-grid-item v-for="(nodeCard, index) in vipNodeCards" :key="`vip-${index}`">
                            <NodeCardComponent :node="nodeCard" @click="$emit('node-select', nodeCard)" />
                        </n-grid-item>
                    </n-grid>
                </n-collapse-item>
                <n-collapse-item v-if="normalNodeCards.length > 0" name="normal" title="非会员节点">
                    <template #header-extra>
                        <n-tag size="small" round type="info"> {{ normalNodeCards.length }} 个节点 </n-tag>
                    </template>
                    <n-grid cols="1 m:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
                        <n-grid-item v-for="(nodeCard, index) in normalNodeCards" :key="`normal-${index}`">
                            <NodeCardComponent :node="nodeCard" @click="$emit('node-select', nodeCard)" />
                        </n-grid-item>
                    </n-grid>
                </n-collapse-item>
            </n-collapse>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { NodeCard, NodeFilters } from '../types';
import NodeCardComponent from './NodeCard.vue';

interface Props {
    show: boolean;
    widthStyle: { width: string };
    nodeCards: NodeCard[];
    filters: NodeFilters;
    filteredNodeCards: NodeCard[];
    vipNodeCards: NodeCard[];
    normalNodeCards: NodeCard[];
    expandedPanels: string[];
    filterWeb: (web: 'all' | 'yes' | 'no') => void;
    filterRegion: (region: 'all' | 'china' | 'overseas') => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    'update:expandedPanels': [value: string[]];
    'update:filters': [value: NodeFilters];
    'node-select': [node: NodeCard];
}>();

const handleFiltersUpdate = (key: keyof NodeFilters, value: any) => {
    emit('update:filters', { ...props.filters, [key]: value });
};
</script>

