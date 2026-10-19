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
            <n-form-item label="连接协议">
                <n-select :value="protocol" :options="protocolOptions" @update:value="updateProtocol" />
            </n-form-item>
            <n-spin :show="loading">
                <n-collapse :default-expanded-names="['1', '3']">
                    <n-collapse-item title="快捷启动代码" name="1">
                        <div style="margin-bottom: 16px">
                            <n-space vertical>
                                <n-collapse-item title="Windows" name="3" style="margin-bottom: 8px">
                                    <template #header-extra>
                                        <n-button
                                            text
                                            tag="a"
                                            :disabled="loading || !windowsdaima"
                                            @click.stop="onCopy(windowsdaima)"
                                        >
                                            <n-icon :component="CopyOutline" />
                                        </n-button>
                                    </template>
                                    <n-card size="small">
                                        <n-code :code="windowsdaima" language="powershell" word-wrap />
                                    </n-card>
                                </n-collapse-item>
                                <n-collapse-item title="Linux & MacOS" name="2" style="margin-bottom: 8px">
                                    <template #header-extra>
                                        <n-button
                                            text
                                            tag="a"
                                            :disabled="loading || !linuxdaima"
                                            @click="onCopy(linuxdaima)"
                                        >
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
                    <n-collapse-item title="Frpc.toml 配置" name="5">
                        <n-card size="small">
                            <n-code :code="frpcIniConfig" language="toml" word-wrap />
                            <template #action>
                                <n-space>
                                    <n-button
                                        secondary
                                        type="primary"
                                        size="small"
                                        :disabled="loading || !frpcIniConfig"
                                        @click="onCopy(frpcIniConfig)"
                                    >
                                        <template #icon>
                                            <n-icon :component="CopyOutline" />
                                        </template>
                                        复制配置
                                    </n-button>
                                    <n-button
                                        tertiary
                                        size="small"
                                        :disabled="loading || !frpcIniConfig"
                                        @click="onDownload"
                                    >
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
            </n-spin>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { CopyOutline, DownloadOutline } from '@vicons/ionicons5';
import type { ConnectionProtocol } from '@/utils/frpcTransport';

interface Props {
    show: boolean;
    protocol: ConnectionProtocol;
    protocolOptions: Array<{ label: string; value: string; disabled?: boolean }>;
    loading: boolean;
    frpcIniConfig: string;
    windowsdaima: string;
    linuxdaima: string;
    onCopy: (text: string) => void;
    onDownload: () => void;
}

defineProps<Props>();

const emit = defineEmits<{
    'update:show': [value: boolean];
    'update:protocol': [value: ConnectionProtocol];
}>();
const updateProtocol = (value: string) => {
    if (value === 'tcp' || value === 'quic') emit('update:protocol', value);
};
</script>
