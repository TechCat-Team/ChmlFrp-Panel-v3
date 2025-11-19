import { reactive, ref, computed, unref, type Ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { TunnelFormData, NodeInfo, Domain } from '../types';
import {
    DEFAULT_LOCAL_IP,
    DEFAULT_TUNNEL_TYPE,
    DEFAULT_NPORT,
    DEFAULT_DORP,
    DEFAULT_TUNNEL_NAME_LENGTH,
    RANDOM_PORT_CHARS,
    CHINA_SPECIAL_REGIONS,
} from '../constants';

/**
 * 隧道表单 composable
 */
export function useTunnelForm(
    userInfo?: { usertoken?: string; usergroup?: string },
    nodeInfo?: { value: NodeInfo | Ref<NodeInfo> }
) {
    const message = useMessage();

    const formData = reactive<TunnelFormData>({
        name: '',
        localip: DEFAULT_LOCAL_IP,
        node: '',
        type: DEFAULT_TUNNEL_TYPE,
        nport: DEFAULT_NPORT,
        domainNameLabel: '',
        dorp: DEFAULT_DORP,
        choose: '',
        encryption: false,
        compression: false,
        ap: '',
        domain: '',
        recordValue: '',
        remarks: '',
        tunnelid: 0,
        chooseOld: '',
        recordValueOld: '',
        nodeOld: '',
        nameOld: '',
    });

    const domainNameOptions = ref<{ label: string; value: string }[]>([]);
    const updateNodeOptions = ref<{ label: string; value: string }[]>([]);

    const typeOptions = computed(() =>
        ['TCP', 'UDP', 'HTTP', 'HTTPS'].map((v) => ({
            label: v,
            value: v,
        }))
    );

    const typeOptionsTCPUDP = [
        { label: 'TCP', value: 'TCP' },
        { label: 'UDP', value: 'UDP' },
        { label: 'HTTP', value: 'HTTP', disabled: true },
        { label: 'HTTPS', value: 'HTTPS', disabled: true },
    ];

    const typeOptionsHTTPHTTPS = [
        { label: 'TCP', value: 'TCP', disabled: true },
        { label: 'UDP', value: 'UDP', disabled: true },
        { label: 'HTTP', value: 'HTTP' },
        { label: 'HTTPS', value: 'HTTPS' },
    ];

    const domainTypeOptions = ['自定义', '免费域名'].map((v) => ({
        label: v,
        value: v,
    }));

    // 随机生成外网端口
    const generateRandomPort = () => {
        if (!nodeInfo?.value) return;
        // 获取实际的节点信息（处理 ref 嵌套）
        const actualNodeInfo = unref(nodeInfo.value as Ref<NodeInfo> | NodeInfo);
        if (!actualNodeInfo || !actualNodeInfo.rport) return;
        const rportStr = String(actualNodeInfo.rport);
        const portRange = rportStr.split('-');
        if (portRange.length !== 2) return;
        const minPort = parseInt(portRange[0]) || 10000;
        const maxPort = parseInt(portRange[1]) || 65535;
        formData.dorp = String(Math.floor(Math.random() * (maxPort - minPort + 1)) + Number(minPort));
    };

    // 随机生成隧道名
    const generateRandomTunnelName = () => {
        let randomName = '';
        for (let i = 0; i < DEFAULT_TUNNEL_NAME_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * RANDOM_PORT_CHARS.length);
            randomName += RANDOM_PORT_CHARS[randomIndex];
        }
        formData.name = randomName;
    };

    // 获取免费域名列表
    const subDomainData = async () => {
        try {
            const domains = (await api.v2.domain.listAvailableDomains()).data;

            if (!nodeInfo?.value) return;
            const actualNodeInfo = unref(nodeInfo.value as Ref<NodeInfo> | NodeInfo);
            if (!actualNodeInfo) return;

            domainNameOptions.value = domains
                .filter(
                    (domain: Domain) =>
                        actualNodeInfo.china !== 'yes' ||
                        CHINA_SPECIAL_REGIONS.some((region) => actualNodeInfo.area.includes(region)) ||
                        domain.icpFiling
                )
                .map((domain: Domain) => ({
                    label: domain.domain,
                    value: domain.domain,
                }));

            formData.choose = formData.chooseOld;

            if (domainNameOptions.value.length === 0) {
                message.error('此节点没有可选的免费域名');
                formData.domainNameLabel = '自定义';
                formData.domain = '';
            } else if (
                !domainNameOptions.value.some((option: { value: string }) => option.value === formData.choose)
            ) {
                formData.choose = '';
            }
        } catch (error) {
            message.error('获取域名数据失败: ' + (error as Error).message);
        }
    };

    // 获取可用的节点列表（用于编辑）
    const updateFetchNodeOptions = async () => {
        try {
            const nodeList = await api.v2.node.getNodeList();
            if (!nodeList || !nodeList.data) return;

            const filteredNodeList = nodeList.data.filter((node: { web: string; udp: string; nodegroup: string }) => {
                const show =
                    (formData.type === 'HTTP' || formData.type === 'HTTPS' ? node.web === 'yes' : true) &&
                    (formData.type === 'UDP' ? node.udp === 'true' : true) &&
                    (userInfo?.usergroup === '免费用户' ? node.nodegroup === 'user' : true);
                return show;
            });

            updateNodeOptions.value = filteredNodeList.map((node: { name: string }) => ({
                label: node.name,
                value: node.name,
            }));

            if (!updateNodeOptions.value.some((option: { value: string }) => option.value === formData.node)) {
                formData.node = '';
            }
        } catch (error) {
            message.error('获取节点列表失败: ' + (error as Error).message);
        }
    };

    // 检查端口合规性
    const checkPort = () => {
        if (!nodeInfo?.value || (formData.type !== 'TCP' && formData.type !== 'UDP')) return;
        // 获取实际的节点信息（处理 ref 嵌套）
        const actualNodeInfo = unref(nodeInfo.value as Ref<NodeInfo> | NodeInfo);
        if (!actualNodeInfo || !actualNodeInfo.rport) return;
        const rportStr = String(actualNodeInfo.rport);
        const portRange = rportStr.split('-');
        if (portRange.length !== 2) return;
        const minPort = parseInt(portRange[0]) || 10000;
        const maxPort = parseInt(portRange[1]) || 65535;
        const dorpNum = Number(formData.dorp);
        if (isNaN(dorpNum) || dorpNum < minPort || dorpNum > maxPort) {
            message.destroyAll();
            message.error(`外网端口必须在 ${minPort} 到 ${maxPort} 之间`);
        } else {
            message.destroyAll();
            message.success(`外网端口合规`);
        }
    };

    return {
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
    };
}

