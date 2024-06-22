<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px;" title="域名列表">
        <template #header-extra>
            <n-button round quaternary>
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="createDomainNameModal = true" type="primary" round quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                新增域名
            </n-button>
        </template>
    </n-card>
    <n-grid cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item>
            <n-card size="small" title="mc.frp.wtf">
                <template #header-extra>
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-tag round :bordered="false" type="primary">
                                SRV
                            </n-tag>
                        </template>
                        此域名通过SRV解析隐藏了MCjava服务器端口，可直接通过mc.frp.wtf连接
                    </n-tooltip>
                </template>
                <n-tag round :bordered="false" type="primary" size="small">
                    解析隧道：ChmlFrp-Tunnel
                </n-tag>
                <template #footer>
                    名称：_minecraft._tcp.mc
                    <br />
                    域名：frp.wtf
                    <br />
                    内容：5 0 25598 bj.frp.one
                    <br />
                    TTL：1分钟
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card size="small" title="chaoji.frp.wtf">
                <template #header-extra>
                    <n-tag round :bordered="false" type="primary">
                        CNAME
                    </n-tag>
                </template>
                <n-tag round :bordered="false" type="primary" size="small">
                    自定义地址
                </n-tag>
                <template #footer>
                    名称：chaoji
                    <br />
                    域名：frp.wtf
                    <br />
                    内容：bj.frp.one
                    <br />
                    TTL：1分钟
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import { RefreshOutline, AddOutline } from '@vicons/ionicons5'

const createDomainNameModal = ref(false)
</script>
