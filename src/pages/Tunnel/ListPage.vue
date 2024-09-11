<template>
    <n-back-top :right="100" />
    <n-modal v-model:show="nodeListModal">
        <n-card :style="widthStyle" title="选择节点" :bordered="false" role="dialog" aria-modal="true">
            <n-alert type="info" style="bottom: 12px;">
                为确保您的体验，请尽量选择负载低，距离近的节点。
            </n-alert>
            <n-flex justify="space-between" align="center">
                <n-flex>
                    <n-checkbox v-model:checked="filters.udp">
                        UDP
                    </n-checkbox>
                    <n-checkbox v-model:checked="filters.noPermission">
                        VIP
                    </n-checkbox>
                </n-flex>
                <n-flex>
                    <n-button-group>
                        <n-button round size="small" :type="filters.web === 'all' ? 'primary' : 'default'"
                            @click="filterWeb('all')">
                            全部
                        </n-button>
                        <n-button size="small" :type="filters.web === 'yes' ? 'primary' : 'default'"
                            @click="filterWeb('yes')">
                            可建站
                        </n-button>
                        <n-button round size="small" :type="filters.web === 'no' ? 'primary' : 'default'"
                            @click="filterWeb('no')">
                            不可建站
                        </n-button>
                    </n-button-group>
                    <n-button-group>
                        <n-button round size="small" :type="filters.region === 'all' ? 'primary' : 'default'"
                            @click="filterRegion('all')">
                            全部
                        </n-button>
                        <n-button size="small" :type="filters.region === 'china' ? 'primary' : 'default'"
                            @click="filterRegion('china')">
                            境内
                        </n-button>
                        <n-button round size="small" :type="filters.region === 'overseas' ? 'primary' : 'default'"
                            @click="filterRegion('overseas')">
                            境外
                        </n-button>
                    </n-button-group>
                </n-flex>
            </n-flex>
            <n-empty v-if="nodeCards.length === 0" description="当前没有节点在线" />
            <n-empty v-else-if="filteredNodeCards.length === 0" description="您选择的分类没有任何节点" />
            <n-grid v-else style="margin-top: 12px" cols="1 m:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
                <n-grid-item v-for="(nodeCard, index) in filteredNodeCards" :key="index">
                    <n-card size="small" style="height: 90px" hoverable @click="handleNodeCardClick(nodeCard)">
                        <template #header>
                            <span style="color: gray;">
                                #{{ nodeCard.id }}
                            </span>
                            <n-divider vertical />
                            {{ nodeCard.name }}
                        </template>
                        <template #header-extra v-if="nodeCard.nodegroup === 'vip'">
                            <n-tag size="small" round type="warning">
                                VIP
                            </n-tag>
                        </template>
                        <n-space>
                            <n-tag :bordered="false" round size="small" type="success" v-if="nodeCard.web === 'yes'">
                                <template #icon>
                                    <n-icon :component="EarthOutline" />
                                </template>
                                建站
                            </n-tag>
                            <n-tag :bordered="false" round size="small" type="error" v-if="nodeCard.udp === 'false'">
                                <template #icon>
                                    <n-icon :component="BanOutline" />
                                </template>
                                UDP
                            </n-tag>
                            <n-tag :bordered="false" round size="small" type="info" v-if="nodeCard.fangyu === 'true'">
                                <template #icon>
                                    <n-icon :component="ShieldCheckmarkOutline" />
                                </template>
                                防御
                            </n-tag>
                        </n-space>
                    </n-card>
                </n-grid-item>
            </n-grid>
        </n-card>
    </n-modal>
    <n-modal v-model:show="nodeInfoModal">
        <n-card :style="widthStyle" size="small" :bordered="false" transform-origin="center" role="dialog"
            aria-modal="true">
            <n-tabs type="line" size="large" :tabs-padding="20" @update:value="handleTabChange">
                <n-tab-pane name="节点详情">
                    <n-p>节点负载</n-p>
                    <n-progress type="line" :percentage="24" :indicator-placement="'inside'" />
                    <n-p style="margin-top: 12px">节点详情</n-p>
                    <n-descriptions label-placement="left" size="medium" :column="screenWidth >= 600 ? 3 : 1" bordered>
                        <n-descriptions-item label="节点名">
                            {{ selectNode }}
                        </n-descriptions-item>
                        <n-descriptions-item label="地区">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.area }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="权限组">
                            <n-skeleton v-if="loadingTunnelInfo" width="37.09px" height="28px" round />
                            <n-tag v-else :type="NodeInfo.nodegroup === 'vip' ? 'warning' : 'info'" round>
                                {{ NodeInfo.nodegroup }}
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="防御">
                            <n-skeleton v-if="loadingTunnelInfo" width="60.65px" height="28px" round />
                            <n-tooltip v-else-if="NodeInfo.fangyu" trigger="hover">
                                <template #trigger>
                                    <n-tag round type="success">
                                        有防御
                                    </n-tag>
                                </template>
                                此节点有≥5Gbps的DDOS防御
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger>
                                    <n-tag round type="error">
                                        没防御
                                    </n-tag>
                                </template>
                                此节点没有防御或DDOS防御带宽小于5Gbps
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="建站">
                            <n-skeleton v-if="loadingTunnelInfo" width="46.65px" height="28px" round />
                            <n-tag v-else-if="NodeInfo.web === 'yes'" type="success" round>
                                允许
                            </n-tag>
                            <n-tag v-else type="error" round>
                                不允许
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="UDP">
                            <n-skeleton v-if="loadingTunnelInfo" width="46.65px" height="28px" round />
                            <n-tag v-else-if="NodeInfo.udp" type="success" round>
                                允许
                            </n-tag>
                            <n-tag v-else type="error" round>
                                不允许
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名过白">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-tooltip v-else-if="!NodeInfo.toowhite" trigger="hover">
                                <template #trigger>
                                    域名无需备案过白
                                </template>
                                此节点为国外或中国特别行政区，也可能自动过白，域名无需手动申请过白
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger>
                                    域名需过白
                                </template>
                                此节点为中国境内节点，并且无法自动过白，需要前往"扩展功能"-"域名过白"进行手动过白
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="端口限制">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.rport }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.ip }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="IP">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.realIp }}</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="IPV6">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else-if="NodeInfo.ipv6 !== null">{{ NodeInfo.ipv6 }}</n-p>
                            <n-p v-else>此节点没有公网IPv6</n-p>
                        </n-descriptions-item>
                        <n-descriptions-item label="带宽">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-tooltip v-else-if="NodeInfo.china === 'no'" trigger="hover">
                                <template #trigger>
                                    国外带宽
                                </template>
                                此节点走ChmlFrp国外带宽，您的国外带宽上限为{{ userInfo?.bandwidth ? userInfo.bandwidth * 4 : 32 }}m
                            </n-tooltip>
                            <n-tooltip v-else trigger="hover">
                                <template #trigger>
                                    国内带宽
                                </template>
                                此节点走ChmlFrp国内带宽，您的国内带宽上限为{{ userInfo?.bandwidth }}m
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="介绍">
                            <n-skeleton v-if="loadingTunnelInfo" text style="width: 100%" />
                            <n-p v-else>{{ NodeInfo.notes }}</n-p>
                        </n-descriptions-item>
                    </n-descriptions>
                </n-tab-pane>
                <n-tab-pane name="节点地图">
                    <n-alert type="info">
                        地图来自中国地理信息公共服务平台，经纬度通过浏览器获取，需要您的浏览器较新且同意浏览器获取位置信息才能正常访问。另外请不要使用代理软件，否则您可能会被定位到月球。
                    </n-alert>
                    <n-skeleton v-if="loadingNodeMap" text style="width: 100%; margin-top: 16px" height="500px" />
                    <MapComponent v-else style="margin-top: 16px" :width="'100%'" :height="'500px'"
                        :markers="markers" />
                </n-tab-pane>
            </n-tabs>
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="nodeInfoModal = false">取消</n-button>
                    <n-button @click="nodeDetails">上一步</n-button>
                    <n-button @click="goToTheTunnelDetails" type="primary">继续</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
    <n-modal v-model:show="tunnelInfoModal">
        <n-card style="width: 800px" title="创建隧道" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-row :gutter="15" style="margin-top: 15px;">
                <n-form ref="tunnelForm" :model="formData" size="medium" label-width="100px">
                    <n-col :span="12">
                        <n-form-item label="隧道名称" path="name">
                            <n-input v-model:value="formData.name" placeholder="请输入隧道名称" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="本地IP" path="localip">
                            <n-input v-model:value="formData.localip" placeholder="请输入本地IP" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="节点选择" path="node" @click="nodeDetails">
                            <n-select v-model:value="formData.node" placeholder="请选择节点" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="端口类型" path="type">
                            <n-select v-model:value="formData.type" :options="typeOptions" placeholder="请选择端口类型"
                                clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item label="内网端口" path="nport">
                                <n-input v-model:value="formData.nport" clearable placeholder="请输入内网端口" />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item v-if="formData.type === 'HTTP' || formData.type === 'HTTPS'" label="域名类型"
                            path="domainNameLabel">
                            <n-select v-model:value="formData.domainNameLabel" :options="domainTypeOptions"
                                placeholder="请选择域名类型" />
                        </n-form-item>
                        <n-form-item v-else label="外网端口" path="dorp">
                            <n-input v-model:value="formData.dorp" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="24"
                        v-if="formData.domainNameLabel === '自定义' && ( formData.type === 'HTTP' || formData.type === 'HTTPS' )">
                        <n-form-item label="域名" path="dorp">
                            <n-input v-model:value="formData.dorp" placeholder="请输入您的域名" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col
                        v-if="formData.domainNameLabel === '免费域名' && ( formData.type === 'HTTP' || formData.type === 'HTTPS' )"
                        :span="12">
                        <n-form-item label="请选择免费域名" path="choose">
                            <n-select v-model:value="formData.choose" :options="domainNameOptions"/>
                        </n-form-item>
                    </n-col>
                    <n-col
                        v-if="formData.domainNameLabel === '免费域名' && ( formData.type === 'HTTP' || formData.type === 'HTTPS' )"
                        :span="12">
                        <n-form-item label="新建域名" path="dorp">
                            <n-input v-model:value="formData.dorp" placeholder="请输入域名前缀" />
                        </n-form-item>
                    </n-col>
                    <n-collapse style="margin-top: 10px;">
                        <n-collapse-item title="高级设置">
                            <n-alert type="info" style="margin-bottom: 16px;">
                                不懂请不要设置，否则可能会导致无法启动隧道
                            </n-alert>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据加密</n-p>
                                    <n-switch v-model:value="formData.encryption" />
                                </n-flex>
                            </n-col>
                            <n-col :span="12">
                                <n-flex>
                                    <n-p>数据压缩</n-p>
                                    <n-switch v-model:value="formData.compression" />
                                </n-flex>
                            </n-col>
                            <n-form-item label="额外参数" path="ap" style="margin-top: 8px;">
                                <n-input v-model:value="formData.ap" type="textarea" />
                            </n-form-item>
                        </n-collapse-item>
                    </n-collapse>
                </n-form>
            </n-row>
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="generateRandomPort">随机外网端口</n-button>
                    <n-button @click="generateRandomTunnelName">随机隧道名</n-button>
                    <n-button @click="tunnelInfoModal = false">取消</n-button>
                    <n-button @click="createATunnelUp">上一步</n-button>
                    <n-button type="primary" @click="handleConfirm">确定</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
    <n-card style="margin-bottom: 20px;" title="隧道列表">
        <template #header-extra>
            <n-button round quaternary :loading="loadingTunnel" @click="fetchTunnelCards">
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="createNodes" :loading="addTheTunnelButtonShow" type="primary" round quaternary
                :disabled="addTheTunnelButtonShow">
                <template #icon>
                    <n-icon v-if="!addTheTunnelButtonShow" :component="AddOutline" />
                </template>
                添加隧道
            </n-button>
        </template>
    </n-card>
    <n-grid v-if="!loadingTunnel" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(card, index) in tunnelCards" :key="index">
            <n-card size="small">
                <template #header>
                    {{ card.name }}
                    <span style="color: gray; font-size: 14px;">{{ card.id }}</span>
                </template>
                <template #header-extra>
                    <n-tag round :bordered="false" :type="card.status?.type">
                        {{ card.status?.label }}
                    </n-tag>
                </template>
                <n-thing content-style="margin-top: 10px;">
                    <template #description>
                        <n-space size="small" style="margin-top: 4px">
                            <n-tag round v-for="(tag, tagIndex) in card.tags" :key="tagIndex" :bordered="false"
                                type="primary" size="small">
                                {{ tag }}
                            </n-tag>
                        </n-space>
                    </template>
                    <a @click="copyToClipboard(card.ip)" style="cursor: pointer; color: inherit;">
                        连接地址：{{ card.ip }}
                    </a><br>
                    <span style="color: gray; font-size: 10px;">
                        {{ card.uptime }}
                    </span>
                </n-thing>
                <template #footer>
                    <n-row class="center-content">
                        <n-col :span="8">
                            <div>
                                <n-icon :component="ArrowUpOutline" />
                                <n-number-animation show-separator :from="0"
                                    :to="formatBytes(card.today_traffic_in).value" />
                                {{ formatBytes(card.today_traffic_in).suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            <div>
                                <n-icon :component="ArrowDownOutline" />
                                <n-number-animation show-separator :from="0"
                                    :to="formatBytes(card.today_traffic_out).value" />
                                {{ formatBytes(card.today_traffic_out).suffix }}
                            </div>
                        </n-col>
                        <n-col :span="8">
                            连接数
                            <n-number-animation show-separator :from="0" :to="card.cur_conns" />
                        </n-col>
                    </n-row>
                </template>
                <template #action>
                    <n-flex justify="space-around">
                        <n-button round quaternary type="primary">
                            <template #icon>
                                <n-icon :component="CreateOutline" />
                            </template>
                            编辑
                        </n-button>
                        <n-button @click="goToTunnelInfo" round quaternary type="primary">
                            <template #icon>
                                <n-icon :component="EyeOutline" />
                            </template>
                            查看
                        </n-button>
                        <n-button round quaternary type="error" @click="handleConfirm(card.name, card.id)">
                            <template #icon>
                                <n-icon :component="TrashOutline" />
                            </template>
                            删除
                        </n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="240.2px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-card v-if="tunnelCards === null">
        <n-empty description="您似乎还没创建隧道">
            <template #extra>
                <n-button size="small" :loading="addTheTunnelButtonShow" @click="createNodes"
                    :disabled="addTheTunnelButtonShow">
                    <template #icon>
                        <n-icon v-if="!addTheTunnelButtonShow" :component="AddOutline" />
                    </template>
                    创建隧道
                </n-button>
            </template>
        </n-empty>
    </n-card>
</template>

<script setup lang="ts">
import { RefreshOutline, AddOutline, ArrowUpOutline, ArrowDownOutline, EyeOutline, TrashOutline, CreateOutline, BanOutline, EarthOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import axios from 'axios';
// 获取登录信息
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const router = useRouter();
const goToTunnelInfo = () => {
    const url = router.resolve({ path: '/tunnel/info' }).href;
    window.open(url, '_blank');
}

const message = useMessage()
const dialog = useDialog()

const nodeListModal = ref(false) // 节点列表模态框
const nodeInfoModal = ref(false) // 节点信息模态框
const tunnelInfoModal = ref(false) // 隧道信息模态框
const loadingTunnel = ref(true) // 用户隧道加载
const deletetButtonLoading = ref(false)
const loadingTunnelInfo = ref(false)
const loadingNodeMap = ref(false)

const addTheTunnelButtonShow = ref(false)

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const selectNode = ref(''); // 选中节点名

// 根据屏幕宽度决定对话框大小
const widthStyle = computed(() => ({
    width: screenWidth.value >= 600 ? '70%' : '100%',
}));

// 无限滚动
const count = ref(16)
const handleLoad = () => {
    count.value += 1
}

interface Domain {
    id: number
    domain: string
    remarks: string | null
    icpFiling: boolean
}

// 用于存储域名选项的数据
const domainNameOptions = ref([])

// 从 API 获取域名数据并将其格式化为 n-select 的选项格式
const subDomainData = async () => {
    try {
        const response = await axios.get('https://cf-v2.uapis.cn/list_available_domains')
        const domains = response.data.data

        domainNameOptions.value = domains.map((domain: Domain) => ({
            label: domain.domain, // 显示的域名名称
            value: domain.domain  // 选项的值
        }))
    } catch (error) {
        console.error('获取域名数据失败:', error)
    }
}

const formData = reactive({
    name: '',
    localip: '127.0.0.1',
    node: '',
    type: 'TCP',
    nport: '',
    domainNameLabel: '',
    dorp: 25565,
    choose: '',
    encryption: false,
    compression: false,
    ap: ''
});

const typeOptions = ['TCP', 'UDP', 'HTTP', 'HTTPS'].map((v) => ({
    label: v,
    value: v
}))

const domainTypeOptions = ['自定义', '免费域名'].map((v) => ({
    label: v,
    value: v
}))

// 随机生成一个10000~65535之间的外网端口
const generateRandomPort = () => {
    formData.dorp = Math.floor(Math.random() * 55535) + 10000;
}

// 随机生成一个8位的随机隧道名
const generateRandomTunnelName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomName += chars[randomIndex];
    }
    formData.name = randomName;
}

const handleConfirm = (title: string, id: number) => {
    dialog.warning({
        title: '警告',
        content: '您正在删除隧道：' + title + '(' + id + ')，请确认是否删除。',
        positiveText: '确定',
        negativeText: '取消',
        loading: deletetButtonLoading.value,
        onPositiveClick: async () => {
            deletetButtonLoading.value = true;
            deletetTunnel(title, id);
            deletetButtonLoading.value = false;
            if (tunnelCards.value !== null) {
                const index = tunnelCards.value.findIndex(tunnel => tunnel.name === title);
                if (index !== -1) {
                    tunnelCards.value.splice(index, 1);
                } else {
                    console.warn("未找到 title 为 " + title + " 的数据");
                }
            }
        },
    });
};

const deletetTunnel = async (title: string, id: number) => {
    try {
        const response = await axios.get(`https://cf-v1.uapis.cn/api/deletetl.php?token=${userInfo?.usertoken}&nodeid=${id}&userid=${userInfo?.id}`);
        if (response.data.code === 200) {
            message.success('成功删除隧道：' + title);
        } else {
            message.error(response.data.error);
        }
    } catch (error) {
        console.error('删除隧道API调用失败', error);
        message.error('删除隧道API调用失败' + error);
    }
};

onMounted(() => {
    fetchTunnelCards();
});

// 流量单位换算
function formatBytes(bytes: string | number): { value: number; suffix: string } {
    let num: number;
    if (typeof bytes === 'string') {
        num = parseFloat(bytes);
    } else {
        num = bytes;
    }
    const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    if (num === 0) return { value: 0, suffix: 'Bytes' };
    let index = 0;
    while (num >= 1024 && index < units.length - 1) {
        num /= 1024;
        index++;
    }
    return { value: parseFloat(num.toFixed(2)), suffix: units[index] };
}

interface NodeCard {
    id: number;
    name: string;
    nodegroup: string;
    web: string;
    china: string;
    fangyu: string;
    udp: string;
    area: string;
}

const nodeCards = ref<NodeCard[]>([]);

const createNodes = async () => {
    addTheTunnelButtonShow.value = true // 新建隧道按钮加载
    // 加载节点列表
    try {
        const response = await axios.get('https://cf-v2.uapis.cn/node');
        nodeCards.value = response.data.data.map((node: NodeCard) => ({
            id: node.id, // 节点ID
            name: node.name, // 节点名
            nodegroup: node.nodegroup, // 权限组
            web: node.web, // 是否允许建站
            china: node.china, // 是否为境内带宽
            fangyu: node.fangyu, // 防御
            udp: node.udp, // 是否允许UDP
            area: node.area // 地区
        }));
        nodeListModal.value = true // 显示节点列表模态框
    } catch (error) {
        console.error('[隧道列表]从api获取节点列表数据失败', error);
        message.error('[隧道列表]从api获取节点列表数据失败' + error);
    }
    addTheTunnelButtonShow.value = false // 新建隧道按钮取消加载
}

// 从本地存储中恢复过滤器状态
const storedFilters = localStorage.getItem('nodeFilters')
// 默认分类
const filters = ref(storedFilters ? JSON.parse(storedFilters) : {
    udp: false,
    noPermission: true,
    web: 'all',
    region: 'all'
})

const filterWeb = (web: string) => {
    filters.value.web = web
}

const filterRegion = (region: string) => {
    filters.value.region = region
}

// 节点分类
const filteredNodeCards = computed(() => {
    const filteredNodes = nodeCards.value.filter(node => {
        const matchUdp = filters.value.udp ? node.udp === 'true' : true;

        let matchNoPermission = true;
        if (userInfo?.usergroup) {
            matchNoPermission = filters.value.noPermission ? true : node.nodegroup === 'user';
        } else {
            matchNoPermission = filters.value.noPermission ? true : true;
        }

        const matchWeb = filters.value.web === 'all' || node.web === filters.value.web;
        const matchRegion = filters.value.region === 'all' ||
            (filters.value.region === 'china' && node.china === 'yes') ||
            (filters.value.region === 'overseas' && (node.china === 'no' || node.area.includes('香港') || node.area.includes('台湾')));

        return matchUdp && matchNoPermission && matchWeb && matchRegion;
    });

    // 对节点进行排序，VIP 节点在前，免费节点在后
    return filteredNodes.sort((a, b) => {
        if (a.nodegroup === 'vip' && b.nodegroup !== 'vip') return -1;
        if (a.nodegroup !== 'vip' && b.nodegroup === 'vip') return 1;
        return 0;
    });
});

const NodeInfo = ref({
    id: 1, //节点ID
    area: '', //节点地区
    realIp: '', //节点IP
    udp: true, //是否允许UDP
    notes: '', //节点介绍
    ip: '', //节点域名
    coordinates: '', //节点经纬度
    fangyu: true, //节点是否有防御
    rport: '10000~65535', //节点端口范围
    nodegroup: 'user', //节点权限组
    china: 'yes', //节点是否走国内带宽
    web: 'no', //节点是否允许web
    ipv6: null, //节点IPV6
    toowhite: false, //节点建站是否需要过白
    name: '', //节点名
    state: '', //节点状态
})

const handleNodeCardClick = async (card: NodeCard) => {
    if (card.nodegroup === 'vip' && userInfo?.usergroup === '免费用户') {
        message.warning('此节点为会员节点，您的权限不足');
        return;
    }
    selectNode.value = card.name;
    nodeListModal.value = false;
    nodeInfoModal.value = true;
    loadingTunnelInfo.value = true;
    try {
        const { data } = await axios.get(`https://cf-v2.uapis.cn/nodeinfo?token=${userInfo?.usertoken}&node=${card.name}`);
        if (data.code === 200) {
            Object.assign(NodeInfo.value, data.data);
        } else {
            message.error(data.error);
        }
    } catch (error) {
        message.error('节点详情API调用失败: ' + error);
    } finally {
        loadingTunnelInfo.value = false;
    }
};


const markers = [
    { position: [102.22092, 31.90059], title: '我的位置' },
    { position: [116.407428, 39.91923], title: '节点位置' }
];

const handleTabChange = async (activeName: string) => {
    loadingNodeMap.value = true;
    if (activeName === '节点地图') {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                markers[0] = { position: [longitude, latitude], title: '我的位置' };
                const nodeCoordinates = NodeInfo.value.coordinates.split(',').map(Number);
                if (nodeCoordinates.length === 2 && !isNaN(nodeCoordinates[0]) && !isNaN(nodeCoordinates[1])) {
                    markers[1] = { position: nodeCoordinates, title: '节点位置' };
                } else {
                    console.error('节点位置无效');
                }
                loadingNodeMap.value = false;
            }, error => {
                console.error('获取本机经纬度信息失败:', error);
                loadingNodeMap.value = false;
            });
        } else {
            console.error('浏览器不支持 Geolocation API');
            loadingNodeMap.value = false;
        }
    }
};

const nodeDetails = () => {
    nodeListModal.value = true // 显示节点选择模态框
    tunnelInfoModal.value = false // 取消显示创建隧道详情拟态框
    nodeInfoModal.value = false // 取消显示节点详情模态框
}

const createATunnelUp = () => {
    tunnelInfoModal.value = false // 取消显示创建隧道详情拟态框
    nodeInfoModal.value = true // 显示节点详情模态框
}

const goToTheTunnelDetails = () => {
    nodeInfoModal.value = false // 取消显示节点详情模态框
    tunnelInfoModal.value = true // 显示创建隧道详情拟态框
    formData.node = NodeInfo.value.name
    generateRandomPort();
    generateRandomTunnelName();
    subDomainData();
}

// 监听 filters 变化，并保存到本地存储
watch(filters, (newFilters) => {
    localStorage.setItem('nodeFilters', JSON.stringify(newFilters))
}, { deep: true })

// 定义接口
interface Status {
    type: string;
    label: string;
}

interface TunnelCard {
    id: number;
    name: string;
    localip: string;
    type: string;
    nport: string;
    node: string;
    state: string;
    uptime: string;
    today_traffic_in: string;
    today_traffic_out: string;
    cur_conns: string;
    ip: string;
    nodestate: string;
    status?: Status;
    tags?: string[];
}

// 创建响应式变量
const tunnelCards = ref<TunnelCard[] | null>(null);

// 异步函数获取数据
const fetchTunnelCards = async () => {
    loadingTunnel.value = true;
    try {
        const response = await axios.get<TunnelCard[]>(`https://cf-v1.uapis.cn/api/usertunnel.php?token=${userInfo?.usertoken}`);
        const data = response.data;

        // 判断 data 是否为空
        if (!data || data.length === 0) {
            loadingTunnel.value = false;
            tunnelCards.value = null;
        } else {
            // 映射数据并设置状态和标签
            tunnelCards.value = data.map(card => {
                let status: Status = { type: 'error', label: '离线' };

                if (card.nodestate === 'online') {
                    status = card.state === 'true'
                        ? { type: 'success', label: '在线' }
                        : { type: 'warning', label: '离线' };
                } else if (card.nodestate === 'offline') {
                    status = { type: 'error', label: '离线' };
                }
                // 设置 tags
                const tags = [
                    card.node,
                    `${card.localip}:${card.nport} - ${card.type}`
                ];
                return { ...card, status, tags };
            });
        }
    } catch (error) {
        //111
    }
    loadingTunnel.value = false;
};

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        message.success('连接地址复制成功')
    }).catch(err => {
        console.error('[隧道列表]复制连接地址失败:', err);
        message.error('连接地址复制失败')
    });
};
</script>

<style scoped>
.center-content {
    text-align: center;
}

.center-content>* {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.center-content n-row,
.center-content n-col {
    justify-content: center;
}

.mapDiv {
    width: 100%;
    height: 100%;
}
</style>