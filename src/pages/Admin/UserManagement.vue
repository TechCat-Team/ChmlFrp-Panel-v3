<template>
    <n-back-top :right="100" />
    <n-card title="用户管理">
        <template #header-extra>
          <div class="header-extra-content">
            <input type="text" placeholder="搜索..." class="search-input" />
            <n-button class="search-button" round strong secondary size="small">搜索</n-button>
            <n-button class="add-user-button" round type="primary">添加用户</n-button>
          </div>
        </template>
        <n-grid cols="2 m:5 xl:7" responsive="screen" v-if="!available">
            <n-grid-item>
                <n-statistic label="当前总用户" tabular-nums>
                    <n-number-animation :from="0" show-separator :to="114514" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item>
                <n-statistic label="当前总VIP" tabular-nums>
                    <n-number-animation :from="0" show-separator :to="1919" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="当前总封禁用户" tabular-nums>
                    <n-number-animation :from="0" show-separator :to="3" />
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="用户总消费" tabular-nums>
                    <n-number-animation :from="0" :to="421.26" :precision="2" />
                    <template #suffix> RMB </template>
                </n-statistic>
            </n-grid-item>
            <n-grid-item span="2 s:1">
                <n-statistic label="数据更新时间" tabular-nums>
                    2024-11-04 51:41
                </n-statistic>
            </n-grid-item>
        </n-grid>
    </n-card>
    <n-grid v-if="!available" cols="1 m:2 l:3 xl:4 2xl:5" style="margin-top: 20px;" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(userStatusCard, index) in userStatusCards" :key="index">
            <n-card size="small" hoverable @click="goToNodeInfo">
                <template #header>
                    {{ userStatusCard.title }} <span style="color: gray; font-size: 14px;">{{ userStatusCard.id }}</span>
                </template>
                <template #header-extra>
                    <n-flex>
                        <n-tag round :bordered="false" :style="tagStyle(userStatusCard.state)" v-if="userStatusCard.state !== undefined">
                            {{ tagText(userStatusCard.state) }}
                        </n-tag>
                    </n-flex>
                </template>
                <n-flex justify="space-around" size="large" align="center">
                    <n-descriptions label-placement="left" :column="1">
                        <n-descriptions-item label="封禁时间">{{ userStatusCard.bannedTime }}</n-descriptions-item>
                        <n-descriptions-item label="原因">{{ userStatusCard.whyBanned }}</n-descriptions-item>
                        <n-descriptions-item label="解封时间">{{ userStatusCard.unBannedTime }}</n-descriptions-item>
                    </n-descriptions>
                </n-flex>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-grid v-else :cols="1" style="margin-top: 20px;" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item>
            <n-card hoverable @click="goToNodeInfo">
                <ServiceUptime />
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable @click="goToNodeInfo">
                <ServiceUptime />
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable @click="goToNodeInfo">
                <ServiceUptime />
            </n-card>
        </n-grid-item>
    </n-grid>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const available = ref(false);
const router = useRouter();

const goToNodeInfo = () => {
//    const url = router.resolve({ path: '/node/iusers' }).href;
//    window.open(url, '_blank');
}

const userStatusCards = ref([
    {
        id: '#3',
        title: 'chaoji',
        group: 'user',
        bannedTime: '公元前249年',
        whyBanned: '于2077年黑入荒板塔，袭击了一名网络安全人员。',
        unBannedTime: '公元前210年',
        state: true,
        imgUrl: "https://chmlfrp.cn/favicon.ico"
    },
    {
        id: '#4',
        title: '24****494',
        group: 'user',
        bannedTime: '2024-6-27 22:20',
        whyBanned: '在上周的疯狂星期四没有V我50',
        unBannedTime: '2024-7-4 0:00',
        state: false,
        imgUrl: "https://chmlfrp.cn/favicon.ico"
    },
    {
        id: '#12',
        title: '133****1926',
        group: 'user',
        bannedTime: '2044-3-12 35:92',
        whyBanned: '因为没有被封禁，所以被封禁。',
        unBannedTime: '永久封禁',
        state: undefined,
        imgUrl: "https://chmlfrp.cn/favicon.ico"
    },
]);


const tagText = (state) => {
    if (state === true) {
        return '解封';
    } else if (state === false) {
        return '封禁';
    } else {
        return '未知';
    }
};

const tagStyle = (state) => {
    if (state === true) {
        return { color: 'green', backgroundColor: 'lightgreen' };
    } else if (state === false) {
        return { color: 'yellow', backgroundColor: 'lightyellow' };
    } else {
        return { color: 'gray', backgroundColor: 'lightgray' };
    }
};
</script>

<style scoped>
.header-extra-content {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
  transition: width 0.3s ease;
  width: 200px;
}

.search-input:focus {
  width: 300px;
  border-color: #007bff;
}

.search-button,
.add-user-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  transition: background-color 0.3s ease;
}

.search-button {
  background-color: #EEEEEE;
}

.search-button:hover {
  background-color: #BBBBBB; 
}
</style>
