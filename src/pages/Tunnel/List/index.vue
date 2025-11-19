<template>
    <n-back-top :right="100" />
    <NodeListModal
        v-model:show="nodeListModal"
        v-model:filters="filters"
        v-model:expanded-panels="expandedPanels"
        :width-style="widthStyle"
        :node-cards="nodeCards"
        :filtered-node-cards="filteredNodeCards"
        :vip-node-cards="vipNodeCards"
        :normal-node-cards="normalNodeCards"
        :filter-web="filterWeb"
        :filter-region="filterRegion"
        @node-select="handleNodeCardClick"
    />
    <NodeInfoModal
        v-model:show="nodeInfoModal"
        :width-style="widthStyle"
        :screen-width="screenWidth"
        :select-node="selectNode"
        :node-info="nodeInfoValue"
        :loading="loadingTunnelInfo"
        :loading-map="loadingNodeMap"
        :markers="markers"
        :user-bandwidth="userInfo?.bandwidth"
        @tab-change="handleTabChange"
        @cancel="nodeInfoModal = false"
        @back="nodeDetails"
        @continue="goToTheTunnelDetails"
    />
    <TunnelFormModal
        v-model:show="tunnelInfoModal"
        title="创建隧道"
        :is-edit="false"
        :form-data="formData"
        :node-info="nodeInfoValue"
        :node-options="[]"
        :type-options="typeOptions"
        :typeOptionsTCPUDP="typeOptionsTCPUDP"
        :typeOptionsHTTPHTTPS="typeOptionsHTTPHTTPS"
        :domain-type-options="domainTypeOptions"
        :domain-name-options="domainNameOptions"
        :loading="loadingCreateTunnel"
        @select-node="nodeDetails"
        @node-change="updateNodeTrig"
        @type-change="updateTypeTrig"
        @domain-type-change="updateDomainTypeTrig"
        @port-change="updatePortTrig"
        @random-port="generateRandomPort"
        @random-name="generateRandomTunnelName"
        @cancel="tunnelInfoModal = false"
        @back="createATunnelUp"
        @submit="handleCreateTunnel"
    />
    <TunnelFormModal
        v-model:show="editTunnelModal"
        title="编辑隧道"
        :is-edit="true"
        :form-data="formData"
        :node-info="nodeInfoValue"
        :node-options="updateNodeOptions"
        :type-options="typeOptions"
        :typeOptionsTCPUDP="typeOptionsTCPUDP"
        :typeOptionsHTTPHTTPS="typeOptionsHTTPHTTPS"
        :domain-type-options="domainTypeOptions"
        :domain-name-options="domainNameOptions"
        :loading="loadingEditTunnel"
        @node-change="updateNodeTrig"
        @type-change="updateTypeTrig"
        @domain-type-change="updateDomainTypeTrig"
        @port-change="updatePortTrig"
        @random-port="generateRandomPort"
        @random-name="generateRandomTunnelName"
        @cancel="editTunnelModal = false"
        @submit="handleEditTunnelSubmit"
    />
    <TunnelListHeader :loading="loadingTunnel" :adding="addTheTunnelButtonShow" @refresh="fetchTunnelCards"
        @add="createNodes" />
    <n-grid v-if="!loadingTunnel" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="(card, index) in tunnelCards" :key="index">
            <TunnelCardComponent
                :card="card"
                :deletet-tunnel-success="deletetTunnelSuccess"
                :on-edit="editTunnel"
                :on-get-config="getConfigCode"
                :on-refresh="handleRefreshTunnel"
                :on-get-stats="handleGetStats"
                :on-offline="handleOfflineTunnel"
                :on-delete="handleConfirmDelete"
                :on-copy-address="handleCopyAddress"
            />
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="240.2px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <TunnelListEmpty v-if="tunnelCards === null" :loading="addTheTunnelButtonShow" @create="createNodes" />
    <ConfigModal
        v-model:show="configModalShow"
        :frpc-ini-config="frpcIniConfig"
        :windowsdaima="windowsdaima"
        :linuxdaima="linuxdaima"
        :on-copy="handleCopyConfig"
        :on-download="handleDownloadConfig"
    />
    <TrafficChartModal v-model:show="last7daysModal" :loading="chartLoading" ref="trafficChartModalRef" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import api from '@/api';

// Composables
import { useTunnelList } from './composables/useTunnelList';
import { useNodeList } from './composables/useNodeList';
import { useTunnelOperations } from './composables/useTunnelOperations';
import { useTunnelConfig } from './composables/useTunnelConfig';
import { useTunnelChart } from './composables/useTunnelChart';
import { useNodeInfo } from './composables/useNodeInfo';
import { useTunnelForm } from './composables/useTunnelForm';
import { useTunnelCreate } from './composables/useTunnelCreate';
import { useTunnelEdit } from './composables/useTunnelEdit';
import { useFormValidation } from './composables/useFormValidation';

// Components
import TunnelCardComponent from './components/TunnelCard.vue';
import NodeListModal from './components/NodeListModal.vue';
import ConfigModal from './components/ConfigModal.vue';
import NodeInfoModal from './components/NodeInfoModal.vue';
import TunnelFormModal from './components/TunnelFormModal.vue';
import TunnelListHeader from './components/TunnelListHeader.vue';
import TunnelListEmpty from './components/TunnelListEmpty.vue';
import TrafficChartModal from './components/TrafficChartModal.vue';

// Types
import type { TunnelCard, NodeCard, NodeInfo } from './types';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const message = useMessage();
const dialog = useDialog();

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

// 根据屏幕宽度决定对话框大小
const widthStyle = computed(() => ({
    width: screenWidth.value >= 600 ? '70%' : '100%',
}));

// Composables
const { loading: loadingTunnel, tunnelCards, fetchTunnelCards } = useTunnelList(userInfo || {});

const {
    nodeCards,
    filters,
    filteredNodeCards,
    vipNodeCards,
    normalNodeCards,
    expandedPanels,
    fetchNodeList,
    filterWeb,
    filterRegion,
    initExpandedPanels,
} = useNodeList(userInfo || undefined);

const {
    deletetTunnelSuccess,
    refreshTunnelData,
    handleOfflineTunnel: handleOfflineTunnelOp,
    handleConfirmDelete,
} = useTunnelOperations(userInfo || {}, fetchTunnelCards);

const {
    showModal: configModalShow,
    frpcIniConfig,
    windowsdaima,
    linuxdaima,
    getConfigCode,
    copyToClipboard: copyConfigToClipboard,
    downloadConfig: downloadConfigFile,
} = useTunnelConfig(userInfo || {});

const trafficChartModalRef = ref<InstanceType<typeof TrafficChartModal> | null>(null);
const { showModal: last7daysModal, loading: chartLoading, getTunnelLast7days } = useTunnelChart(
    userInfo || {},
    () => trafficChartModalRef.value?.chartRef || null
);

const { loading: loadingTunnelInfo, nodeInfo: nodeInfoRef, fetchNodeInfo } = useNodeInfo(userInfo || {});
// 为了兼容 useTunnelForm 的接口，创建一个包装对象
const nodeInfo = { value: nodeInfoRef };
// 为了在模板中方便使用，创建一个计算属性
const nodeInfoValue = computed(() => nodeInfo.value.value);

const { checkFormData } = useFormValidation();

// 模态框状态
const nodeListModal = ref(false);
const nodeInfoModal = ref(false);
const tunnelInfoModal = ref(false);
const editTunnelModal = ref(false);
const loadingNodeMap = ref(false);
const addTheTunnelButtonShow = ref(false);
const selectNode = ref('');

// 无限滚动
const count = ref(16);
const handleLoad = () => {
    count.value += 1;
};

// 隧道操作处理函数

const handleRefreshTunnel = (card: TunnelCard) => {
            if (card.state === 'true') {
                refreshTunnelData(card);
            } else {
        message.warning('隧道不在线，无法刷新数据');
    }
};

const handleGetStats = (card: TunnelCard) => {
    getTunnelLast7days(card.id, card.state);
};

const handleOfflineTunnel = (card: TunnelCard) => {
    if (card.state === 'true') {
        handleOfflineTunnelOp(card);
                } else {
        message.warning('隧道不在线，无法强制下线');
            }
};

const handleCopyAddress = (address: string) => {
    copyConfigToClipboard(address);
};

const handleCopyConfig = (text: string) => {
    copyConfigToClipboard(text);
};

const handleDownloadConfig = () => {
    downloadConfigFile();
};

// 表单和隧道创建/编辑相关
const {
    formData,
    domainNameOptions,
    updateNodeOptions,
    typeOptions,
    typeOptionsTCPUDP,
    typeOptionsHTTPHTTPS,
    domainTypeOptions,
    generateRandomPort,
    generateRandomTunnelName,
    subDomainData,
    updateFetchNodeOptions,
    checkPort,
} = useTunnelForm(userInfo || undefined, nodeInfo as unknown as { value: NodeInfo });

// 使用 composable 中的 checkPort 作为 updatePortTrig
const updatePortTrig = checkPort;

// 隧道创建和编辑
const { loading: loadingCreateTunnel, createTunnel } = useTunnelCreate(
    userInfo || {},
    formData,
    nodeInfo as unknown as { value: NodeInfo },
    checkFormData,
    () => {
        tunnelInfoModal.value = false;
        fetchTunnelCards();
    },
    fetchNodeInfo
);

const { loading: loadingEditTunnel, editTunnel: editTunnelFunc } = useTunnelEdit(
    userInfo || {},
    formData,
    nodeInfo as unknown as { value: NodeInfo },
    checkFormData,
    () => {
        editTunnelModal.value = false;
        fetchTunnelCards();
    }
);

// 编辑隧道操作
const editTunnel = async (card: TunnelCard) => {
    formData.remarks = '';
    formData.ap = card.ap;
    formData.name = card.name;
    formData.localip = card.localip;
    formData.node = card.node;
    formData.nport = String(card.nport);
    formData.type = card.type.toUpperCase(); // 转换为大写
    formData.tunnelid = card.id;

    // 判断 card.dorp 是否为数字类型的字符串
    if (!isNaN(Number(card.dorp))) {
        // 如果是数字字符串，转换为字符串并赋值给 formData.dorp
        formData.dorp = String(card.dorp);
    } else {
        // 否则将其赋值给 formData.domain
        formData.domain = card.dorp;
    }

    // 强行转换 card.encryption 和 card.compression
    formData.encryption = card.encryption === 'true';
    formData.compression = card.compression === 'true';

    if (card.type === 'http' || card.type === 'https') {
        // 调用API获取用户的免费二级域名
        api.v2.domain
            .getUserFreeSubdomains(userInfo?.usertoken as string)
            .then((data) => {
                const domainRecord = data.data.find(
                    (item: { record: string; domain: string }) => item.record + '.' + item.domain === card.dorp
                );

                if (domainRecord) {
                    // 检查remarks中是否包含"网站"
                    if (!domainRecord.remarks.includes('网站')) {
                        formData.domainNameLabel = '自定义';
                    } else {
                        formData.choose = domainRecord.domain;
                        formData.recordValue = domainRecord.record;
                        formData.remarks = domainRecord.remarks;

                        // 保留修改前记录以便比对删除
                        formData.chooseOld = domainRecord.domain;
                        formData.recordValueOld = domainRecord.record;
                        formData.nameOld = card.name;
                        formData.nodeOld = card.node;

                        formData.domainNameLabel = '免费域名';

                        // 获取可选的免费域名列表
                        subDomainData();
                    }
                } else {
                    // 如果没有找到匹配的记录
                    formData.domainNameLabel = '自定义';
                }
            })
            .catch((error) => {
                // 处理API调用错误
                message.error('获取域名信息失败: ' + (error as Error).message);
                formData.domainNameLabel = '自定义';
            });
    }

    // 获取可选节点信息
    updateFetchNodeOptions();

    // 获取选择的节点详情
    await fetchNodeInfo(formData.node);

    editTunnelModal.value = true;
};

const handleEditTunnelSubmit = () => {
    editTunnelFunc();
};

// 在编辑隧道类型更新时，重新列出对应的可用节点列表
const updateTypeTrig = async () => {
    updateFetchNodeOptions();
};

// 在更改节点后，获取节点详情，确认端口等配置是否合适
const updateNodeTrig = async () => {
    const nodeDetails = await fetchNodeInfo(formData.node);
    if (nodeDetails) {
    // 更新免费域名可选项
    if (formData.domainNameLabel === '免费域名') {
            subDomainDataWrapper();
    }
    // 检查现在的填写值是否合规
    updatePortTrig();
    } else {
        message.error('获取节点详情失败, 节点可能离线, 请更换节点');
    }
};

// 更换域名类型触发
const updateDomainTypeTrig = () => {
    if (formData.domainNameLabel === '自定义') {
        formData.domain = '';
    } else if (formData.domainNameLabel === '免费域名') {
        subDomainDataWrapper();
    }
};

const subDomainDataWrapper = async () => {
    await subDomainData();
        // 如果当前节点没有可选的域名，给出提示
        if (domainNameOptions.value.length === 0) {
            dialog.error({
                title: '此节点没有可选的免费域名',
                content: '当前节点为中国境内节点，禁止使用免费域名，请更换为中国境外节点（允许港澳台节点，无需备案）',
                positiveText: '确定',
                onPositiveClick: () => {
                    if (editTunnelModal.value) {
                        formData.node = formData.nodeOld;
                    } else if (tunnelInfoModal.value) {
                        formData.domainNameLabel = '自定义';
                        formData.domain = '';
                    }
                },
                onClose: () => {
                    if (editTunnelModal.value) {
                        formData.node = formData.nodeOld;
                    } else if (tunnelInfoModal.value) {
                        formData.domainNameLabel = '自定义';
                        formData.domain = '';
                    }
                },
            });
    }
};

// 使用 composable 中的 createTunnel
const handleCreateTunnel = async () => {
    await createTunnel();
};


const createNodes = async () => {
    addTheTunnelButtonShow.value = true;
            try {
        await fetchNodeList();
        nodeListModal.value = true;
            } finally {
        addTheTunnelButtonShow.value = false;
    }
};

const handleNodeCardClick = async (card: NodeCard) => {
    if (card.nodegroup === 'vip' && userInfo?.usergroup === '免费用户') {
        message.warning('此节点为会员节点，您的权限不足');
        return;
    }
    selectNode.value = card.name;
    nodeListModal.value = false;
    nodeInfoModal.value = true;
    await fetchNodeInfo(card.name);
};

const markers = ref([
    { position: [102.22092, 31.90059] as [number, number], title: '我的位置' },
    { position: [116.407428, 39.91923] as [number, number], title: '节点位置' },
]);

const handleTabChange = async (activeName: string) => {
    loadingNodeMap.value = true;
    if (activeName === '节点地图') {
        try {
            const response = await axios.get('https://api.uapis.cn/localaddr');
            const { latitude, longitude } = response.data;
            markers.value[0] = { position: [longitude, latitude], title: '我的位置' };
            const nodeCoordinates = nodeInfoValue.value.coordinates.split(',').map(Number);
            if (nodeCoordinates.length === 2 && !isNaN(nodeCoordinates[0]) && !isNaN(nodeCoordinates[1])) {
                markers.value[1] = { position: [nodeCoordinates[0], nodeCoordinates[1]], title: '节点位置' };
            } else {
                console.error('节点位置无效');
            }
        } catch (error) {
            console.error('获取位置失败:', error);
        } finally {
            loadingNodeMap.value = false;
        }
    }
};

const nodeDetails = () => {
    nodeListModal.value = true; // 显示节点选择模态框
    tunnelInfoModal.value = false; // 取消显示创建隧道详情拟态框
    nodeInfoModal.value = false; // 取消显示节点详情模态框
};

const createATunnelUp = () => {
    tunnelInfoModal.value = false; // 取消显示创建隧道详情拟态框
    nodeInfoModal.value = true; // 显示节点详情模态框
};

const goToTheTunnelDetails = () => {
    nodeInfoModal.value = false; // 取消显示节点详情模态框
    tunnelInfoModal.value = true; // 显示创建隧道详情拟态框
    formData.node = nodeInfoValue.value.name;
    generateRandomTunnelName();
    // 只在TCP/UDP类型且有rport信息时生成随机端口
    if ((formData.type === 'TCP' || formData.type === 'UDP') && nodeInfoValue.value?.rport) {
        generateRandomPort();
    }
    if (formData.domainNameLabel === '免费域名') {
        subDomainData();
    }
};

// 监听 filters 变化，并保存到本地存储
watch(
    filters,
    (newFilters) => {
        localStorage.setItem('nodeFilters', JSON.stringify(newFilters));
    },
    { deep: true }
);

// 监听创建隧道弹窗打开，自动生成随机隧道名
watch(
    tunnelInfoModal,
    (isOpen) => {
        if (isOpen) {
            // 当弹窗打开时，如果隧道名为空，生成随机隧道名
            if (!formData.name) {
                generateRandomTunnelName();
            }
            // 如果有节点信息且有rport，生成随机端口（仅TCP/UDP类型）
            if (
                nodeInfoValue.value?.rport &&
                (formData.type === 'TCP' || formData.type === 'UDP')
            ) {
                generateRandomPort();
            }
        }
    }
);

onMounted(() => {
    fetchTunnelCards();
    initExpandedPanels();
});

</script>