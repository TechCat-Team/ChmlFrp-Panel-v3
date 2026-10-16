import { computed, ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import { connectionProtocolOptions, frpcStartCommand, type ConnectionProtocol } from '@/utils/frpcTransport';
import type { TunnelCard } from '../types';

/** Single-tunnel configuration and shortcuts always share the same protocol. */
export function useTunnelConfig(userInfo: { usertoken?: string; id?: number }) {
    const message = useMessage();
    const showModal = ref(false);
    const frpcIniConfig = ref('');
    const windowsdaima = ref('');
    const linuxdaima = ref('');
    const protocol = ref<ConnectionProtocol>('tcp');
    const loading = ref(false);
    const quicAvailable = ref(false);
    const protocolOptions = computed(() => connectionProtocolOptions(quicAvailable.value));
    let currentTunnel: TunnelCard | null = null;
    let requestVersion = 0;
    let modalVersion = 0;

    const clearConfig = () => {
        frpcIniConfig.value = '';
        windowsdaima.value = '';
        linuxdaima.value = '';
    };
    const loadConfig = async (card: TunnelCard, selectedProtocol: ConnectionProtocol) => {
        const version = ++requestVersion;
        clearConfig();
        loading.value = true;
        try {
            const response = await api.v2.tunnel.getTunnelConfig(card.node || '', card.name, selectedProtocol);
            if (version !== requestVersion || !showModal.value) return;
            frpcIniConfig.value = response.data || '';
            windowsdaima.value = frpcStartCommand(userInfo.usertoken, [card.id], selectedProtocol);
            linuxdaima.value = frpcStartCommand(userInfo.usertoken, [card.id], selectedProtocol, 'unix');
        } catch (error) {
            if (version === requestVersion && showModal.value) {
                message.error('获取配置代码失败: ' + (error as Error).message);
            }
        } finally {
            if (version === requestVersion) loading.value = false;
        }
    };

    const getConfigCode = async (card: TunnelCard) => {
        const version = ++modalVersion;
        currentTunnel = card;
        protocol.value = 'tcp';
        quicAvailable.value = false;
        showModal.value = true;
        await Promise.allSettled([
            loadConfig(card, 'tcp'),
            api.v2.node.getNodeList().then((response) => {
                if (version === modalVersion && showModal.value) {
                    quicAvailable.value = response.data.some((node) => node.name === card.node && node.quic === true);
                }
            }),
        ]);
    };

    const changeProtocol = (value: ConnectionProtocol) => {
        if (!currentTunnel || value === protocol.value || (value === 'quic' && !quicAvailable.value)) return;
        protocol.value = value;
        void loadConfig(currentTunnel, value);
    };

    watch(
        showModal,
        (visible) => {
            if (!visible) {
                ++requestVersion;
                ++modalVersion;
                loading.value = false;
                clearConfig();
            }
        },
        { flush: 'sync' }
    );

    const copyToClipboard = (text: string) => {
        if (loading.value || !text) return;
        navigator.clipboard
            .writeText(text)
            .then(() => message.success('配置代码复制成功'))
            .catch(() => message.error('配置代码复制失败'));
    };

    const downloadConfig = () => {
        if (loading.value || !frpcIniConfig.value) return;
        try {
            const url = window.URL.createObjectURL(
                new Blob([frpcIniConfig.value], { type: 'text/plain;charset=utf-8' })
            );
            const link = document.createElement('a');
            link.href = url;
            link.download = 'frpc.toml';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            message.success('配置文件下载成功');
        } catch {
            message.error('配置文件下载失败');
        }
    };

    return {
        showModal,
        frpcIniConfig,
        windowsdaima,
        linuxdaima,
        protocol,
        protocolOptions,
        loading,
        getConfigCode,
        changeProtocol,
        copyToClipboard,
        downloadConfig,
    };
}
