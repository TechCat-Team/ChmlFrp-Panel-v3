<template>
    <n-modal v-model:show="showModel">
        <n-card
            style="max-width: 800px"
            title="配置代码"
            :bordered="false"
            size="medium"
            role="dialog"
            aria-modal="true"
            closable
            @close="showModel = false"
        >
            <n-p v-if="node?.quicPort">
                请使用下方配置部署并放行 QUIC 的 UDP 端口。QUIC 与 TCP 使用相同端口号时，下方配置不启用 KCP。
            </n-p>
            <n-collapse :default-expanded-names="['1']">
                <!-- 一键部署代码 -->
                <n-collapse-item title="一键部署代码" name="1">
                    <n-card size="small">
                        <n-tabs v-model:value="deployPlatform" type="segment" size="small">
                            <n-tab-pane name="linux" tab="Linux">
                                <n-space vertical>
                                    <n-space justify="end">
                                        <n-button text @click="copyToClipboard(deployCodeLinux)">
                                            <template #icon>
                                                <n-icon :component="CopyOutline" />
                                            </template>
                                            复制
                                        </n-button>
                                    </n-space>
                                    <n-code :code="deployCodeLinux" word-wrap language="bash" />
                                </n-space>
                            </n-tab-pane>
                            <n-tab-pane name="windows" tab="Windows">
                                <n-space vertical>
                                    <n-space justify="end">
                                        <n-button text @click="copyToClipboard(deployCodeWindows)">
                                            <template #icon>
                                                <n-icon :component="CopyOutline" />
                                            </template>
                                            复制
                                        </n-button>
                                    </n-space>
                                    <n-code :code="deployCodeWindows" word-wrap language="powershell" />
                                </n-space>
                            </n-tab-pane>
                        </n-tabs>
                    </n-card>
                </n-collapse-item>

                <!-- 一键更新代码 -->
                <n-collapse-item title="一键更新代码" name="2">
                    <n-card size="small">
                        <n-tabs v-model:value="updatePlatform" type="segment" size="small">
                            <n-tab-pane name="linux" tab="Linux">
                                <n-space vertical>
                                    <n-space justify="end">
                                        <n-button text @click="copyToClipboard(updateCodeLinux)">
                                            <template #icon>
                                                <n-icon :component="CopyOutline" />
                                            </template>
                                            复制
                                        </n-button>
                                    </n-space>
                                    <n-code :code="updateCodeLinux" word-wrap language="bash" />
                                </n-space>
                            </n-tab-pane>
                            <n-tab-pane name="windows" tab="Windows">
                                <n-space vertical>
                                    <n-space justify="end">
                                        <n-button text @click="copyToClipboard(updateCodeWindows)">
                                            <template #icon>
                                                <n-icon :component="CopyOutline" />
                                            </template>
                                            复制
                                        </n-button>
                                    </n-space>
                                    <n-code :code="updateCodeWindows" word-wrap language="powershell" />
                                </n-space>
                            </n-tab-pane>
                        </n-tabs>
                    </n-card>
                </n-collapse-item>

                <!-- Frps.toml 配置 -->
                <n-collapse-item title="Frps.toml 配置" name="3">
                    <n-card size="small">
                        <n-code :code="frpsTomlConfig" language="ini" word-wrap />
                        <template #action>
                            <n-space>
                                <n-button
                                    secondary
                                    type="primary"
                                    size="small"
                                    @click="copyToClipboard(frpsTomlConfig)"
                                >
                                    <template #icon>
                                        <n-icon :component="CopyOutline" />
                                    </template>
                                    复制配置
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
import { computed, ref } from 'vue';
import {
    NModal,
    NCard,
    NCollapse,
    NCollapseItem,
    NCode,
    NIcon,
    NP,
    NSpace,
    NTabPane,
    NTabs,
    useMessage,
} from 'naive-ui';
import { CopyOutline } from '@vicons/ionicons5';
import { FRP_API_BASE_URL } from '../constants';
import type { Node } from '../types';

const props = defineProps<{
    show: boolean;
    node: Node | null;
}>();

const emit = defineEmits<{
    'update:show': [value: boolean];
}>();

const showModel = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value),
});

const message = useMessage();

// 部署/更新代码所属平台
const deployPlatform = ref<'linux' | 'windows'>('linux');
const updatePlatform = ref<'linux' | 'windows'>('linux');

const copyToClipboard = (text: string) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            message.success('复制成功');
        })
        .catch((err) => {
            console.error('[节点管理]复制失败:', err);
            message.error('复制失败');
        });
};

// 解析 auth 获取用户名和密码
const parseNodeAuth = (node: Node) => {
    let username = 'admin';
    let password = 'password';
    try {
        const decodedAuth = atob(node.auth);
        const [user, pass] = decodedAuth.split(':');
        username = user || 'admin';
        password = pass || 'password';
    } catch (error) {
        console.error('解码auth失败:', error);
    }
    return { username, password };
};

// 判断是否可建站
const canWebNode = (node: Node) => (node.web === 'yes' || node.web === 'true' ? 'true' : 'false');

// 生成 Linux 部署/更新命令的公共参数
const buildNodeArgs = (node: Node) => {
    const { username, password } = parseNodeAuth(node);
    const canWeb = canWebNode(node);

    // QUIC 端口留空时不传；vhost 端口由脚本按是否可建站自动决定
    const quicFlag = node.quicPort && node.quicPort > 0 ? ` --quic-port ${node.quicPort}` : '';

    return `${node.port} ${node.adminPort} ${username} ${password} ${node.nodetoken} ${FRP_API_BASE_URL} "${node.apitoken}" ${canWeb} --overseas-ip-block false${quicFlag}`;
};

// 生成 Windows 部署/更新命令的公共参数（命名参数可出现在任意位置）
const buildNodeArgsWindows = (node: Node) => {
    const { username, password } = parseNodeAuth(node);
    const args = [
        node.port,
        node.adminPort,
        `"${username}"`,
        `"${password}"`,
        `"${node.nodetoken}"`,
        FRP_API_BASE_URL,
        `"${node.apitoken}"`,
        '-WebEnable',
        canWebNode(node),
        '-OverseasIpBlock',
        'false',
    ];
    if (node.quicPort && node.quicPort > 0) {
        args.push('-QuicPort', String(node.quicPort));
    }
    return args.join(' ');
};

// 生成一键部署代码（Linux）
const deployCodeLinux = computed(() => {
    if (!props.node) return '';

    return `curl -O https://dw.milkymay.cn/chmlfrp/server_deploy.sh && chmod +x server_deploy.sh && sudo ./server_deploy.sh --skip-source-check ${buildNodeArgs(props.node)}`;
});

// 生成一键更新代码（Linux）
const updateCodeLinux = computed(() => {
    if (!props.node) return '';

    return `curl -O https://dw.milkymay.cn/chmlfrp/server_update.sh && chmod +x server_update.sh && sudo ./server_update.sh ${buildNodeArgs(props.node)}`;
});

// 生成一键部署代码（Windows）
const deployCodeWindows = computed(() => {
    if (!props.node) return '';

    return `$d='C:\\ChmlFrp'; New-Item -ItemType Directory -Force -Path $d | Out-Null; Invoke-WebRequest -UseBasicParsing -Uri 'https://dw.milkymay.cn/chmlfrp/server_deploy.ps1' -OutFile "$d\\server_deploy.ps1"; powershell -NoProfile -ExecutionPolicy Bypass -File "$d\\server_deploy.ps1" -SkipSourceCheck ${buildNodeArgsWindows(props.node)}`;
});

// 生成一键更新代码（Windows）
const updateCodeWindows = computed(() => {
    if (!props.node) return '';

    return `$d='C:\\ChmlFrp'; New-Item -ItemType Directory -Force -Path $d | Out-Null; Invoke-WebRequest -UseBasicParsing -Uri 'https://dw.milkymay.cn/chmlfrp/server_update.ps1' -OutFile "$d\\server_update.ps1"; powershell -NoProfile -ExecutionPolicy Bypass -File "$d\\server_update.ps1" ${buildNodeArgsWindows(props.node)}`;
});

// 生成 frps.toml 配置
const frpsTomlConfig = computed(() => {
    if (!props.node) return '';

    const node = props.node;

    // 解码auth获取用户名和密码
    let username = 'admin';
    let password = 'password';
    try {
        const decodedAuth = atob(node.auth);
        const [user, pass] = decodedAuth.split(':');
        username = user || 'admin';
        password = pass || 'password';
    } catch (error) {
        console.error('解码auth失败:', error);
    }

    // 判断是否允许建站
    const canWeb = node.web === 'yes' || node.web === 'true';

    // QUIC 可选；与 KCP 共用 UDP，端口相同时不启用 KCP
    const quicEnabled = !!node.quicPort && node.quicPort > 0;
    const transportConfig = [
        quicEnabled && node.quicPort === node.port ? '' : `kcpBindPort = ${node.port}`,
        quicEnabled ? `quicBindPort = ${node.quicPort}` : '',
    ]
        .filter(Boolean)
        .join('\n');

    // 禁止建站时脚本会自动从 81/444 起探测可用端口
    const vhostConfig = canWeb
        ? `vhostHTTPPort = 80
vhostHTTPSPort = 443`
        : `# 该节点禁止建站，脚本会自动从 81/444 起探测可用端口
vhostHTTPPort = 81
vhostHTTPSPort = 444`;

    return `# frps 监听地址和控制连接端口
bindAddr = "0.0.0.0"
bindPort = ${node.port}
${transportConfig}

# HTTP/HTTPS 虚拟主机端口
${vhostConfig}

# 暴露 Prometheus 指标；指标端点与管理面板共用监听地址
enablePrometheus = true

# 商业 API 鉴权和用户带宽限制
apiEnable = true
apiBaseurl = "${FRP_API_BASE_URL}"
apiToken = "${node.apitoken}"

# VPN 协议流量识别
vpnDetectEnable = true

# frps 登录连接频率限制
connLimitEnable = true
connLimitWindowSeconds = 300
connLimitMaxAttempts = 20
connLimitBanSeconds = 1800

# 封禁海外 IP
overseasIPBlockEnable = false

# 仅向客户端返回必要错误信息
detailedErrorsToClient = false

# 客户端认证
[auth]
method = "token"
token = "${node.nodetoken}"

# 管理面板
[webServer]
addr = "0.0.0.0"
port = ${node.adminPort}
user = "${username}"
password = "${password}"

# 日志配置
[log]
to = "./frps.log"
level = "warn"
maxDays = 3
disablePrintColor = true

# 传输配置
[transport]
tcpMux = true
tcpMuxKeepaliveInterval = 30
tcpKeepalive = 7200
maxPoolCount = 100000000
heartbeatTimeout = -1

# 开启隧道上报
[tunnelReport]
enable = true
intervalSeconds = 60

# 持久违规上报与管理侧封禁同步
[violationReport]
enable = true
statePath = "./data/violation.db"
isolationSeconds = 1800
syncIntervalSeconds = 15
maxPendingEvents = 10000

# 图片违规检测
[imageDetection]
enable = true
statePath = "./data/image-detection.db"
endpoint = "https://cloud-maas.qzhua.net/detect/upload"
modelVersion = "qzhua-nsfw-v1"
workers = 10
maxConnections = 64
maxCacheEntries = 250000
cacheTTLHours = 720
captureMemoryMiB = 32
maxImageBytes = 8388608
maxPixels = 10000000
maxDimension = 1024
jpegQuality = 80
riskThreshold = 0.75
requestsPerSecond = 10

# 文本违规检测
[textDetection]
enable = true
endpoint = "https://cloud-maas.qzhua.net/detect/text"
modelVersion = "qzhua-text-v1"
workers = 2`;
});
</script>
