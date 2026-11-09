<template>
    <n-back-top :right="100" />
    <n-card title="配置文件">
        <n-grid :x-gap="12" :y-gap="12" cols="1 m:12" item-responsive responsive="screen">
            <n-grid-item span="1 m:2">
                <n-select v-model:value="nodeValue" :options="nodeOptions" placeholder="请选择节点" />
            </n-grid-item>
            <n-grid-item span="1 m:4">
                <n-select
                    placeholder="请选择隧道，不选则该节点全部隧道"
                    v-model:value="multipleSelectValue"
                    filterable
                    multiple
                    tag
                    :options="tunnelOptions"
                />
            </n-grid-item>
            <n-grid-item span="1 m:2">
                <n-tooltip trigger="hover" style="width: 100%">
                    <template #trigger>
                        <n-select
                            v-model:value="connectionProtocol"
                            :options="protocolOptions"
                            :disabled="configFormat === 'ini'"
                            aria-label="连接协议"
                            style="width: 100%"
                        />
                    </template>
                    与节点的通信协议，部分情况QUIC可能会优化连接；INI 格式固定使用 TCP
                </n-tooltip>
            </n-grid-item>
            <n-grid-item span="1 m:2">
                <n-select v-model:value="configFormat" :options="configFormatOptions" aria-label="配置文件格式" />
            </n-grid-item>
            <n-grid-item span="1 m:2">
                <n-flex justify="end">
                    <n-button
                        type="primary"
                        @click="getConfigFile"
                        :disabled="nodeValue === null"
                        :loading="loadingGenerate"
                        >生成</n-button
                    >
                </n-flex>
            </n-grid-item>
        </n-grid>
        <template #footer>
            <n-grid cols="1 m:3" item-responsive responsive="screen" :x-gap="12" :y-gap="12">
                <n-grid-item span="1 m:2">
                    <n-card :title="configFileName">
                        <template #header-extra>
                            <n-space>
                                <n-button text @click="handleCopy('tunnelConfig')">
                                    <n-icon :component="CopyOutline" />
                                </n-button>
                                <n-button text @click="downloadConfig" :disabled="tunnelConfig === ''">
                                    <n-icon :component="DownloadOutline" />
                                </n-button>
                            </n-space>
                        </template>
                        <n-code :code="tunnelConfig" :language="configFormat" word-wrap v-if="tunnelConfig !== ''" />
                        <div v-else-if="loadingGenerate">
                            <n-skeleton text width="68.93px" />
                            <br />
                            <n-skeleton text width="235px" />
                            <br />
                            <n-skeleton text width="150px" />
                            <br />
                            <n-skeleton text width="150px" />
                            <br />
                            <n-skeleton text width="270px" />
                            <br />
                            <n-skeleton text width="165px" />
                            <br />
                            <br />
                            <n-skeleton text width="80px" />
                            <br />
                            <n-skeleton text width="85px" />
                            <br />
                            <n-skeleton text width="180px" />
                            <br />
                            <n-skeleton text width="150px" />
                            <br />
                            <n-skeleton text width="160px" />
                        </div>
                        <n-empty v-else description="请生成配置文件" />
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card title="启动代码">
                        <template #header-extra>
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    <n-button text @click="handleCopy('startupCode')">
                                        <n-icon :component="CopyOutline" />
                                    </n-button>
                                </template>
                                QUIC 快捷启动请使用支持该协议的最新版 ChmlFrp 客户端
                            </n-tooltip>
                        </template>
                        <n-code :code="startupCode" language="powershell" word-wrap v-if="startupCode !== ''" />
                        <div v-else-if="loadingGenerate">
                            <n-skeleton text :repeat="3" /> <n-skeleton text style="width: 60%" />
                        </div>
                        <n-empty v-else description="请生成配置文件" />
                    </n-card>
                </n-grid-item>
            </n-grid>
        </template>
    </n-card>
    <n-grid style="margin-top: 20px" cols="1 s:5" responsive="screen" :x-gap="20" :y-gap="20">
        <n-grid-item :span="3">
            <n-card title="常见教程">
                <template #header-extra>
                    <n-button text tag="a" href="https://docs.chmlfrp.net" target="_blank" type="primary">
                        更多教程
                    </n-button>
                </template>
                <n-h4>获取访客真实 IP</n-h4>
                <n-h5>HTTP 隧道</n-h5>
                <n-p>
                    FRP 默认通过 <n-text code>X-Forwarded-For</n-text> 请求头传递访客 IP。
                    在应用中配置受信任的代理，按代理链解析该请求头，避免把访客自行填写的值当作真实 IP。
                </n-p>
                <n-h5>TCP、HTTPS 和 UDP 隧道</n-h5>
                <n-p>
                    TCP 隧道（包括用 TCP 映射网站）和 HTTPS 透传可使用 PROXY Protocol v2，接收端须支持该协议。
                    UDP 隧道也可使用 v2，接收端须支持解析 UDP 数据报中的 PROXY 头。
                </n-p>
                <n-ol>
                    <n-li>
                        <n-p>
                            在「编辑隧道 → 高级设置 → 额外参数」加入下方设置，保存后在本页重新生成 TOML 配置。
                            已填写旧版 INI 参数时，请先移除旧写法。
                        </n-p>
                        <n-code code='transport.proxyProtocolVersion = "v2"' language="toml" word-wrap />
                        <n-p>
                            手动修改生成的 TOML 时，在目标隧道的 <n-text code>[proxies.transport]</n-text> 段写
                            <n-text code>proxyProtocolVersion = "v2"</n-text>。如使用旧版 INI，在下载的
                            <n-text code>[隧道名]</n-text> 段使用
                            <n-text code>proxy_protocol_version = v2</n-text>，并移除该段中带入的 TOML 写法。
                        </n-p>
                    </n-li>
                    <n-li>
                        <n-p>
                            以下以 frpc 和 Nginx 同机部署的 TCP 网站隧道为例。为隧道配置独立的监听端口，
                            将隧道的本地 IP 和端口设为 <n-text code>127.0.0.1</n-text> 和
                            <n-text code>8081</n-text>，Nginx 需包含 HTTP Real IP 模块。
                        </n-p>
                        <n-code :code="nginxProxyProtocolConfig" language="nginx" word-wrap />
                        <n-p>
                            HTTPS 透传可改用 <n-text code>listen 127.0.0.1:8443 ssl proxy_protocol;</n-text>，
                            保留站点证书配置，并将隧道的本地端口改为 8443。普通直连流量应使用其他端口。
                            如果两者分开部署，请监听内网地址，通过防火墙限制来源，并在
                            <n-text code>set_real_ip_from</n-text> 中填写 Nginx 实际看到的 frpc 来源地址。
                        </n-p>
                    </n-li>
                    <n-li>
                        <n-p>
                            用 <n-text code>nginx -t</n-text> 检查配置，通过后重载 Nginx，再用新配置启动 frpc。
                            从外部访问隧道，在 Nginx 访问日志中查看 <n-text code>$remote_addr</n-text>。
                            如果 Nginx 还反向代理到应用，在对应的 <n-text code>location</n-text> 中设置
                            <n-text code>proxy_set_header X-Real-IP $remote_addr;</n-text>，应用即可读取
                            <n-text code>X-Real-IP</n-text>。
                        </n-p>
                    </n-li>
                </n-ol>
                <n-h4>通过代理连接节点</n-h4>
                <n-p>
                    ChmlFrp可以通过http、socks5代理与节点建立连接。(此功能仅在tcp隧道生效)
                    <br />
                    创建隧道时添加额外参数：
                    <n-code code="http_proxy = http://user:pwd@127.0.0.1:7890" language="ini" word-wrap />
                    即可。其中'http://user:pwd@127.0.0.1:7890'为代理链接，如果代理没有密码可以不要'user:pwd@'，同时，也可以将http改为socks5实现socks5代理。
                </n-p>
            </n-card>
        </n-grid-item>
        <n-grid-item :span="2">
            <n-card title="映射启动">
                <template #header-extra>
                    <n-button
                        text
                        tag="a"
                        href="https://docs.chmlfrp.net/docs/use/mapping.html"
                        target="_blank"
                        type="primary"
                    >
                        详细教程
                    </n-button>
                </template>
                <n-steps vertical :current="3">
                    <n-step title="步骤1" description="在隧道页面创建隧道" />
                    <n-step title="步骤2" description="在网站下载页面下载对应的软件版本(一般为amd64)" />
                    <n-step
                        title="步骤3"
                        description="解压好下载的软件后，打开frpc.toml，在里面粘贴此页面生成的配置文件，然后保存"
                    />
                    <n-step title="步骤4" description="在frp的windows路径栏输入cmd然后回车，启动cmd软件" />
                    <n-step title="步骤4" description="在打开的cmd内输入frpc启动映射" />
                </n-steps>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import {
    configFormatOptions,
    connectionProtocolOptions,
    frpcStartCommand,
    type ConfigFormat,
    type ConnectionProtocol,
} from '@/utils/frpcTransport';
import { CopyOutline, DownloadOutline } from '@vicons/ionicons5';
// 获取登录信息
import { useUserStore } from '@/stores/user';

import api from '@/api';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const message = useMessage();

onMounted(() => {
    void getTunnelList();
    void api.v2.node.getNodeList().then((response) => {
        quicNodes.value = new Set(response.data.filter((node) => node.quic === true).map((node) => node.name));
    }).catch(() => { /* TCP remains available if node capability lookup fails. */ });
});

// 下载配置文件
const downloadConfig = () => {
    if (!tunnelConfig.value) {
        message.warning('请先生成配置文件');
        return;
    }

    try {
        // 创建 Blob 对象
        const blob = new Blob([tunnelConfig.value], { type: 'text/plain;charset=utf-8' });

        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = configFileName.value;

        // 触发下载
        document.body.appendChild(link);
        link.click();

        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        message.success('配置文件下载成功');
    } catch (err) {
        console.error('下载配置文件失败:', err);
        message.error('配置文件下载失败');
    }
};

interface Tunnel {
    id: number;
    name: string;
    node: string;
}

// 选择框相关的变量
const nodeValue = ref<string | null>(null);
const multipleSelectValue = ref<string[]>([]);
const nodeOptions = ref<{ label: string; value: string }[]>([]);
const tunnelOptions = ref<{ label: string; value: string }[]>([]);
const allTunnels = ref<{ id: number; name: string; node: string }[]>([]); // 用于存储所有隧道
const tunnelConfig = ref<string>('');
const LinuxScript = ref<string>('');
const startupCode = ref<string>('');
const loadingGenerate = ref(false);
const connectionProtocol = ref<ConnectionProtocol>('tcp');
const configFormat = ref<ConfigFormat>('toml');
const configFileName = computed(() => (configFormat.value === 'ini' ? 'Frpc.ini' : 'Frpc.toml'));
const quicNodes = ref(new Set<string>());
const quicAvailable = computed(() => nodeValue.value !== null && quicNodes.value.has(nodeValue.value));
const protocolOptions = computed(() => connectionProtocolOptions(quicAvailable.value));
let configVersion = 0;

const clearGeneratedConfig = () => {
    tunnelConfig.value = '';
    LinuxScript.value = '';
    startupCode.value = '';
};
watch(quicAvailable, (available) => { if (!available) connectionProtocol.value = 'tcp'; });
watch(configFormat, (format) => { if (format === 'ini') connectionProtocol.value = 'tcp'; });
watch([nodeValue, multipleSelectValue, connectionProtocol, configFormat], () => {
    ++configVersion;
    clearGeneratedConfig();
    loadingGenerate.value = false;
}, { deep: true, flush: 'sync' });

// 获取隧道列表 API
const getTunnelList = async () => {
    try {
        const response = await api.v2.tunnel.getTunnelList();

        const tunnels: Tunnel[] = response.data || [];

        // 保存所有隧道数据
        allTunnels.value = tunnels.map((t: Tunnel) => ({
            id: t.id,
            name: t.name,
            node: t.node,
        }));

        // 生成节点选项
        const nodes = Array.from(new Set(tunnels.map((t: Tunnel) => t.node)));
        nodeOptions.value = nodes.map((node: string) => ({
            label: node,
            value: node,
        }));
    } catch (error) {
        message.error('获取隧道列表失败: ' + (error as Error).message);
    }
};

// 动态更新隧道选项
watch(nodeValue, (newNode: string | null) => {
    if (newNode) {
        // 当节点变化时清空已选择的隧道
        multipleSelectValue.value = [];

        // 筛选出该节点的隧道
        tunnelOptions.value = allTunnels.value
            .filter((tunnel) => tunnel.node === newNode)
            .map((tunnel) => ({
                label: tunnel.name,
                value: tunnel.id.toString(),
            }));
    } else {
        tunnelOptions.value = []; // 没有选择节点时，清空隧道选项
    }
});

// 获取配置文件 API
const getConfigFile = async () => {
    const node = nodeValue.value;
    if (!node) return;
    const protocol = configFormat.value === 'ini' ? 'tcp' : connectionProtocol.value;
    const selectedIds = [...multipleSelectValue.value];
    const tunnels = allTunnels.value.filter((tunnel) => tunnel.node === node &&
        (selectedIds.length === 0 || selectedIds.includes(tunnel.id.toString())));
    const version = ++configVersion;
    clearGeneratedConfig();
    loadingGenerate.value = true;
    try {
        const names = selectedIds.length ? tunnels.map((tunnel) => tunnel.name).join(',') : undefined;
        const response = await api.v2.tunnel.getTunnelConfig(node, names, protocol, configFormat.value);
        if (version !== configVersion) return;
        tunnelConfig.value = response.data || '';
        startupCode.value = frpcStartCommand(userInfo?.usertoken, tunnels.map((tunnel) => tunnel.id), protocol);
        LinuxScript.value = frpcStartCommand(userInfo?.usertoken, tunnels.map((tunnel) => tunnel.id), protocol, 'unix');
    } catch (error) {
        if (version === configVersion) message.error('获取配置文件失败: ' + (error as Error).message);
    } finally {
        if (version === configVersion) loadingGenerate.value = false;
    }
};

const handleCopy = (type: string) => {
    let content = '';
    if (type === 'tunnelConfig') {
        content = tunnelConfig.value;
    } else if (type === 'LinuxScript') {
        content = LinuxScript.value;
    } else if (type === 'startupCode') {
        content = startupCode.value;
    }

    if (!content) {
        message.warning('请先生成配置文件');
        return;
    }
    navigator.clipboard
        .writeText(content)
        .then(() => message.success('复制成功'))
        .catch(() => message.error('复制失败'));
};

const nginxProxyProtocolConfig = `server {
    listen 127.0.0.1:8081 proxy_protocol;
    set_real_ip_from 127.0.0.1;
    real_ip_header proxy_protocol;

    # 保留原有站点的 server_name、root 或 location 等设置
}`;
</script>
