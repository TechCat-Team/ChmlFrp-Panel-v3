<template>
    <n-card title="账户设置" style="margin-top: 15px">
        <template #header-extra>
            <slot name="header-extra" />
        </template>
        <n-grid cols="1 l:2" responsive="screen" :x-gap="5" :y-gap="5">
            <n-gi v-for="(setting, index) in settings" :key="index">
                <n-card hoverable size="small" :bordered="false" @click="setting.click">
                    <n-space justify="space-between" align="center">
                        <div style="display: flex; align-items: center">
                            <n-icon size="28" :component="setting.icon" />
                            <div style="margin-left: 15px">
                                <p style="margin: 0; font-size: 15px">{{ setting.title }}</p>
                                <p style="margin: 0; font-size: 12px">{{ setting.subtitle }}</p>
                            </div>
                        </div>
                    </n-space>
                </n-card>
            </n-gi>
        </n-grid>
    </n-card>
</template>

<script lang="ts" setup>
interface Setting {
    title: string;
    subtitle: string;
    icon: any;
    click: () => void;
}

interface Props {
    settings: Setting[];
}

defineProps<Props>();
</script>
