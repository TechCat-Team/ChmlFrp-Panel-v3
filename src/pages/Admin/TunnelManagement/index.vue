<template>
    <n-card title="隧道管理">
        <!-- 搜索区域 -->
        <div style="margin-bottom: 16px">
            <n-space>
                <n-select
                    v-model:value="searchForm.type"
                    :options="searchTypeOptions"
                    style="width: 140px"
                    placeholder="搜索类型"
                />
                <n-input
                    v-model:value="searchForm.value"
                    placeholder="请输入搜索内容"
                    style="width: 200px"
                    @keyup.enter="handleSearch"
                />
                <n-button type="primary" @click="handleSearch" :loading="loading">
                    搜索
                </n-button>
                <n-button @click="handleReset">
                    重置
                </n-button>
            </n-space>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="isSearchMode" style="margin-bottom: 16px">
            <n-alert type="info" :show-icon="false">
                搜索结果：{{ getSearchTypeLabel() }}包含"{{ searchForm.value }}"的隧道，共找到 {{ pagination.itemCount }} 个
                <n-button text type="primary" @click="handleReset" style="margin-left: 8px">
                    查看全部隧道
                </n-button>
            </n-alert>
        </div>

        <n-watermark
            :content="`禁止截图\n${userInfoStore?.username}`"
            cross
            selectable
            :font-size="16"
            :line-height="16"
            :width="192"
            :height="128"
            :x-offset="12"
            :y-offset="28"
            :rotate="-15"
            :font-color="'rgba(128, 128, 128, 0.1)'"
        >
            <n-data-table
                :columns="columns"
                :data="tunnels"
                :pagination="pagination"
                :loading="loading"
                @update:page="handlePageChange"
                @update:page-size="handlePageSizeChange"
                :remote="true"
                :scroll-x="1400"
            />
        </n-watermark>
    </n-card>

    <!-- 查看详情模态框 -->
    <n-modal 
        v-model:show="showDetailModal" 
        preset="card" 
        style="width: 800px" 
        :bordered="false"
        size="large"
        title="隧道详情"
    >
        <n-spin :show="detailLoading">
            <n-descriptions 
                v-if="currentTunnel"
                label-placement="left" 
                bordered 
                :column="2"
                size="large"
            >
                <n-descriptions-item label="隧道ID">
                    <n-tag type="info">{{ currentTunnel.id }}</n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="用户ID">
                    <n-tag type="success">{{ currentTunnel.userid }}</n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="隧道名称">
                    <n-text strong>{{ currentTunnel.name }}</n-text>
                </n-descriptions-item>
                <n-descriptions-item label="节点">
                    <n-tag type="primary">{{ currentTunnel.node }}</n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="协议类型">
                    <n-tag 
                        :type="getProtocolConfig(currentTunnel.type).type"
                        round
                        :style="{
                            minWidth: '70px',
                            justifyContent: 'center',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }"
                    >
                        <template #icon>
                            <n-icon :component="getProtocolConfig(currentTunnel.type).icon" />
                        </template>
                        {{ currentTunnel.type.toUpperCase() }}
                    </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="本地地址">
                    {{ currentTunnel.localip }}
                </n-descriptions-item>
                <n-descriptions-item label="映射端口">
                    {{ currentTunnel.nport }}
                </n-descriptions-item>
                <n-descriptions-item label="外网端口/域名">
                    <n-text code>{{ currentTunnel.dorp }}</n-text>
                </n-descriptions-item>
                <n-descriptions-item label="运行状态" :span="2">
                    <n-tag 
                        :type="isOnlineState(currentTunnel.state) ? 'info' : 'error'"
                        round
                        :style="{
                            minWidth: '60px',
                            justifyContent: 'center',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }"
                    >
                        <template #icon>
                            <n-icon :component="isOnlineState(currentTunnel.state) ? CheckmarkCircle : CloseCircle" />
                        </template>
                        {{ parseState(currentTunnel.state) }}
                    </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="加密">
                    {{ currentTunnel.encryption }}
                </n-descriptions-item>
                <n-descriptions-item label="压缩">
                    {{ currentTunnel.compression }}
                </n-descriptions-item>
                <n-descriptions-item label="额外参数" :span="2">
                    <n-text v-if="currentTunnel.ap" code>{{ currentTunnel.ap }}</n-text>
                    <n-text v-else depth="3">无</n-text>
                </n-descriptions-item>
                <n-descriptions-item label="运行时长">
                    {{ currentTunnel.uptime || '未运行' }}
                </n-descriptions-item>
                <n-descriptions-item label="客户端版本">
                    {{ currentTunnel.client_version || '未知' }}
                </n-descriptions-item>
                <n-descriptions-item label="今日入流量">
                    {{ formatTraffic(currentTunnel.today_traffic_in) }}
                </n-descriptions-item>
                <n-descriptions-item label="今日出流量">
                    {{ formatTraffic(currentTunnel.today_traffic_out) }}
                </n-descriptions-item>
                <n-descriptions-item label="当前连接数" :span="2">
                    {{ currentTunnel.cur_conns }}
                </n-descriptions-item>
            </n-descriptions>
        </n-spin>

        <template #footer>
            <div style="display: flex; justify-content: flex-end;">
                <n-button @click="showDetailModal = false">
                    关闭
                </n-button>
            </div>
        </template>
    </n-modal>

    <n-back-top :right="100" />
</template>

<script lang="ts" setup>
import { ref, onMounted, h, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
    NDataTable, NButton, NCard, NModal, NDescriptions, NDescriptionsItem, 
    NBackTop, NSpace, NSelect, NAlert, NTag, NText, NSpin, useMessage,
    NWatermark, NIcon, useDialog,
    NDropdown
} from 'naive-ui';
import { 
    CheckmarkCircle, CloseCircle, Globe, Server, 
    LockClosed, Rocket, Cube,
    EllipsisVertical,
    CodeDownloadOutline,
    EyeOutline
} from '@vicons/ionicons5';
import type { DataTableColumns } from 'naive-ui';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import { formatBytes } from '@/utils/formatBytes';

const router = useRouter();
const dialog = useDialog();

const userStore = useUserStore();
const userInfoStore = userStore.userInfo;

// 定义隧道类型
type Tunnel = {
    id: number;
    name: string;
    localip: string;
    type: string;
    nport: number;
    dorp: string;
    node: string;
    state: string | boolean;
    userid: number;
    encryption: string;
    compression: string;
    ap: string;
    uptime: string;
    client_version: string;
    today_traffic_in: number;
    today_traffic_out: number;
    cur_conns: number;
};

const message = useMessage();
const tunnels = ref<Tunnel[]>([]);
const loading = ref(true);
const showDetailModal = ref(false);
const detailLoading = ref(false);
const currentTunnel = ref<Tunnel | null>(null);
const isSearchMode = ref(false);

// 搜索表单
const searchForm = reactive({
    type: 'user_id',
    value: ''
});

// 搜索类型选项
const searchTypeOptions = [
    { label: '用户ID', value: 'user_id' },
    { label: '隧道名称', value: 'name' },
    { label: '隧道ID', value: 'tunnel_id' },
    { label: '外网端口', value: 'dorp' }
];

// 分页配置
const pagination = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    pageSizes: [10, 20, 50, 100],
    showSizePicker: true,
});

// 获取搜索类型标签
const getSearchTypeLabel = () => {
    const option = searchTypeOptions.find(opt => opt.value === searchForm.type);
    return option?.label || '搜索';
};

// 格式化流量显示
const formatTraffic = (bytes: number) => {
    const result = formatBytes(bytes);
    return `${result.value} ${result.suffix}`;
};

// 获取协议类型配置
const getProtocolConfig = (type: string) => {
    const configs: Record<string, { type: any, icon: any }> = {
        'http': { type: 'success', icon: Globe },
        'https': { type: 'success', icon: LockClosed },
        'tcp': { type: 'info', icon: Server },
        'udp': { type: 'warning', icon: Rocket }
    };
    return configs[type.toLowerCase()] || { type: 'default', icon: Cube };
};

// 解析状态显示
const parseState = (state: string | boolean): string => {
    if (typeof state === 'boolean') {
        return state ? '在线' : '离线';
    }
    if (state === 'true' || state === '在线') {
        return '在线';
    }
    if (state === 'false' || state === '离线') {
        return '离线';
    }
    return state;
};

// 判断是否在线
const isOnlineState = (state: string | boolean): boolean => {
    if (typeof state === 'boolean') {
        return state;
    }
    return state === 'true' || state === '在线';
};

// 获取隧道列表
const fetchTunnels = async () => {
    loading.value = true;
    try {
        const adminToken = userInfoStore?.usertoken || '';
        let data;

        if (isSearchMode.value && searchForm.value.trim()) {
            const res = await api.v2.admin.searchTunnels(
                adminToken,
                searchForm.type as 'user_id' | 'name' | 'tunnel_id' | 'dorp',
                searchForm.value.trim(),
                pagination.page,
                pagination.pageSize
            );
            data = res.data;
        } else {
            const res = await api.v2.admin.getTunnels(
                adminToken,
                pagination.page,
                pagination.pageSize
            );
            data = res.data;
        }

        tunnels.value = data.tunnels;
        pagination.itemCount = data.total;
    } catch (error: any) {
        const msg = error?.message || '请求失败，请检查网络或联系管理员';
        message.error(msg);
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 处理分页变化
const handlePageChange = (page: number) => {
    pagination.page = page;
    fetchTunnels();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1; // 回到第一页
    fetchTunnels();
};

// 搜索隧道
const handleSearch = () => {
    if (!searchForm.value.trim()) {
        message.warning('请输入搜索内容');
        return;
    }
    isSearchMode.value = true;
    pagination.page = 1; // 重置到第一页
    fetchTunnels();
};

// 重置搜索
const handleReset = () => {
    searchForm.value = '';
    isSearchMode.value = false;
    pagination.page = 1; // 重置到第一页
    fetchTunnels();
};

// 查看详情
const handleViewDetail = async (tunnel: Tunnel) => {
    showDetailModal.value = true;
    detailLoading.value = true;
    
    try {
        const adminToken = userInfoStore?.usertoken || '';
        const res = await api.v2.admin.getTunnelById(adminToken, tunnel.id);
        currentTunnel.value = res.data;
    } catch (error: any) {
        const msg = error?.message || '请求失败，请检查网络或联系管理员';
        message.error(`获取隧道详情失败: ${msg}`);
        console.error(error);
        showDetailModal.value = false;
    } finally {
        detailLoading.value = false;
    }
};

// 下线隧道
const handleOfflineTunnel = (tunnel: Tunnel) => {
    dialog.warning({
        title: '确认下线',
        content: `确定要强制下线隧道"${tunnel.name}"（ID: ${tunnel.id}）吗？此操作将立即中断该隧道的连接。`,
        positiveText: '确认下线',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                const adminToken = userInfoStore?.usertoken || '';
                await api.v2.admin.offlineTunnel(
                    adminToken,
                    String(tunnel.id),
                    'id'
                );
                message.success('隧道下线成功');
                // 刷新列表
                fetchTunnels();
            } catch (error: any) {
                const msg = error?.message || '请求失败，请检查网络或联系管理员';
                message.error(`下线失败: ${msg}`);
                console.error(error);
            }
        }
    });
};

// 定义表格列
const columns: DataTableColumns<Tunnel> = [
    { 
        title: 'ID', 
        key: 'id', 
        width: 70, 
        sorter: 'default',
        fixed: 'left'
    },
    { 
        title: '用户ID', 
        key: 'userid', 
        width: 100, 
        sorter: 'default',
        render(row) {
            return h(
                NButton,
                {
                    text: true,
                    type: 'primary',
                    size: 'small',
                    onClick: () => {
                        router.push({
                            path: '/admin/user',
                            query: {
                                searchType: 'id',
                                searchValue: String(row.userid)
                            }
                        });
                    }
                },
                { default: () => row.userid }
            );
        }
    },
    { 
        title: '隧道名称', 
        key: 'name', 
        sorter: 'default',
        width: 80,
        ellipsis: {
            tooltip: true
        }
    },
    { 
        title: '节点', 
        key: 'node',
        width: 100,
        ellipsis: {
            tooltip: true
        }
    },
    { 
        title: '协议', 
        key: 'type', 
        width: 95,
        align: 'center',
        render(row) {
            const config = getProtocolConfig(row.type);
            return h(
                NTag,
                {
                    type: config.type,
                    size: 'small',
                    round: true,
                    style: {
                        minWidth: '70px',
                        justifyContent: 'center',
                        display: 'inline-flex',
                        alignItems: 'center'
                    }
                },
                {
                    default: () => row.type.toUpperCase(),
                    icon: () => h(NIcon, null, { default: () => h(config.icon) })
                }
            );
        }
    },
    { 
        title: '外网端口', 
        key: 'dorp',
        width: 80,
        ellipsis: {
            tooltip: true
        }
    },
    { 
        title: '状态', 
        key: 'state',
        width: 85,
        align: 'center',
        render(row) {
            const isOnline = isOnlineState(row.state);
            const stateText = parseState(row.state);
            return h(
                NTag,
                {
                    type: isOnline ? 'info' : 'error',
                    size: 'small',
                    round: true,
                    style: {
                        minWidth: '60px',
                        justifyContent: 'center',
                        display: 'inline-flex',
                        alignItems: 'center'
                    }
                },
                {
                    default: () => stateText,
                    icon: () => h(
                        NIcon, 
                        null, 
                        { default: () => h(isOnline ? CheckmarkCircle : CloseCircle) }
                    )
                }
            );
        }
    },
    { 
        title: '入流量', 
        key: 'today_traffic_in',
        width: 100,
        align: 'right',
        render(row) {
            const result = formatBytes(row.today_traffic_in);
            return `${result.value} ${result.suffix}`;
        }
    },
    { 
        title: '出流量', 
        key: 'today_traffic_out',
        width: 100,
        align: 'right',
        render(row) {
            const result = formatBytes(row.today_traffic_out);
            return `${result.value} ${result.suffix}`;
        }
    },
    { 
        title: '连接数', 
        key: 'cur_conns',
        width: 85,
        align: 'right'
    },
    {
        title: '操作',
        key: 'actions',
        width: 60,
        align: 'center',
        fixed: 'right',
        render(row) {
            const isOnline = isOnlineState(row.state);
            const options = [
                {
                    label: '查看详情',
                    key: 'detail',
                    icon: () => h(NIcon, { component: EyeOutline }),
                    props: {
                        onClick: () => handleViewDetail(row),
                    }
                },
                {
                    type: 'divider',
                    key: 'd1'
                },
                {
                    label: '下线隧道',
                    key: 'offline',
                    icon: () => h(NIcon, { component: CodeDownloadOutline }),
                    disabled: !isOnline,
                    props: {
                        onClick: () => handleOfflineTunnel(row),
                        style: 'color: #d03050;'
                    }
                }
            ];
            return h(NDropdown, {
                trigger: 'click',
                options: options,
                placement: 'bottom-end',
                showArrow: true
            }, {
                default: () => h(NButton, {
                    size: 'small',
                    quaternary: true,
                    circle: true
                }, {
                    icon: () => h(NIcon, { 
                        component: EllipsisVertical,
                        size: 18
                    })
                })
            });
        }
    },
];

// 组件挂载时获取数据
onMounted(() => {
    fetchTunnels();
});

</script>

<style scoped>
:deep(.n-data-table) {
    font-size: 13px;
}

:deep(.n-data-table .n-data-table-td) {
    padding: 8px 12px;
}

:deep(.n-data-table .n-data-table-th) {
    padding: 10px 12px;
    font-weight: 600;
}

:deep(.n-data-table-td .n-tag) {
    font-weight: 500;
}

:deep(.n-descriptions-table-content__label) {
    font-weight: 500;
}
</style>
