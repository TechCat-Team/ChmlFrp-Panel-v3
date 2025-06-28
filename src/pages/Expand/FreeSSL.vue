<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px" title="免费SSL">
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
                新增证书
            </n-button>
        </template>
    </n-card>
    <n-grid cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item>
            <n-card size="small" title="chmlfrp.cn">
                <template #header-extra>
                    <n-tag round :bordered="false" type="success"> 完成 </n-tag>
                </template>
                <n-flex>
                    <n-tag round :bordered="false" type="primary" size="small"> 泛域名 </n-tag>
                    <n-tag round :bordered="false" type="primary" size="small"> 包含根域 </n-tag>
                </n-flex>
                <template #footer>
                    渠道：ZeroSSL
                    <br />
                    到期时间：2024-07-31 07:59:59
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card size="small" title="chcat.cn">
                <template #header-extra>
                    <n-tag round :bordered="false" type="warning"> 验证 </n-tag>
                </template>
                <n-tag round :bordered="false" type="primary" size="small"> 单域名 </n-tag>
                <template #footer>
                    渠道：Let's Encrypt
                    <br />
                    到期时间：2024-07-31 07:59:59
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card size="small" title="hosthub.cc">
                <template #header-extra>
                    <n-tag round :bordered="false" type="error"> 失效 </n-tag>
                </template>
                <n-tag round :bordered="false" type="primary" size="small"> 泛域名 </n-tag>
                <template #footer>
                    渠道：Google
                    <br />
                    到期时间：2024-07-31 07:59:59
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import { RefreshOutline, AddOutline } from '@vicons/ionicons5';

const createDomainNameModal = ref(false);
</script>
