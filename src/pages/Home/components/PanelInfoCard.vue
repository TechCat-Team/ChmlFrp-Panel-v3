<template>
    <n-card style="margin-top: 15px">
        <n-result status="success" title="ChmlFrp - Panel v3.0" description="简约 大气 开源">
            <n-descriptions label-placement="left" :column="screenWidth >= 600 ? 3 : 1">
                <n-descriptions-item label="隧道数">
                    <n-skeleton v-if="loading" text :width="40" />
                    <n-p v-else>{{ panelInfo.tunnel_amount }}</n-p>
                </n-descriptions-item>
                <n-descriptions-item label="用户数">
                    <n-skeleton v-if="loading" text :width="40" />
                    <n-p v-else>{{ panelInfo.user_amount }}</n-p>
                </n-descriptions-item>
                <n-descriptions-item label="节点数">
                    <n-skeleton v-if="loading" text :width="16" />
                    <n-p v-else>{{ panelInfo.node_amount }}</n-p>
                </n-descriptions-item>
            </n-descriptions>
        </n-result>
        <n-divider />
        <n-skeleton v-if="loading" text :repeat="2" />
        <n-space v-else style="margin-top: 24px">
            <n-tooltip trigger="hover" v-for="(link, index) in panelInfo.friend_links" :key="index">
                <template #trigger>
                    <n-button text tag="a" :href="link.url" target="_blank">
                        {{ link.name }}
                    </n-button>
                </template>
                {{ link.description || '暂无介绍' }}
            </n-tooltip>
        </n-space>
    </n-card>
</template>

<script lang="ts" setup>
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import type { PanelInfo } from '../types';

interface Props {
    loading: boolean;
    panelInfo: PanelInfo;
}

defineProps<Props>();

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);
</script>

