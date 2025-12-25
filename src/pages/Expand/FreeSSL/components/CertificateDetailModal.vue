<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="width: 760px" size="large" :bordered="false" role="dialog" aria-modal="true">
            <!-- Header -->
            <div class="header">
                <div class="header-left">
                    <div class="title">证书详情</div>
                    <n-tag round size="small" :bordered="false" :type="statusConfig.type">
                        {{ statusConfig.text }}
                    </n-tag>
                </div>
                <div class="subtitle" v-if="detail">{{ providerName }} · {{ detail.domains }}</div>
            </div>
            <!-- Content -->
            <template v-if="detail">
                <!-- 基础信息 -->
                <n-card size="small" class="section-card">
                    <n-descriptions :column="2">
                        <n-descriptions-item label="证书 ID">
                            {{ detail.id }}
                        </n-descriptions-item>
                        <n-descriptions-item label="提供商">
                            {{ providerName }}
                        </n-descriptions-item>
                        <n-descriptions-item v-if="detail.status === 'issued' && 'issuedAt' in detail" label="签发时间">
                            {{ formatDate(detail.issuedAt) }}
                        </n-descriptions-item>

                        <n-descriptions-item
                            v-if="detail.status === 'issued' && 'expiresAt' in detail"
                            label="到期时间"
                        >
                            {{ formatDate(detail.expiresAt) }}
                        </n-descriptions-item>
                        <n-descriptions-item label="域名" :span="2">
                            {{ detail.domains }}
                        </n-descriptions-item>
                    </n-descriptions>
                </n-card>

                <!-- HTTP-01 -->
                <n-card
                    v-if="detail.status === 'pending' && detail.challengeType === 'http01'"
                    size="small"
                    class="section-card"
                >
                    <n-alert type="info" title="HTTP-01 验证指引" :bordered="false">
                        <n-space vertical>
                            <ol class="steps">
                                <li>在网站访问目录创建 .well-known/acme-challenge 目录</li>
                                <li>
                                    <n-button
                                        text
                                        type="primary"
                                        size="small"
                                        @click="handleDownloadChallengeFile"
                                        style="margin-left: 4px; margin-right: 4px"
                                    >
                                        点击下载验证文件
                                    </n-button>
                                </li>
                                <li>
                                    将下载的文件放到 .well-known/acme-challenge 目录下
                                    <n-text depth="3" style="font-size: 12px; display: block; margin-top: 4px">
                                        （如果下载的文件带有 .txt 扩展名，请重命名为 {{ detail.challengeToken }}）
                                    </n-text>
                                </li>
                                <li>
                                    确保
                                    {{
                                        `http://${detail.domains.split(',')[0]}/.well-known/acme-challenge/${detail.challengeToken}`
                                    }}
                                    可以正常访问
                                </li>
                                <li>点击"验证并签发"按钮完成验证</li>
                            </ol>
                        </n-space>
                    </n-alert>
                </n-card>

                <!-- DNS-01 -->
                <n-card
                    v-if="detail.status === 'pending' && detail.challengeType === 'dns01'"
                    size="small"
                    class="section-card"
                >
                    <n-alert type="warning" title="DNS-01 验证指引" :bordered="false">
                        <n-space vertical>
                            <ol class="steps">
                                <li>在 DNS 服务商处添加 TXT 记录</li>
                                <li>等待 DNS 生效（可能需要几分钟）</li>
                                <li>点击"验证并签发"按钮完成验证</li>
                            </ol>

                            <n-divider />

                            <n-descriptions :column="1" size="small">
                                <n-descriptions-item label="记录名称">
                                    <n-code :code="detail.dnsRecordName || ''" />
                                </n-descriptions-item>
                                <n-descriptions-item label="记录值">
                                    <n-code :code="detail.dnsRecordValue || ''" />
                                </n-descriptions-item>
                            </n-descriptions>

                            <n-text v-if="detail.instructions" depth="3" style="font-size: 12px">
                                {{ detail.instructions }}
                            </n-text>
                        </n-space>
                    </n-alert>
                </n-card>

                <!-- 已签发 -->
                <n-card v-if="detail.status === 'issued'" size="small" class="section-card">
                    <n-space vertical :size="16">
                        <!-- 操作 -->
                        <n-button-group>
                            <n-button @click="handleDownload('certificate')" :loading="downloading">
                                下载证书
                            </n-button>
                            <n-button @click="handleDownload('privatekey')" :loading="downloading"> 下载私钥 </n-button>
                            <n-button @click="handleDownload('chain')" :loading="downloading"> 下载证书链 </n-button>
                            <n-button @click="handleDownload('full')" :loading="downloading"> 下载完整证书 </n-button>
                        </n-button-group>

                        <!-- 内容 -->
                        <n-collapse>
                            <n-collapse-item title="证书内容">
                                <template #header-extra>
                                    <n-button text size="small" @click.stop="handleCopy(detail.certificate)">
                                        <n-icon :component="CopyOutline" />
                                        复制
                                    </n-button>
                                </template>
                                <n-code :code="detail.certificate" word-wrap />
                            </n-collapse-item>

                            <n-collapse-item title="私钥内容">
                                <template #header-extra>
                                    <n-button text size="small" @click.stop="handleCopy(detail.privateKey)">
                                        <n-icon :component="CopyOutline" />
                                        复制
                                    </n-button>
                                </template>
                                <n-code :code="detail.privateKey" word-wrap />
                            </n-collapse-item>

                            <n-collapse-item title="证书链">
                                <template #header-extra>
                                    <n-button text size="small" @click.stop="handleCopy(detail.chain)">
                                        <n-icon :component="CopyOutline" />
                                        复制
                                    </n-button>
                                </template>
                                <n-code :code="detail.chain" word-wrap />
                            </n-collapse-item>
                        </n-collapse>
                    </n-space>
                </n-card>
            </template>

            <n-empty v-else description="加载中..." />
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useMessage } from 'naive-ui';
import { CopyOutline } from '@vicons/ionicons5';
import type { PendingCertificateDetail, IssuedCertificateDetail } from '@/api/v2/ssl/ssl';
import { STATUS_CONFIG, PROVIDER_NAMES } from '../constants';

interface Props {
    show: boolean;
    detail: PendingCertificateDetail | IssuedCertificateDetail | null;
    downloading?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:show': [boolean];
    download: ['certificate' | 'privatekey' | 'chain' | 'full'];
}>();

const message = useMessage();

const statusConfig = computed(() =>
    props.detail ? STATUS_CONFIG[props.detail.status] : { type: 'default', text: '' }
);

const providerName = computed(() => (props.detail ? PROVIDER_NAMES[props.detail.provider] : ''));

const formatDate = (v: string) => new Date(v).toLocaleString('zh-CN');

const handleDownload = (type: 'certificate' | 'privatekey' | 'chain' | 'full') => emit('download', type);

const handleCopy = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        message.success('已复制到剪切板');
    } catch {
        message.error('复制失败');
    }
};

const handleDownloadChallengeFile = () => {
    if (!props.detail || props.detail.status !== 'pending' || props.detail.challengeType !== 'http01') {
        return;
    }

    const token = props.detail.challengeToken;
    const content = props.detail.challengeKeyAuthorization;

    if (!token || !content) {
        message.error('验证信息不完整');
        return;
    }

    try {
        // 创建 Blob 对象，使用 application/octet-stream 避免浏览器自动添加 .txt 扩展名
        const blob = new Blob([content], { type: 'application/octet-stream' });
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // 确保文件名就是 token，没有扩展名
        link.download = token;
        link.style.display = 'none';
        // 触发下载
        document.body.appendChild(link);
        link.click();
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('验证文件下载成功');
    } catch (error) {
        message.error('下载失败');
        console.error('Download challenge file error:', error);
    }
};
</script>

<style scoped>
.header {
    margin-bottom: 8px;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}
.title {
    font-size: 20px;
    font-weight: 600;
}
.subtitle {
    font-size: 13px;
    color: var(--n-text-color-3);
    margin-top: 4px;
}
.section-card {
    margin-top: 16px;
}
.steps {
    padding-left: 18px;
    margin: 0;
}
.steps li {
    margin: 6px 0;
}
</style>
