<template>
    <n-back-top :right="100" />
    <n-card>
        <div style="display: flex; align-items: center">
            <div style="margin-left: 10px">
                <n-h1 prefix="bar">ChmlFrp-下载中心</n-h1>
                <div>
                    <n-p>
                        此处下载的程序为ChmlFrp核心程序，需通过终端启动，无操作UI，全平台兼容，bug最少。
                        <!-- 除了这些，您还可以前往菜单的
            <n-button @click="navigateToMarketplace" text>
              扩展功能->应用市场
            </n-button>
            下载其他客户端！ -->
                    </n-p>
                </div>
                <n-button
                    v-if="!isHidden"
                    text
                    tag="a"
                    target="_blank"
                    type="primary"
                    href="https://docs.chmlfrp.net/docs/use/mapping.html"
                >
                    如果您是初次使用，请点击此链接查看教程！
                </n-button>
            </div>
        </div>
        <n-grid :x-gap="20" :y-gap="20" cols="1 s:2 m:4" style="margin-top: 32px" responsive="screen">
            <n-grid-item v-for="os in osList" :key="os.name">
                <n-card
                    style="text-align: center"
                    @click="showCard(os.name)"
                    :class="{ 'card-selected': selectedOS === os.name }"
                    hoverable
                >
                    <n-icon :size="60" :component="os.icon" :color="os.color" />
                    <n-divider></n-divider>
                    <h2>{{ os.label }}</h2>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-infinite-scroll v-if="loading" :distance="1" @load="handleLoad">
            <n-skeleton
                v-for="i in count"
                :key="i"
                style="margin-top: 20px; height: 64px; border-radius: 10px"
                :sharp="false"
                size="medium"
            />
        </n-infinite-scroll>
        <div v-else-if="selectedOSData.length" :loading="loading">
            <n-card style="margin-top: 20px" v-for="item in selectedOSData" :key="item.route">
                <n-icon :size="18" style="top: 4px" :component="osIcon[selectedOS]" :color="osColors[selectedOS]" />
                <n-divider vertical />
                <span>{{ item.architecture }}</span>
                <n-divider vertical v-if="!isHidden" />
                <span style="color: #909399" v-if="!isHidden">{{ time }}</span>
                <n-button
                    v-if="!isHidden"
                    text
                    tag="a"
                    target="_blank"
                    type="primary"
                    :href="link + item.route"
                    style="float: right; padding: 3px 0"
                >
                    {{ link }}{{ item.route }}
                </n-button>
                <n-button
                    v-else
                    text
                    tag="a"
                    target="_blank"
                    type="primary"
                    :href="link + item.route"
                    style="float: right; padding: 3px 0"
                    >下载</n-button
                >
            </n-card>
        </div>
    </n-card>
</template>

<script lang="ts" setup>
import { LogoWindows, LogoApple, LogoTux } from '@vicons/ionicons5';
import { Freebsd } from '@vicons/fa';
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useScreenStore } from '@/stores/useScreen';
import { getDownloadInfo } from '@/api/v2/panel/panel';
// import { useRouter } from 'vue-router';

// 获取路由实例
// const router = useRouter();

// 基础的手机端适配
const screenStore = useScreenStore();
const { isHidden } = storeToRefs(screenStore);

// 无限滚动
const count = ref(6);
const handleLoad = () => {
    count.value += 1;
};

// 检测操作系统
const detectOS = (): string => {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (platform.includes('win') || userAgent.includes('windows')) {
        return 'Windows';
    } else if (platform.includes('mac') || userAgent.includes('mac')) {
        return 'Darwin';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
        return 'Linux';
    } else if (platform.includes('freebsd') || userAgent.includes('freebsd')) {
        return 'freeBSD';
    }
    return 'Windows';
};

const selectedOS = ref<string>(detectOS());
const link = ref<string>('');
const time = ref<string>('');
const Windows = ref<Array<{ route: string; architecture: string }>>([]);
const Linux = ref<Array<{ route: string; architecture: string }>>([]);
const freeBSD = ref<Array<{ route: string; architecture: string }>>([]);
const Darwin = ref<Array<{ route: string; architecture: string }>>([]);
const loading = ref<boolean>(true);

const osList = [
    { name: 'Windows', label: 'Windows', icon: LogoWindows, color: '#409EFF' },
    { name: 'Linux', label: 'Linux', icon: LogoTux, color: '#e69824' },
    { name: 'freeBSD', label: 'freeBSD', icon: Freebsd, color: '#F56C6C' },
    { name: 'Darwin', label: 'Darwin', icon: LogoApple, color: '#909399' },
];

const osIcon: Record<string, typeof LogoWindows | typeof LogoApple | typeof LogoTux | typeof Freebsd> = {
    Windows: LogoWindows,
    Linux: LogoTux,
    freeBSD: Freebsd,
    Darwin: LogoApple,
};

const osColors: Record<string, string> = {
    Windows: '#409EFF',
    Linux: '#e69824',
    freeBSD: '#F56C6C',
    Darwin: '#909399',
};

const selectedOSData = computed(() => {
    return selectedOS.value === 'Windows'
        ? Windows.value
        : selectedOS.value === 'Linux'
          ? Linux.value
          : selectedOS.value === 'freeBSD'
            ? freeBSD.value
            : Darwin.value;
});

onMounted(async () => {
    try {
        const response = await getDownloadInfo();
        Windows.value = response.data.system.windows;
        Linux.value = response.data.system.linux;
        freeBSD.value = response.data.system.freebsd;
        Darwin.value = response.data.system.darwin;
        time.value = response.data.update_time;
        link.value = response.data.link;
        loading.value = false;
    } catch (error) {
        console.error('下载列表 API 调用失败：', error);
    } finally {
        loading.value = false;
    }
});

const showCard = (os: string) => {
    selectedOS.value = os;
};

// 跳转到应用市场
// const navigateToMarketplace = () => {
//   router.push('/expand/app-marketplace');
// };
//
</script>

<style lang="scss" scoped>
.custom-card {
    display: flex;
    justify-content: center;
    align-items: center;
}

.content {
    text-align: center;
}

.card-selected {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}
</style>
