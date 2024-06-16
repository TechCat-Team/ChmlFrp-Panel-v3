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
</template>

<script lang="ts" setup>
import { RefreshOutline, AddOutline } from '@vicons/ionicons5'

const createDomainNameModal = ref(false)
</script>
