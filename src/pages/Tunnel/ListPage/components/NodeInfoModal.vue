<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card :style="widthStyle" size="small" :bordered="false" transform-origin="center" role="dialog"
            aria-modal="true">
            <n-tabs type="line" size="large" :tabs-padding="20" @update:value="$emit('tab-change', $event)">
                <n-tab-pane name="节点详情">
                    <n-p>节点负载</n-p>
                    <n-progress type="line" :percentage="nodeInfo.bandwidth_usage_percent"
                        :indicator-placement="'inside'" />
                    <n-p style="margin-top: 12px">节点详情</n-p>
                    <n-descriptions label-placement="left" size="medium" :column="screenWidth >= 600 ? 3 : 1" bordered>
                        <n-descriptions-item label="节点名">
                            {{ selectNode }}
                        </n-descriptions-item>
                        <n-descriptions-item label="地区">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-p v-else>{{ nodeInfo.area }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="权限组">
                            <n-skeleton v-if="loading" width="37.09px" height="28px" round />
                            <n-tag v-else :type="nodeInfo.nodegroup === 'vip' ? 'warning' : 'info'" round>
                                {{ nodeInfo.nodegroup }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="防御">
                            <n-skeleton v-if="loading" width="60.65px" height="28px" round />
                            <n-tooltip v-else-if="nodeInfo.fangyu === true" trigger="hover">
                                <template #trigger>
                                    <n-tag round type="success"> 有防御 </n-tag>
                                </template>
                                此节点有≥5Gbps的DDOS防御
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger>
                                    <n-tag round type="error"> 没防御 </n-tag>
                                </template>
                                此节点没有防御或DDOS防御带宽小于5Gbps
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="建站">
                            <n-skeleton v-if="loading" width="46.65px" height="28px" round />
                            <n-tag v-else-if="nodeInfo.web === 'yes'" type="success" round> 允许 </n-tag>
                            <n-tag v-else type="error" round> 不允许 </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="UDP">
                            <n-skeleton v-if="loading" width="46.65px" height="28px" round />
                            <n-tag v-else-if="nodeInfo.udp" type="success" round> 允许 </n-tag>
                            <n-tag v-else type="error" round> 不允许 </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名过白">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-tooltip v-else-if="!nodeInfo.toowhite" trigger="hover">
                                <template #trigger> 域名无需备案过白 </template>
                                此节点为国外或中国特别行政区，也可能自动过白，域名无需手动申请过白
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger> 域名需过白 </template>
                                此节点为中国境内节点，并且无法自动过白，需要前往"扩展功能"-"域名过白"进行手动过白
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="端口限制">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-p v-else>{{ nodeInfo.rport }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-p v-else>{{ nodeInfo.ip }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="IP">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-p v-else>{{ nodeInfo.realIp }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="IPV6">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-p v-else-if="nodeInfo.ipv6 !== null">{{ nodeInfo.ipv6 }}</n-p>
                            <n-p v-else>此节点没有公网IPv6</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="带宽">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-tooltip v-else-if="nodeInfo.china === 'no'" trigger="hover">
                                <template #trigger> 国外带宽 </template>
                                此节点走ChmlFrp国外带宽，您的国外带宽上限为{{
                                    userBandwidth ? userBandwidth * 4 : 32
                                }}m
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger> 国内带宽 </template>
                                此节点走ChmlFrp国内带宽，您的国内带宽上限为{{ userBandwidth }}m
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="介绍">
                            <n-skeleton v-if="loading" text style="width: 100%" />
                            <n-p v-else>{{ nodeInfo.notes }}</n-p>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-tab-pane>
                <n-tab-pane name="节点地图">
                    <n-alert type="info">
                        地图来自中国地理信息公共服务平台，"我的位置"信息通过IP获取，有较大误差。另外请不要使用代理软件，否则您可能会被定位到月球。
                    </n-alert>
                    <n-skeleton v-if="loadingMap" text style="width: 100%; margin-top: 16px" height="500px" />
                    <MapComponent v-else style="margin-top: 16px" :width="'100%'" :height="'500px'" :markers="markers" />
                </n-tab-pane>
            </n-tabs>
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="$emit('cancel')">取消</n-button>
                    <n-button @click="$emit('back')">上一步</n-button>
                    <n-button @click="$emit('continue')" type="primary">继续</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import type { NodeInfo, Marker } from '../types';
import MapComponent from '@/components/business/common/MapComponent.vue';

interface Props {
    show: boolean;
    widthStyle: { width: string };
    screenWidth: number;
    selectNode: string;
    nodeInfo: NodeInfo;
    loading: boolean;
    loadingMap: boolean;
    markers: Marker[];
    userBandwidth?: number;
}

defineProps<Props>();

defineEmits<{
    'update:show': [value: boolean];
    'tab-change': [value: string];
    cancel: [];
    back: [];
    continue: [];
}>();
</script>

