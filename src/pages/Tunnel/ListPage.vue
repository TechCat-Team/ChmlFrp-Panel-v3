<template>
    <n-back-top :right="100" />
    <n-modal v-model:show="createTunnelModal">
        <n-card :style="widthStyle" title="选择节点" :bordered="false" role="dialog" aria-modal="true">
            <n-alert type="info" style="bottom: 12px;">
                为确保您的体验，请尽量选择负载低，距离近的节点。
            </n-alert>
            <n-flex justify="space-between" align="center">
                <n-flex>
                    <n-checkbox>
                        UDP
                    </n-checkbox>
                    <n-checkbox>
                        无权限
                    </n-checkbox>
                </n-flex>
                <n-flex>
                    <n-button-group>
                        <n-button size="small" type="primary" strong secondary round>
                            全部
                        </n-button>
                        <n-button size="small">
                            可建站
                        </n-button>
                        <n-button size="small" round>
                            不可建站
                        </n-button>
                    </n-button-group>
                    <n-button-group>
                        <n-button size="small" type="primary" strong secondary round>
                            全部
                        </n-button>
                        <n-button size="small">
                            中国
                        </n-button>
                        <n-button size="small" round>
                            境外
                        </n-button>
                    </n-button-group>
                </n-flex>
            </n-flex>
            <n-grid style="margin-top: 12px" cols="1 m:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
                <n-grid-item v-for="(nodeCard, index) in nodeCards" :key="index">
                    <n-card size="small" style="height: 90px" hoverable @click="handleNodeCardClick(nodeCard.title)">
                        <template #header>
                            <span style="color: gray;">
                                {{ nodeCard.id }}
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
                            <n-tag :bordered="false" round size="small" type="info" v-if="nodeCard.defense === 'yes'">
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
    <n-card style="margin-bottom: 20px;" title="隧道列表">
        <template #header-extra>
            <n-button round quaternary>
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="createTunnelModal = true" type="primary" round quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                添加隧道
            </n-button>
        </template>
    </n-card>
    <n-card v-if="cards === null">
        <n-empty description="您似乎还没创建隧道">
            <template #extra>
                <n-button size="small">
                    <template #icon>
                        <n-icon :component="AddOutline" />
                    </template>
                    创建隧道
                </n-button>
            </template>
        </n-empty>
    </n-card>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(card, index) in cards" :key="index">
            <n-card size="small" hoverable>
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
                        <n-button round quaternary type="primary">
                            <template #icon>
                                <n-icon :component="EyeOutline" />
                            </template>
                            查看
                        </n-button>
                        <n-button round quaternary type="error">
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

const message = useMessage()

const createTunnelModal = ref(false)

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 根据屏幕宽度决定对话框大小
const widthStyle = computed(() => ({
    width: screenWidth.value >= 600 ? '70%' : '100%',
}));

const nodeCards = ref([
    {
        id: '#1',
        title: '火星CN2-1',
        group: 'vip',
        web: 'yes',
        china: 'yes',
        defense: 'yes',
        udp: 'false',
    },
    {
        id: '#2',
        title: '月球直连',
        group: 'user',
        web: 'no',
        china: 'yes',
        defense: 'yes',
        udp: 'true',
    }
])

const handleNodeCardClick = (title: string) => {
    const selectedTitle = title;
    console.log('选中了:', selectedTitle);
}

const cards = ref([
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
        console.error('隧道列表 - 复制连接地址失败:', err);
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
</style>