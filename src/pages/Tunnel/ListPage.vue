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
                        无权限
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
            <n-grid style="margin-top: 12px" cols="1 m:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
                <n-grid-item v-for="(nodeCard, index) in filteredNodeCards" :key="index">
                    <n-card size="small" style="height: 90px" hoverable @click="handleNodeCardClick(nodeCard)">
                        <template #header>
                            <span style="color: gray;">
                                #{{ nodeCard.id }}
                            </span>
                            <n-divider vertical />
                            {{ nodeCard.title }}
                        </template>
                        <template #header-extra v-if="nodeCard.group === 'vip'">
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
                            <n-tag :bordered="false" round size="small" type="info" v-if="nodeCard.defense === 'true'">
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
            <n-tabs type="line" size="large" :tabs-padding="20">
                <n-tab-pane name="节点详情">
                    <n-p>节点负载</n-p>
                    <n-progress type="line" :percentage="24" :indicator-placement="'inside'" />
                    <n-p style="margin-top: 12px">节点详情</n-p>
                    <n-descriptions label-placement="left" size="medium" :column="screenWidth >= 600 ? 3 : 1" bordered>
                        <n-descriptions-item label="节点名">
                            {{ selectNode }}
                        </n-descriptions-item>
                        <n-descriptions-item label="地区">
                            美国俄亥俄州辛辛那提
                        </n-descriptions-item>
                        <n-descriptions-item label="权限组">
                            <n-tag type="info">
                                user
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="禁PING">
                            <n-tag type="warning">
                                是
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="防御">
                            200G
                        </n-descriptions-item>
                        <n-descriptions-item label="建站">
                            <n-tag type="success">
                                允许
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="UDP">
                            <n-tag type="success">
                                允许
                            </n-tag>
                        </n-descriptions-item>
                        <n-descriptions-item label="域名过白">
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    域名无需备案过白
                                </template>
                                此节点为国外或中国特别行政区，域名无需备案
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="端口限制">
                            10000~65535
                        </n-descriptions-item>
                        <n-descriptions-item label="域名">
                            bj.frp.one
                        </n-descriptions-item>
                        <n-descriptions-item label="IP">
                            111.67.195.88
                        </n-descriptions-item>
                        <n-descriptions-item label="带宽">
                            <n-tooltip trigger="hover">
                                <template #trigger>
                                    国外带宽
                                </template>
                                此节点走ChmlFrp国外带宽，您的国外带宽上限为128m
                            </n-tooltip>
                        </n-descriptions-item>
                        <n-descriptions-item label="介绍">
                            超高带宽，三网直连
                        </n-descriptions-item>
                    </n-descriptions>
                </n-tab-pane>
                <n-tab-pane name="节点地图">
                    <n-alert type="info">
                        地图来自中国地理信息公共服务平台，"我的位置"经纬度通过ip获取(目前是固定位置)，可能会有误差。
                    </n-alert>
                    <MapComponent style="margin-top: 16px" :width="'100%'" :height="'500px'" :markers="markers" />
                </n-tab-pane>
            </n-tabs>
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="nodeDetails">上一步</n-button>
                    <n-button @click="goToTheTunnelDetails" type="primary">继续</n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
    <n-modal v-model:show="tunnelInfoModal">
        <n-card style="width: 600px" title="创建隧道" :bordered="false" size="huge" role="dialog" aria-modal="true">
            还没做( •̀ ω •́ )✧
        </n-card>
    </n-modal>
    <n-card style="margin-bottom: 20px;" title="隧道列表">
        <template #header-extra>
            <n-button round quaternary>
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
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(card, index) in tunnelCards" :key="index">
            <n-card size="small">
                <template #header>
                    {{ card.title }}
                    <span style="color: gray; font-size: 14px;">{{ card.id }}</span>
                </template>
                <template #header-extra>
                    <n-tag round :bordered="false" :type="card.status.type">
                        {{ card.status.label }}
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
                    <a @click="copyToClipboard(card.connection)" style="cursor: pointer; color: inherit;">
                        连接地址：{{ card.connection }}
                    </a><br>
                    <span style="color: gray; font-size: 10px;">
                        {{ card.date }}
                    </span>
                </n-thing>
                <template #footer>
                    <n-row class="center-content">
                        <n-col :span="8">
                            <div>
                                <n-icon :component="ArrowUpOutline" />
                                <n-number-animation show-separator :from="0" :to="card.upload" />
                                TiB
                            </div>
                        </n-col>
                        <n-col :span="8">
                            <div>
                                <n-icon :component="ArrowDownOutline" />
                                <n-number-animation show-separator :from="0" :to="card.download" />
                                TiB
                            </div>
                        </n-col>
                        <n-col :span="8">
                            连接数
                            <n-number-animation show-separator :from="0" :to="card.connections" />
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
                        <n-button round quaternary type="error" @click="handleConfirm(card.title)">
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
</template>

<script setup lang="ts">
import { RefreshOutline, AddOutline, ArrowUpOutline, ArrowDownOutline, EyeOutline, TrashOutline, CreateOutline, BanOutline, EarthOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import axios from 'axios';

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

const addTheTunnelButtonShow = ref(false)

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const selectNode = ref(''); // 选中节点名

// 根据屏幕宽度决定对话框大小
const widthStyle = computed(() => ({
    width: screenWidth.value >= 600 ? '70%' : '100%',
}));

// 模拟用户权限为免费用户
const userGroup = ref('免费用户')

const handleConfirm = (title: string) => {
    dialog.warning({
        title: '警告',
        content: '您正在删除隧道：' + title + '，请确认是否删除。',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            message.success('成功删除隧道：' + title)
        },
    })
}

interface NodeCard {
    id: number;
    title: string;
    group: string;
    web: string;
    china: string;
    defense: string;
    udp: string;
    area: string;
}

const nodeCards = ref<NodeCard[]>([]);

const createNodes = async () => {
    addTheTunnelButtonShow.value = true // 新建隧道按钮加载
    // 加载节点列表
    try {
        const response = await axios.get('https://cf-v1.uapis.cn/api/unode.php');
        nodeCards.value = response.data.map((node: any) => ({
            id: node.id, // 节点ID
            title: node.name, // 节点名
            group: node.nodegroup, // 权限组
            web: node.web, // 是否允许建站
            china: node.china, // 是否为境内带宽
            defense: node.fangyu, // 防御
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
    return nodeCards.value.filter(node => {
        const matchUdp = filters.value.udp ? node.udp === 'true' : true;

        let matchNoPermission = true;
        if (userGroup.value) {
            matchNoPermission = filters.value.noPermission ? true : node.group === 'user';
        } else {
            matchNoPermission = filters.value.noPermission ? true : true;
        }

        const matchWeb = filters.value.web === 'all' || node.web === filters.value.web;
        const matchRegion = filters.value.region === 'all' ||
            (filters.value.region === 'china' && node.china === 'yes') ||
            (filters.value.region === 'overseas' && (node.china === 'no' || node.area.includes('香港') || node.area.includes('台湾')));

        return matchUdp && matchNoPermission && matchWeb && matchRegion;
    });
});

const handleNodeCardClick = (card: NodeCard) => {
    // 检查用户是否有权限选择该节点
    if (card.group === 'vip' && userGroup.value === '免费用户') {
        message.warning('此节点为会员节点，您的权限不足')
        return;
    }
    console.log('[隧道列表]选中了:', card.title); // 控制台输出选中结果
    selectNode.value = card.title
    nodeListModal.value = false // 取消显示节点选择模态框
    nodeInfoModal.value = true // 显示节点详情模态框
}

const nodeDetails = () => {
    nodeListModal.value = true // 显示节点选择模态框
    nodeInfoModal.value = false // 取消显示节点详情模态框
}

const goToTheTunnelDetails = () => {
    nodeInfoModal.value = false // 取消显示节点详情模态框
    tunnelInfoModal.value = true // 显示创建隧道详情拟态框
}

const markers = [
    { position: [104.87095, 28.65406], title: '我的位置' },
    { position: [116.407428, 39.91923], title: '节点位置' }
]

// 监听 filters 变化，并保存到本地存储
watch(filters, (newFilters) => {
    localStorage.setItem('nodeFilters', JSON.stringify(newFilters))
}, { deep: true })

const tunnelCards = ref([
    {
        title: 'ChmlFrp-Tunnel',
        id: '#15799',
        status: { type: 'success', label: '在线' },
        tags: ['火星CN2-1', '127.0.0.1:25565 - TCP'],
        connection: 'hx.frp.one:25125',
        date: '2024-5-30 01:59:02',
        upload: 10,
        download: 10,
        connections: 203
    },
    {
        title: 'ChmlFrp-Tunnel-2',
        id: '#1421',
        status: { type: 'warning', label: '离线' },
        tags: ['金星CN2-1', '127.0.0.1:25565 - TCP'],
        connection: 'hx.frp.one:25125',
        date: '2024-5-30 01:59:02',
        upload: 10.4,
        download: 10.9,
        connections: 203
    },
    {
        title: 'ChmlFrp-Tunnel-3',
        id: '#91242',
        status: { type: 'error', label: '维护' },
        tags: ['月球直连-1', '127.0.0.1:80 - HTTP'],
        connection: 'yq.frp.one:19242',
        date: '2024-5-31 01:24:02',
        upload: 312.52,
        download: 124.92,
        connections: 72
    }
]);

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