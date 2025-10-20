import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import axios from 'axios';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import type { TunnelCard, TunnelStatus } from '@/types/tunnel';

export function useTunnel() {
    const message = useMessage();
    const dialog = useDialog();
    const userStore = useUserStore();
    const userInfo = userStore.userInfo;

    const tunnelCards = ref<TunnelCard[] | null>(null);
    const loadingTunnel = ref(true);
    const deletetTunnelSuccess = ref(true);
    const deletetButtonLoading = ref(false);

    /**
     * 获取隧道列表
     */
    const fetchTunnelCards = async () => {
        loadingTunnel.value = true;
        try {
            const { data } = await api.v2.tunnel.getTunnelList(userInfo?.usertoken || '');

            if (!data || data.length === 0) {
                tunnelCards.value = null;
            } else {
                tunnelCards.value = data.map((card: TunnelCard) => {
                    let status: TunnelStatus = { type: 'error', label: '维护', description: '节点维护中' };

                    if (card.nodestate === 'online') {
                        status =
                            card.state === 'true'
                                ? { type: 'success', label: '在线', description: '隧道在线 一切正常' }
                                : { type: 'warning', label: '离线', description: '隧道离线 请检查客户端是否正常启动' };
                    } else if (!card.ip || card.ip === '') {
                        status = { type: 'default', label: '永久下线', description: '节点已永久下线 请编辑更换' };
                    } else if (card.nodestate === 'offline') {
                        status = { type: 'error', label: '节点掉线', description: '节点掉线 请稍后再试' };
                    }

                    const tags = [card.node, `${card.localip}:${card.nport} - ${card.type}`];
                    const ip = card.ip ? card.ip : '节点已下线';

                    return { ...card, status, tags, ip };
                });
            }
        } catch (error) {
            message.error('获取隧道列表失败: ' + (error as Error).message);
            tunnelCards.value = null;
        } finally {
            loadingTunnel.value = false;
        }
    };

    /**
     * 删除隧道
     */
    const deleteTunnel = async (title: string, id: number, ttype: string, dorp: string) => {
        try {
            const response = await axios.get(
                `https://cf-v1.uapis.cn/api/deletetl.php?token=${userInfo?.usertoken}&nodeid=${id}&userid=${userInfo?.id}`
            );
            if (response.data.code === 200) {
                message.success('成功删除隧道：' + title);
                
                // 如果是HTTP/HTTPS隧道，检查是否需要删除免费域名
                if (ttype === 'http' || ttype === 'https') {
                    await checkAndDeleteFreeDomain(dorp);
                }
                
                // 从列表中移除
                if (tunnelCards.value !== null) {
                    const index = tunnelCards.value.findIndex((tunnel) => tunnel.name === title);
                    if (index !== -1) {
                        tunnelCards.value.splice(index, 1);
                    }
                }
            } else {
                message.error(response.data.error);
                await fetchTunnelCards();
            }
        } catch (error) {
            console.error('[隧道列表]删除隧道API调用失败', error);
            message.error('删除隧道API调用失败' + error);
        } finally {
            deletetTunnelSuccess.value = true;
        }
    };

    /**
     * 检查并删除免费域名
     */
    const checkAndDeleteFreeDomain = async (dorp: string) => {
        try {
            const data = await api.v2.domain.getUserFreeSubdomains(userInfo?.usertoken || '');
            const domainRecord = data.data.find(
                (item: { record: string; domain: string }) => item.record + '.' + item.domain === dorp
            );
            
            if (domainRecord && domainRecord.remarks.includes('网站')) {
                dialog.warning({
                    title: '警告',
                    content: '隧道删除成功！但是此隧道绑定了免费域名，请问是否同步删除此隧道的域名解析。',
                    positiveText: '删除',
                    negativeText: '不删除',
                    onPositiveClick: async () => {
                        try {
                            await api.v2.domain.deleteFreeSubdomain({
                                token: userInfo?.usertoken || '',
                                domain: domainRecord.domain,
                                record: domainRecord.record,
                            });
                            message.success('免费域名同步删除成功');
                        } catch (error) {
                            message.error('免费域名删除失败: ' + (error as Error).message);
                        }
                    },
                });
            }
        } catch (error) {
            console.error('获取域名信息失败', error);
        }
    };

    /**
     * 确认删除隧道
     */
    const handleConfirmDelete = (title: string, id: number, ttype: string, dorp: string) => {
        dialog.warning({
            title: '警告',
            content: '您正在删除隧道：' + title + '(' + id + ')，请确认是否删除。',
            positiveText: '确定',
            negativeText: '取消',
            loading: deletetButtonLoading.value,
            onPositiveClick: async () => {
                deletetTunnelSuccess.value = false;
                deletetButtonLoading.value = true;
                await deleteTunnel(title, id, ttype, dorp);
                deletetButtonLoading.value = false;
            },
        });
    };

    /**
     * 获取隧道配置代码
     */
    const getTunnelConfig = async (node: string, name: string) => {
        try {
            const response = await api.v2.tunnel.getTunnelConfig(userInfo?.usertoken || '', node, name);
            return response.data || '';
        } catch (error) {
            message.error('获取配置失败: ' + (error as Error).message);
            return '';
        }
    };

    /**
     * 获取近7天流量数据
     */
    const getTunnelLast7days = async (tunnelId: number) => {
        try {
            const response = await api.v2.tunnel.getTunnelLast7days(userInfo?.usertoken || '', tunnelId);
            return response.data;
        } catch (error) {
            message.error('获取流量数据时出错: ' + (error as Error).message);
            throw error;
        }
    };

    /**
     * 创建隧道 (V1 API)
     */
    const createTunnelV1 = async (formData: any) => {
        try {
            const response = await axios.post(
                'https://cf-v1.uapis.cn/api/addtunnel.php',
                {
                    usertoken: userInfo?.usertoken,
                    userid: userInfo?.id,
                    type: formData.type.toLowerCase(),
                    node: formData.node,
                    name: formData.name,
                    ap: formData.ap,
                    dorp:
                        formData.type.toLowerCase() === 'tcp' || formData.type.toLowerCase() === 'udp'
                            ? formData.dorp
                            : formData.domain,
                    localip: formData.localip,
                    nport: Number(formData.nport),
                    encryption: formData.encryption.toString(),
                    compression: formData.compression.toString(),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            const data = response.data;
            if (response.status === 200 && data.code === 200) {
                message.success('隧道创建成功');
                return data;
            } else {
                message.error('隧道创建失败: ' + data.error);
                return null;
            }
        } catch (error) {
            message.error('隧道创建API请求失败:' + error);
            return null;
        }
    };

    /**
     * 创建隧道 (V2 API)
     */
    const createTunnelV2 = async (payload: any) => {
        try {
            const data = await api.v2.tunnel.createTunnel(payload);
            message.success('隧道创建成功');
            return data;
        } catch (error) {
            message.error('隧道创建失败: ' + (error as Error).message);
            throw error;
        }
    };

    /**
     * 更新隧道 (V1 API)
     */
    const updateTunnelV1 = async (formData: any) => {
        try {
            const response = await axios.post(
                'https://cf-v1.uapis.cn/api/cztunnel.php',
                {
                    usertoken: userInfo?.usertoken,
                    userid: userInfo?.id,
                    type: formData.type.toLowerCase(),
                    node: formData.node,
                    name: formData.name,
                    ap: formData.ap,
                    dorp:
                        formData.type.toLowerCase() === 'tcp' || formData.type.toLowerCase() === 'udp'
                            ? formData.dorp
                            : formData.domain,
                    localip: formData.localip,
                    nport: Number(formData.nport),
                    tunnelid: formData.tunnelid,
                    encryption: formData.encryption.toString(),
                    compression: formData.compression.toString(),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            const data = response.data;
            if (response.status === 200 && data.code === 200) {
                message.success('隧道编辑成功');
                return data;
            } else {
                message.error('隧道编辑失败: ' + data.error);
                return null;
            }
        } catch (error) {
            message.error('隧道编辑API请求失败:' + error);
            return null;
        }
    };

    /**
     * 更新隧道 (V2 API)
     */
    const updateTunnelV2 = async (formData: any) => {
        try {
            const data = await api.v2.tunnel.updateTunnel({
                tunnelid: formData.tunnelid,
                token: userInfo?.usertoken || '',
                tunnelname: formData.name,
                node: formData.node,
                localip: formData.localip,
                porttype: formData.type.toLowerCase(),
                localport: Number(formData.nport),
                ...(formData.type.toUpperCase() === 'HTTP' || formData.type.toUpperCase() === 'HTTPS'
                    ? { banddomain: formData.domain }
                    : { remoteport: formData.dorp }),
                encryption: formData.encryption,
                compression: formData.compression,
                extraparams: formData.ap,
            });

            message.success('隧道编辑成功');
            return data;
        } catch (error) {
            message.error('隧道编辑失败: ' + (error as Error).message);
            return null;
        }
    };

    return {
        tunnelCards,
        loadingTunnel,
        deletetTunnelSuccess,
        deletetButtonLoading,
        fetchTunnelCards,
        deleteTunnel,
        handleConfirmDelete,
        getTunnelConfig,
        getTunnelLast7days,
        createTunnelV1,
        createTunnelV2,
        updateTunnelV1,
        updateTunnelV2,
    };
}

