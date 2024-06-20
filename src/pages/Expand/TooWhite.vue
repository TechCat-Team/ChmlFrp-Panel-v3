<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px;" title="域名过白">
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
            <n-card size="small" title="bilibili.com">
                <template #header-extra>
                    <n-tag round :bordered="false" type="success">
                        通过
                    </n-tag>
                </template>
                <template #footer>
                    沪ICP备13002172号-3
                    <br />
                    上海宽娱数码科技有限公司
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card size="small" title="uapis.cn">
                <template #header-extra>
                    <n-tag round :bordered="false" type="success">
                        通过
                    </n-tag>
                </template>
                <template #footer>
                    京ICP备2023016802号-5
                    <br />
                    北京思茶科技有限公司
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import { RefreshOutline, AddOutline } from '@vicons/ionicons5'

const createDomainNameModal = ref(false)
</script>