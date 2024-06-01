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
                    <n-button type="primary">
                        生成
                    </n-button>
                    <n-button type="primary" @click="copyToClipboard">
                        复制
                    </n-button>
                </n-flex>
            </n-grid-item>
        </n-grid>
        <template #footer>
            <n-card>
                <n-code :code="tunnelConfig" language="ini" word-wrap />
            </n-card>
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
                    <n-button text tag="a" href="https://docs.chcat.cn/docs/chmlfrp/%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3/tutorial" target="_blank" type="primary">
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
import { ref } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage()

const copyToClipboard = () => {
    navigator.clipboard.writeText(tunnelConfig).then(() => {
        message.success('配置文件复制成功')
    }).catch(err => {
        console.error('复制连接地址失败:', err);
        message.error('连接地址复制失败')
    });
};

const nodeValue = ref(null)
const multipleSelectValue = ref(null)
const nodeOptions = [
    {
        label: '月球CN2-1',
        value: 'song2'
    },
    {
        label: '火星直连',
        value: 'song3'
    }
]

const tunnelOptions = [
    {
        label: 'Minecraft',
        value: 'song2'
    },
    {
        label: 'Terraria',
        value: 'song3'
    }
]

const tunnelConfig = `
[common]
server_addr = yq.frp.one
server_port = 7000
tls_enable = false
user = ChmlFrpTokenPreview
token = ChmlFrpToken

[Minecraft]
type = tcp
local_ip = 127.0.0.1
local_port = 54198
remote_port = 48125

[Terraria]
type = tcp
local_ip = 127.0.0.1
local_port = 54198
remote_port = 55117
`

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