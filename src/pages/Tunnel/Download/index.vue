<template>
    <n-back-top :right="100" />
    <n-card>
        <div style="display: flex; align-items: center">
            <div style="margin-left: 10px">
                <n-h1 prefix="bar">ChmlFrp-下载中心</n-h1>
                <div>
                    <n-p>
                        请选择您要下载的客户端类型。图形客户端更适合新手使用，具有友好的操作UI；而核心程序适合在服务器端或需要自动化的场景使用。
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

        <n-tabs type="line" animated style="margin-top: 20px">
            <n-tab-pane name="launcher" tab="图形客户端 (推荐)">
                <n-grid :x-gap="20" :y-gap="20" cols="1 s:2 m:3" style="margin-top: 12px" responsive="screen">
                    <n-grid-item v-for="os in launcherOsList" :key="os.name">
                        <n-card
                            style="text-align: center"
                            @click="selectedLauncherOS = os.name"
                            :class="{ 'card-selected': selectedLauncherOS === os.name }"
                            hoverable
                        >
                            <n-icon :size="60" :component="os.icon" :color="os.color" />
                            <n-divider />
                            <h2>{{ os.label }}</h2>
                        </n-card>
                    </n-grid-item>
                </n-grid>

                <template v-if="launcherLoading">
                    <n-skeleton
                        v-for="i in 3"
                        :key="i"
                        style="margin-top: 20px; height: 64px; border-radius: 10px"
                        :sharp="false"
                        size="medium"
                    />
                </template>
                <n-empty v-else-if="launcherError" description="下载列表加载失败，请稍后重试" />
                <n-empty v-else-if="!selectedLauncherOSData.length" description="暂无可下载的图形客户端" />
                <div v-else>
                    <n-card
                        v-for="item in selectedLauncherOSData"
                        :key="item.label + item.url"
                        style="margin-top: 20px"
                    >
                        <n-icon
                            :size="18"
                            style="top: 4px"
                            :component="selectedLauncherSystem?.icon"
                            :color="selectedLauncherSystem?.color"
                        />
                        <n-divider vertical />
                        <span>{{ item.label }}</span>
                        <n-button
                            text
                            tag="a"
                            target="_blank"
                            rel="noopener"
                            type="primary"
                            :href="item.url"
                            @click="confirmLauncherDownload($event, item)"
                            @auxclick.middle="confirmLauncherDownload($event, item)"
                            style="float: right; padding: 3px 0"
                        >
                            下载
                        </n-button>
                    </n-card>
                </div>
            </n-tab-pane>

            <n-tab-pane name="core" tab="核心程序 (Frpc)">
                <n-grid :x-gap="20" :y-gap="20" cols="1 s:2 m:4" style="margin-top: 12px" responsive="screen">
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
                        <n-icon
                            :size="18"
                            style="top: 4px"
                            :component="osIcon[selectedOS]"
                            :color="osColors[selectedOS]"
                        />
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
            </n-tab-pane>
        </n-tabs>
    </n-card>
</template>

<script lang="ts" setup>
import { LogoWindows, LogoApple, LogoTux, LogoAndroid } from '@vicons/ionicons5';
import { Freebsd } from '@vicons/fa';
import { useDialog } from 'naive-ui';
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useScreenStore } from '@/stores/useScreen';
import {
    getDownloadInfo,
    getLauncherDownloads,
    type LauncherDownloadData,
    type LauncherDownloadLink,
} from '@/api/v2/panel/panel';
import { detectLauncherDevice, getLauncherDownloadMismatch, type LauncherDevice } from './launcherCompatibility';

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

// 图形客户端相关
const selectedLauncherOS = ref(/Android/i.test(navigator.userAgent) ? 'android' : selectedOS.value.toLowerCase());
const launcherLoading = ref(true);
const launcherError = ref(false);
const launcherRelease = ref<LauncherDownloadData | null>(null);
const launcherDevice = ref<LauncherDevice | null>(null);
const dialog = useDialog();
const launcherSystems = [
    { name: 'windows', label: 'Windows', icon: LogoWindows, color: '#409EFF' },
    { name: 'linux', label: 'Linux', icon: LogoTux, color: '#e69824' },
    { name: 'darwin', label: 'MacOS', icon: LogoApple, color: '#909399' },
    { name: 'android', label: 'Android', icon: LogoAndroid, color: '#3DDC84' },
];

const osList = [
    { name: 'Windows', label: 'Windows', icon: LogoWindows, color: '#409EFF' },
    { name: 'Linux', label: 'Linux', icon: LogoTux, color: '#e69824' },
    { name: 'freeBSD', label: 'freeBSD', icon: Freebsd, color: '#F56C6C' },
    { name: 'Darwin', label: 'MacOS', icon: LogoApple, color: '#909399' },
];

const launcherOsList = computed(() =>
    launcherSystems.filter(({ name }) =>
        launcherRelease.value ? launcherRelease.value.platforms[name]?.length : name !== 'android'
    )
);

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

const selectedLauncherOSData = computed(() => launcherRelease.value?.platforms[selectedLauncherOS.value] ?? []);
const selectedLauncherSystem = computed(() => launcherSystems.find(({ name }) => name === selectedLauncherOS.value));

const confirmLauncherDownload = (event: MouseEvent, item: LauncherDownloadLink) => {
    const mismatch = getLauncherDownloadMismatch(launcherDevice.value, item, launcherRelease.value);
    if (!mismatch) return;

    event.preventDefault();
    const { device, recommended } = mismatch;
    const system = launcherSystems.find(({ name }) => name === device.platform)?.label;
    const architecture = device.architecture.startsWith('arm')
        ? device.architecture.toUpperCase()
        : device.architecture;
    const deviceName = [system, architecture].filter(Boolean).join(' ');

    dialog.warning({
        title: '下载架构与设备不匹配',
        content: recommended
            ? `当前设备是 ${deviceName}，你选择了 ${item.label}。建议下载 ${recommended.label}。`
            : `当前设备是 ${deviceName}，你选择了 ${item.label}。当前版本暂无匹配的安装包。`,
        positiveText: recommended ? '下载推荐版本' : '返回下载列表',
        negativeText: '继续下载',
        onPositiveClick: () => {
            if (recommended) window.open(recommended.url, '_blank', 'noopener');
        },
        onNegativeClick: () => {
            window.open(item.url, '_blank', 'noopener');
        },
    });
};

onMounted(() => {
    // 获取核心程序下载信息
    getDownloadInfo()
        .then((response) => {
            Windows.value = response.data.system.windows;
            Linux.value = response.data.system.linux;
            freeBSD.value = response.data.system.freebsd;
            Darwin.value = response.data.system.darwin;
            time.value = response.data.update_time;
            link.value = response.data.link;
        })
        .catch((error) => {
            console.error('下载列表 API 调用失败：', error);
        })
        .finally(() => {
            loading.value = false;
        });

    Promise.all([getLauncherDownloads(), detectLauncherDevice(navigator)])
        .then(([{ data }, device]) => {
            launcherDevice.value = device;
            launcherRelease.value = data;
            if (!selectedLauncherOSData.value.length) {
                selectedLauncherOS.value = launcherOsList.value[0]?.name ?? '';
            }
        })
        .catch(() => {
            launcherError.value = true;
        })
        .finally(() => {
            launcherLoading.value = false;
        });
});

const showCard = (os: string) => {
    selectedOS.value = os;
};
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
