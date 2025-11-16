<template>
    <n-layout style="height: 100vh">
        <n-layout-header bordered>
            <HeaderComponent />
        </n-layout-header>
        <n-layout-content content-style="padding: 24px;">
            <n-card>
                <n-grid cols="2 m:4" responsive="screen">
                    <n-grid-item>
                        <n-statistic label="当前连接数" tabular-nums>
                            <template #prefix>
                                <n-icon :component="LinkOutline" />
                            </template>
                            <n-number-animation :from="0" show-separator :to="1203924" />
                        </n-statistic>
                    </n-grid-item>
                    <n-grid-item>
                        <n-statistic label="今日上传流量" tabular-nums>
                            <template #prefix>
                                <n-icon :component="ArrowUpOutline" />
                            </template>
                            <n-number-animation :from="0" :to="120.39" :precision="2" />
                            <template #suffix> TiB </template>
                        </n-statistic>
                    </n-grid-item>
                    <n-grid-item>
                        <n-statistic label="今日下载流量" tabular-nums>
                            <template #prefix>
                                <n-icon :component="ArrowDownOutline" />
                            </template>
                            <n-number-animation :from="0" :to="421.26" :precision="2" />
                            <template #suffix> TiB </template>
                        </n-statistic>
                    </n-grid-item>
                    <n-grid-item>
                        <n-statistic label="数据更新时间" tabular-nums> 2024-6-2 18:56 </n-statistic>
                    </n-grid-item>
                </n-grid>
            </n-card>
            <n-grid style="margin-top: 24px" cols="1 m:3" responsive="screen" x-gap="15" y-gap="15">
                <n-grid-item>
                    <n-card style="height: 192px">
                        <n-flex justify="space-around" size="large">
                            <n-flex vertical class="state">
                                节点状态
                                <n-icon style="margin-top: 10px" size="60" :component="EarthOutline" color="#18a05a" />
                                <div style="margin-top: 10px">在线</div>
                            </n-flex>
                            <n-flex vertical class="state">
                                隧道状态
                                <n-icon
                                    style="margin-top: 10px"
                                    size="60"
                                    :component="HardwareChipOutline"
                                    color="#fa541c"
                                />
                                <div style="margin-top: 10px">未启动</div>
                            </n-flex>
                        </n-flex>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card style="height: 192px" size="small" class="state">
                        <template #header>
                            ChmlFrp-Tunnel
                            <span style="color: gray; font-size: 14px">#114514</span>
                        </template>
                        <n-thing>
                            <template #description>
                                <n-flex justify="center">
                                    <n-space size="small">
                                        <n-tag :bordered="false" type="primary">
                                            127.0.0.1:25565 - TCP -> yq.frp.one:12521
                                        </n-tag>
                                    </n-space>
                                </n-flex>
                            </template>
                            客户端：ChmlFrp-0.51.2<br />
                            <a @click="copyToClipboard('frp.one')" style="cursor: pointer; color: inherit">
                                连接地址：yq.frp.one:12521 </a
                            ><br />
                            <span style="color: gray; font-size: 10px"> 2024-5-30 0:00 </span>
                        </n-thing>
                    </n-card>
                </n-grid-item>
                <n-grid-item>
                    <n-card size="small" style="height: 192px">
                        <template #header>
                            月球CN2-1
                            <span style="color: gray; font-size: 14px">#1</span>
                        </template>
                        <template #header-extra>
                            <n-flex>
                                <n-tag round :bordered="false" type="warning"> VIP </n-tag>
                            </n-flex>
                        </template>
                        <n-flex justify="space-around" size="large" align="center">
                            <n-progress type="circle" :percentage="20" />
                            <n-descriptions label-placement="left" :column="1">
                                <n-descriptions-item label="上传"> 10TiB </n-descriptions-item>
                                <n-descriptions-item label="下载"> 20TiB </n-descriptions-item>
                                <n-descriptions-item label="连接数"> 300 </n-descriptions-item>
                                <n-descriptions-item label="CPU占用"> 30% </n-descriptions-item>
                            </n-descriptions>
                        </n-flex>
                    </n-card>
                </n-grid-item>
            </n-grid>
            <n-card title="其他信息" style="margin-top: 24px">
                <n-alert title="此信息需经过验证" type="info">
                    隧道详情信息公开，可以随意分享，"其他信息"板块需验证此隧道是否为本人所拥有，除本人外其他人访问均不会显示此板块信息，您可以放心分享此页面。
                </n-alert>
                <n-collapse style="margin-top: 15px">
                    <n-collapse-item title="此隧道单独的配置文件" name="1">
                        <div>
                            <n-code :code="tunnelConfig" language="ini" word-wrap />
                        </div>
                        <template #header-extra>
                            <n-button type="primary" strong secondary round> 复制 </n-button>
                        </template>
                    </n-collapse-item>
                    <n-collapse-item title="快速启动指令" name="2">
                        <div>
                            <n-code :code="startInstruction" language="powershell" word-wrap />
                        </div>
                        <template #header-extra>
                            <n-button type="primary" strong secondary round> 复制 </n-button>
                        </template>
                    </n-collapse-item>
                </n-collapse>
            </n-card>
            <n-card style="margin-top: 24px" title="关联程序">
                <template #header-extra>
                    <n-select v-model:value="value" :options="options" style="width: 100px" placeholder="关联程序" />
                </template>
                <div v-if="value === '我的世界'">
                    <div class="state" style="display: flex; align-items: center">
                        <n-image width="72" :src="imgSrc" />
                        <div style="text-align: left; margin-left: 16px">
                            <h3 style="margin: 0">yq.frp.one:21421</h3>
                            <div style="margin: 0; margin-top: 4px" v-html="htmlMotd"></div>
                        </div>
                    </div>
                    <n-card style="margin-top: 15px" :style="cardStyle">
                        <n-descriptions label-placement="top" :column="screenWidth >= 600 ? 6 : 2" size="large">
                            <n-descriptions-item label="状态">
                                {{ mconline }}
                            </n-descriptions-item>
                            <n-descriptions-item label="MC版本">
                                {{ mcversion }}
                            </n-descriptions-item>
                            <n-descriptions-item label="人数">
                                {{ mcplayersonline }} / {{ mcplayersmax }}
                            </n-descriptions-item>
                            <n-descriptions-item label="PING">
                                {{ ping }}
                            </n-descriptions-item>
                            <n-descriptions-item label="SRV解析">
                                {{ srv }}
                            </n-descriptions-item>
                            <n-descriptions-item label="software">
                                {{ software }}
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-card>
                    <n-divider> 玩家列表(虚假的在线人数或人数过多的服务器不会显示) </n-divider>
                    <n-grid cols="1 s:2 m:4 l:5 xl:6 2xl:7" :y-gap="8" :x-gap="8" responsive="screen">
                        <n-grid-item>
                            <n-card>
                                <MinecraftSkinViewer
                                    skinUrl="http://textures.minecraft.net/texture/d9e065e0c8f874f1cac8eb3d96c09931282084e5930b76b3288577025f7af9c1"
                                    capeUrl="http://textures.minecraft.net/texture/f9a76537647989f9a0b6d001e320dac591c359e9e61a31f4ce11c88f207f0ad4"
                                    playerName="mc_chaoji"
                                />
                            </n-card>
                        </n-grid-item>
                        <n-grid-item>
                            <n-card>
                                <MinecraftSkinViewer
                                    skinUrl="https://crafatar.com/skins/f6e4c79c159b47af8c2e8f3e5be88ae3"
                                    playerName="keqityh"
                                />
                            </n-card>
                        </n-grid-item>
                        <n-grid-item>
                            <n-card>
                                <MinecraftSkinViewer
                                    skinUrl="https://crafatar.com/skins/460c4e73a6b045978a7919e546ca425d"
                                    playerName="404Control"
                                />
                            </n-card>
                        </n-grid-item>
                        <n-grid-item>
                            <n-card>
                                <MinecraftSkinViewer
                                    skinUrl="https://crafatar.com/skins/a271adc118a84c819375d4f5de7e093d"
                                    playerName="MilkyMay5201314"
                                />
                            </n-card>
                        </n-grid-item>
                    </n-grid>
                </div>
                <div v-if="value === '网页'"></div>
                <div v-if="value === '无'">
                    <n-empty description="暂无隧道关联程序" />
                </div>
            </n-card>
        </n-layout-content>
    </n-layout>
</template>

<script setup lang="ts">
import axios from 'axios';
import { EarthOutline, LinkOutline, ArrowUpOutline, ArrowDownOutline, HardwareChipOutline } from '@vicons/ionicons5';
import { useStyleStore } from '@/stores/style';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());

const message = useMessage();

const value = ref('我的世界');

const htmlMotd = ref<string>('');
const imgSrc = ref<string>('');
const mcversion = ref<string>('');
const mconline = ref<string>('');
const mcplayersmax = ref<string>('');
const mcplayersonline = ref<string>('');
const ping = ref<string>('');
const srv = ref<string>('');
const software = ref<string>('');

onMounted(async () => {
    try {
        const response = await axios.get('https://api.mcsrvstat.us/3/mc.hypixel.net');
        if (response.data.online) {
            // MC服务器MOTD(介绍)
            let motdContent = response.data.motd.html;
            if (Array.isArray(motdContent)) {
                htmlMotd.value = motdContent.join('<br/>');
            } else {
                console.error('API响应中需要一个数组');
            }
            // MC服务器头像
            imgSrc.value = response.data.icon;
            // MC服务器版本
            mcversion.value = response.data.version;
            // MC服务器在线状态
            mconline.value = '在线';
            mcplayersmax.value = response.data.players.max;
            mcplayersonline.value = response.data.players.online;
            if (response.data.debug.ping) {
                ping.value = '允许';
            } else {
                ping.value = '不允许';
            }
            if (response.data.debug.srv) {
                srv.value = '是';
            } else {
                srv.value = '否';
            }
            if (response.data.software !== undefined) {
                software.value = response.data.software;
            } else {
                software.value = '未提供';
            }
        } else {
            mconline.value = '离线';
        }
    } catch (error) {
        console.error('无法获取数据：', error);
    }
});

const options = [
    {
        label: '无',
        value: '无',
    },
    {
        label: '我的世界',
        value: '我的世界',
    },
    {
        label: '网页',
        value: '网页',
    },
];

const startInstruction = `
./frpc.exe -u ChmlFrpTokenPreview -p 114514
`;

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
`;

const copyToClipboard = (text: string) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            message.success('连接地址复制成功');
        })
        .catch((err) => {
            console.error('复制连接地址失败:', err);
            message.error('连接地址复制失败');
        });
};
</script>

<style>
.state {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}
</style>
