<template>
    <n-back-top :right="100" />
    <n-card title="配置文件">
        <n-grid :x-gap="12" :y-gap="12" cols="9" item-responsive responsive="screen">
            <n-grid-item span="10 m:2">
                <n-select v-model:value="nodeValue" :options="nodeOptions" placeholder="请选择节点" />
            </n-grid-item>
            <n-grid-item span="10 m:5">
                <n-select placeholder="请选择隧道，不选则该节点全部隧道" v-model:value="multipleSelectValue" filterable multiple tag
                    :options="tunnelOptions" />
            </n-grid-item>
            <n-grid-item span="10 m:2">
                <n-flex justify="end">
                    <n-button type="primary" @click="getConfigFile" :disabled="nodeValue === null"
                        :loading="loadingGenerate">生成</n-button>
                    <n-button type="primary" @click="copyToClipboard" :disabled="tunnelConfig === ''">复制</n-button>
                </n-flex>
            </n-grid-item>
        </n-grid>
        <template #footer>
            <n-grid cols="1 m:3" item-responsive responsive="screen" :x-gap="12" :y-gap="12">
                <n-grid-item span="1 m:2">
                    <n-card title="Frpc.ini">
                        <template #header-extra>
                            <n-button text @click="handleCopy('tunnelConfig')">
                                <n-icon :component="CopyOutline" />
                            </n-button>
                        </template>
                        <n-code :code="tunnelConfig" language="ini" word-wrap v-if="tunnelConfig !== ''" />
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
                    <n-card title="Linux脚本">
                        <template #header-extra>
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    <n-button text @click="handleCopy('LinuxScript')">
                                        <n-icon :component="CopyOutline" />
                                    </n-button>
                                </template>
                                不建议使用，问题很多，建议后续更新
                            </n-tooltip>
                        </template>
                        <n-code :code="LinuxScript" language="powershell" word-wrap v-if="LinuxScript !== ''" />
                        <div v-else-if="loadingGenerate">
                            <n-skeleton text :repeat="3" /> <n-skeleton text style="width: 60%" />
                        </div>
                        <n-empty v-else description="请生成配置文件" />
                    </n-card>
                </n-grid-item>
            </n-grid>
        </template>
    </n-card>
    <n-grid style="margin-top: 20px;" cols="1 s:5" responsive="screen" :x-gap="20" :y-gap="20">
        <n-grid-item :span="3">
            <n-card title="常见教程">
                <template #header-extra>
                    <n-button text tag="a" href="https://docs.chcat.cn" target="_blank" type="primary">
                        更多教程
                    </n-button>
                </template>
                <n-h4>获取真实IP</n-h4>
                <n-p>
                    创建隧道时添加额外参数：
                    <n-code code="proxy_protocol_version = v2" language="ini" />
                    即可。<br />
                    web服务可以通过在nginx配置中启用"Proxy Protocol"的解析并将结果设置在"X-Real-IP"这个Header中就可以在自己的Web服务中通过
                    X-Real-IP 获取到用户的真实 IP。<br />
                    操作：<br />
                    打开nginx网站的配置文件，将
                    <n-code :code="nginxConfig1" language="nginx" word-wrap />
                    改为
                    <n-code :code="nginxConfig2" language="nginx" word-wrap />
                    随后，在配置文件中随便找个位置放入这三行代码：
                    <n-code :code="nginxConfig3" language="nginx" word-wrap />
                </n-p>
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
                    <n-button text tag="a"
                        href="https://docs.chcat.cn/docs/chmlfrp/%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3/tutorial"
                        target="_blank" type="primary">
                        详细教程
                    </n-button>
                </template>
                <n-steps vertical :current="3">
                    <n-step title="步骤1" description="在隧道页面创建隧道" />
                    <n-step title="步骤2" description="在网站下载页面下载对应的软件版本(一般为amd64)" />
                    <n-step title="步骤3" description="解压好下载的软件后，打开frpc.ini，在里面粘贴此页面生成的配置文件，然后保存" />
                    <n-step title="步骤4" description="在frp的windows路径栏输入cmd然后回车，启动cmd软件" />
                    <n-step title="步骤4" description="在打开的cmd内输入frpc启动映射" />
                </n-steps>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { ref } from 'vue';
import { CopyOutline } from '@vicons/ionicons5'
// 获取登录信息
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const message = useMessage()

onMounted(() => {
    getTunnelList();
});

const copyToClipboard = () => {
    navigator.clipboard.writeText(tunnelConfig.value).then(() => {
        message.success('配置文件复制成功')
    }).catch(err => {
        console.error('复制配置文件失败:', err);
        message.error('配置文件复制失败')
    });
};

interface Tunnel {
    name: string;
    node: string;
}

// 选择框相关的变量
const nodeValue = ref<string | null>(null);
const multipleSelectValue = ref<string[]>([]);
const nodeOptions = ref<{ label: string; value: string }[]>([]);
const tunnelOptions = ref<{ label: string; value: string }[]>([]);
const allTunnels = ref<{ name: string; node: string }[]>([]); // 用于存储所有隧道
const tunnelConfig = ref<string>('');
const LinuxScript = ref<string>('');
const loadingGenerate = ref(false);

// 获取隧道列表 API
const getTunnelList = async () => {
    try {
        const response = await axios.get(`https://cf-v2.uapis.cn/tunnel?token=${userInfo?.usertoken}`);

        if (response.data.code !== 200) {
            console.error('获取隧道列表失败:', response.data.msg);
            message.error('获取隧道列表失败: ' + response.data.msg);
            return;
        }

        const tunnels: Tunnel[] = response.data.data;

        // 保存所有隧道数据
        allTunnels.value = tunnels.map((t: Tunnel) => ({
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
        console.error('API响应失败:', error);
        message.error('API响应失败:' + error);
    }
};

// 动态更新隧道选项
watch(nodeValue, (newNode: string | null) => {
    if (newNode) {
        // 当节点变化时清空已选择的隧道
        multipleSelectValue.value = [];

        // 筛选出该节点的隧道
        tunnelOptions.value = allTunnels.value
            .filter(tunnel => tunnel.node === newNode)
            .map(tunnel => ({
                label: tunnel.name,
                value: tunnel.name,
            }));
    } else {
        tunnelOptions.value = []; // 没有选择节点时，清空隧道选项
    }
});

// 获取配置文件 API
const getConfigFile = async () => {
    tunnelConfig.value = '';
    LinuxScript.value = '';
    loadingGenerate.value = true;
    try {
        const params: {
            token: string | undefined;
            node: string | null;
            tunnel_names?: string;
        } = {
            token: userInfo?.usertoken,
            node: nodeValue.value,
        };

        const response = await axios.get('https://cf-v2.uapis.cn/tunnel_config', { params });
        if (response.data.state !== 'success') {
            message.success('获取配置文件失败:' + response.data.msg);
            tunnelConfig.value = response.data.msg;
            LinuxScript.value = response.data.msg;
            loadingGenerate.value = false;
            return null;
        }

        // 如果选择了隧道才传递 tunnel_names 参数
        if (multipleSelectValue.value.length > 0) {
            params.tunnel_names = multipleSelectValue.value.join(',');
            LinuxScript.value = `curl -O https://www.chmlfrp.cn/script/linux/frpc_install.sh && chmod +x frpc_install.sh && sudo ./frpc_install.sh "${userInfo?.usertoken}" "${nodeValue.value}" "${params.tunnel_names = multipleSelectValue.value.join(',')}"`
        } else {
            LinuxScript.value = `curl -O https://www.chmlfrp.cn/script/linux/frpc_install.sh && chmod +x frpc_install.sh && sudo ./frpc_install.sh "${userInfo?.usertoken}" "${nodeValue.value}"`
        }

        tunnelConfig.value = response.data.data;
    } catch (error) {
        console.error('获取配置文件失败:', error);
        message.error('获取配置文件失败:' + error);
    }
    loadingGenerate.value = false;
};

const handleCopy = (type: string) => {
    const content = type === 'tunnelConfig' ? tunnelConfig.value : LinuxScript.value
    if (!content) {
        message.warning('请先生成配置文件')
        return
    }
    navigator.clipboard.writeText(content)
        .then(() => message.success('复制成功'))
        .catch(() => message.error('复制失败'))
}

const nginxConfig1 = `
listen 80;
listen 443 ssl http2; #如果有就改，没有则不添加这个。
`

const nginxConfig2 = `
listen 80 proxy_protocol;
listen 443 ssl http2 proxy_protocol;
`

const nginxConfig3 = `
real_ip_header proxy_protocol;
real_ip_recursive on;
set_real_ip_from 127.0.0.1; #创建隧道时填的本地ip
`
</script>