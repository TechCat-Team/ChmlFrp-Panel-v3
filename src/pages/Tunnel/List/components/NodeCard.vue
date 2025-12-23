<template>
    <n-tooltip trigger="hover">
        <template #trigger>
            <n-card size="small" style="height: 90px" hoverable @click="$emit('click')">
                <template #header>
                    <span style="color: gray"> #{{ node.id }} </span>
                    <n-divider vertical />
                    {{ node.name }}
                </template>
                <template #header-extra>
                    <n-tag v-if="isVip" size="small" round type="warning"> VIP </n-tag>
                </template>
                <n-space>
                    <n-tag :bordered="false" round size="small" type="success" v-if="node.web === 'yes'">
                        <template #icon>
                            <n-icon :component="EarthOutline" />
                        </template>
                        建站
                    </n-tag>
                    <n-tag :bordered="false" round size="small" type="error" v-if="node.udp === 'false'">
                        <template #icon>
                            <n-icon :component="BanOutline" />
                        </template>
                        UDP
                    </n-tag>
                    <n-tag :bordered="false" round size="small" type="info" v-if="node.fangyu === 'true'">
                        <template #icon>
                            <n-icon :component="ShieldCheckmarkOutline" />
                        </template>
                        防御
                    </n-tag>
                </n-space>
            </n-card>
        </template>
        {{ node.notes }}
    </n-tooltip>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { BanOutline, EarthOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5';
import type { NodeCard } from '../types';

interface Props {
    node: NodeCard;
}

const props = defineProps<Props>();

const isVip = computed(() => props.node.nodegroup === 'vip');

defineEmits<{
    click: [];
}>();
</script>
