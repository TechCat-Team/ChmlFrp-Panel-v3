<template>
    <n-back-top :right="100" />
    <n-card>
        <n-h2 prefix="bar">
            <n-text type="primary">
                封禁列表
            </n-text>
        </n-h2>
        <n-p>封禁状态每小时更新一次，如果您的封禁到期但是未被解除，请等候一小时后重试。在这里会公示所有因为违规被封禁的所有账户，用于警示其余用户。
            <!-- <br />
            封禁列表与CFU成员同步，如果您在其他CFU成员的账户被封禁，则所有接入CFU封禁系统的映射均将被同步封禁。如需申述，请前往对应CFU成员映射进行申述(你在哪里被封的就去哪里申述) -->
        </n-p>
    </n-card>
    <n-card style="margin-top: 16px" v-if="screenWidth >= 1200">
        <n-data-table :columns="columns" :data="data" :pagination="pagination" :bordered="false" />
    </n-card>
    <n-grid v-else cols="1 m:2" style="margin-top: 16px" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(card, index) in data" :key="index">
            <n-card size="small">
                <template #header>
                    {{ card.email }}
                    <span style="color: gray; font-size: 14px;">#{{ card.id }}</span>
                </template>
                <template #header-extra>
                    <n-tag round :bordered="false" :type="cardTagType(card.state)">
                        {{ card.state }}
                    </n-tag>
                </template>
                <template #footer>
                    封禁时间：{{ card.prohibitionTime }}
                    <br />
                    解封时间：{{ card.unblockingTime }}
                    <br />
                    封禁原因：{{ card.length }}
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script setup lang="ts">
import { NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const cardTagType = (state: string) => {
    if (state === '解除') {
        return 'success'
    } else if (state === '封禁') {
        return 'error'
    } else {
        return 'info'
    }
}

type Song = {
    id: number
    email: string
    length: string
    prohibitionTime: string
    unblockingTime: string
    state: string
}

const createColumns = ({
    play
}: {
    play: (row: Song) => void
}): DataTableColumns<Song> => {
    return [
        {
            title: 'id',
            key: 'id'
        },
        {
            title: '邮箱',
            key: 'email'
        },
        {
            title: '封禁原因',
            key: 'length'
        },
        {
            title: '封禁时间',
            key: 'prohibitionTime',
        },
        {
            title: '解封时间',
            key: 'unblockingTime',
        },
        {
            title: '状态',
            key: 'state',
        },
    ]
}

const data: Song[] = [
    { id: 3, email: 'ch**ji@chcat.cn', length: '于2077年黑入荒板塔，袭击了一名网络安全人员。', prohibitionTime: '公元前249年', unblockingTime: '公元前210年', state: '解除' },
    { id: 4, email: "24****494@qq.com", length: '在上周的疯狂星期四没有V我50', prohibitionTime: '2024-6-27 22:20', unblockingTime: '2024-7-4 0:00', state: '封禁' },
    { id: 12, email: '133****1926@163.com', length: '因为没有被封禁，所以被封禁', prohibitionTime: '2044-3-12 35:92', unblockingTime: '永久封禁', state: '未知' }
]

const message = useMessage()
const columns = createColumns({
    play(row: Song) {
        message.info(`Play ${row.email}`)
    }
})
const pagination = false as const
</script>