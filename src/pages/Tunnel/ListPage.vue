<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px;" title="隧道列表">
        <template #header-extra>
            <n-button type="primary" quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                添加隧道
            </n-button>
            <n-button quaternary>
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
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
                            <n-tag v-for="(tag, tagIndex) in card.tags" :key="tagIndex" :bordered="false" type="primary"
                                size="small">
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
                        <n-button round quaternary>
                            <template #icon>
                                <n-icon :component="CreateOutline" />
                            </template>
                            编辑
                        </n-button>
                        <n-button round quaternary>
                            <template #icon>
                                <n-icon :component="EyeOutline" />
                            </template>
                            查看
                        </n-button>
                        <n-button round quaternary>
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
import { RefreshOutline, AddOutline, ArrowUpOutline, ArrowDownOutline, EyeOutline, TrashOutline, CreateOutline } from '@vicons/ionicons5'
import { ref } from 'vue'
import { useMessage } from 'naive-ui';

const message = useMessage()

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
        console.error('复制连接地址失败:', err);
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