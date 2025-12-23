<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card
            style="max-width: 600px"
            title="配置代码"
            :bordered="false"
            size="medium"
            role="dialog"
            aria-modal="true"
            closable
            @close="$emit('update:show', false)"
        >
            <n-collapse :default-expanded-names="['1', '3']">
                <n-collapse-item title="快捷启动代码" name="1">
                    <div style="margin-bottom: 16px">
                        <n-space vertical>
                            <n-collapse-item title="Windows" name="3" style="margin-bottom: 8px">
                                <template #header-extra>
                                    <n-button text tag="a" @click.stop="onCopy(windowsdaima)">
                                        <n-icon :component="CopyOutline" />
                                    </n-button>
                                </template>
                                <n-card size="small">
                                    <n-code :code="windowsdaima" language="powershell" word-wrap />
                                </n-card>
                            </n-collapse-item>
                            <n-collapse-item title="Linux & MacOS" name="2" style="margin-bottom: 8px">
                                <template #header-extra>
                                    <n-button text tag="a" @click="onCopy(linuxdaima)">
                                        <n-icon :component="CopyOutline" />
                                    </n-button>
                                </template>
                                <n-card size="small">
                                    <n-code :code="linuxdaima" word-wrap language="bash" />
                                </n-card>
                            </n-collapse-item>
                        </n-space>
                    </div>
                </n-collapse-item>
                <n-collapse-item title="Frpc.ini 配置" name="5">
                    <n-card size="small">
                        <n-code :code="frpcIniConfig" language="ini" word-wrap />
                        <template #action>
                            <n-space>
                                <n-button secondary type="primary" size="small" @click="onCopy(frpcIniConfig)">
                                    <template #icon>
                                        <n-icon :component="CopyOutline" />
                                    </template>
                                    复制配置
                                </n-button>
                                <n-button tertiary size="small" @click="onDownload">
                                    <template #icon>
                                        <n-icon :component="DownloadOutline" />
                                    </template>
                                    下载配置
                                </n-button>
                            </n-space>
                        </template>
                    </n-card>
                </n-collapse-item>
            </n-collapse>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { CopyOutline, DownloadOutline } from '@vicons/ionicons5';

interface Props {
    show: boolean;
    frpcIniConfig: string;
    windowsdaima: string;
    linuxdaima: string;
    onCopy: (text: string) => void;
    onDownload: () => void;
}

defineProps<Props>();

defineEmits<{
    'update:show': [value: boolean];
}>();
</script>
