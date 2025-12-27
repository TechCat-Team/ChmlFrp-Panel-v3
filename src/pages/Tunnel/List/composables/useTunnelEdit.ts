import { ref, unref, type Ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import axios from 'axios';
import api from '@/api';
import type { TunnelFormData, NodeInfo } from '../types';

/**
 * 隧道编辑 composable
 */
export function useTunnelEdit(
    userInfo: { usertoken?: string; id?: number },
    formData: TunnelFormData,
    nodeInfo: { value: NodeInfo | Ref<NodeInfo> },
    checkFormData: (formData: TunnelFormData, nodeInfo: NodeInfo) => boolean | null,
    onSuccess: () => void
) {
    const message = useMessage();
    const dialog = useDialog();
    const loading = ref(false);

    // 获取实际的节点信息（处理 ref 嵌套）
    const getActualNodeInfo = (): NodeInfo => {
        const nodeInfoValue = nodeInfo.value;
        // 如果是 ref，使用 unref 获取值；否则直接返回
        return unref(nodeInfoValue as Ref<NodeInfo> | NodeInfo);
    };

    // 获取免费节点详情
    const apiGetFreeNodeInfo = async () => {
        try {
            const data = await api.v2.domain.getUserFreeSubdomains();
            return data.data;
        } catch (error) {
            message.error('节点详情获取失败: ' + (error as Error).message);
        }
        return null;
    };

    // 创建免费域名
    const apiCreateFreeDomain = async (
        domain: string,
        record: string,
        target: string,
        remarks: string,
        flag = true
    ) => {
        try {
            const data = await api.v2.domain.createFreeSubdomain({
                domain: domain,
                record: record,
                type: 'CNAME',
                target: target,
                ttl: '10分钟',
                remarks: remarks,
            });
            flag && message.success('免费域名创建成功');
            return data;
        } catch (error) {
            message.error('免费域名创建失败: ' + (error as Error).message);
        }
        return null;
    };

    // 删除免费域名
    const apiDeleteFreeDomain = async (domain: string, record: string, flag = true) => {
        try {
            const data = await api.v2.domain.deleteFreeSubdomain({
                domain: domain,
                record: record,
            });
            flag && message.success('免费域名删除成功');
            return data;
        } catch (error) {
            message.error('免费域名删除失败: ' + (error as Error).message);
        }
        return null;
    };

    // 修改免费域名
    const apiUpdateFreeDomain = async (
        domainOld: string,
        recordOld: string,
        domain: string,
        record: string,
        target: string,
        remarks: string,
        flag = true
    ) => {
        try {
            let freeDomainOld = await apiGetFreeNodeInfo();
            if (freeDomainOld === null) {
                return null;
            }

            const targetOld = freeDomainOld.find(
                (item: { record: string; domain: string }) => item.record === recordOld && item.domain === domainOld
            )?.target;
            if (!targetOld) {
                return null;
            }
            const remarksOld = freeDomainOld.find(
                (item: { record: string; domain: string }) => item.record === recordOld && item.domain === domainOld
            )?.remarks;
            if (!remarksOld) {
                return null;
            }

            const deleteResponse = await apiDeleteFreeDomain(domainOld, recordOld, false);
            if (deleteResponse === null) {
                return null;
            }

            const createResponse = await apiCreateFreeDomain(domain, record, target, remarks, false);
            if (createResponse === null) {
                const rollbackResponse = await apiCreateFreeDomain(domainOld, recordOld, targetOld, remarksOld, false);
                if (rollbackResponse === null) {
                    message.error('免费域名修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
                } else {
                    message.error('免费域名修改失败，回溯成功');
                }
                return null;
            }

            flag && message.success('免费域名修改成功');
            return createResponse;
        } catch (error) {
            message.error('免费域名修改API请求失败:' + error);
        }
        return null;
    };

    // 获取节点详情
    const apiGetNodeInfo = async (node: string) => {
        try {
            const data = await api.v2.node.getNodeInfo(node);
            return data.data;
        } catch (error) {
            message.error('节点详情获取失败: ' + (error as Error).message);
        }
        return null;
    };

    // 修改隧道apiv1
    const apiChangeTunnelV1 = async () => {
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
                            ? Number(formData.dorp)
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
            }
        } catch (error) {
            message.error('隧道编辑API请求失败:' + error);
        }
        return null;
    };

    // 修改隧道apiv2
    const apiChangeTunnelV2 = async () => {
        try {
            const data = await api.v2.tunnel.updateTunnel({
                tunnelid: formData.tunnelid,
                tunnelname: formData.name,
                node: formData.node,
                localip: formData.localip,
                porttype: formData.type.toLowerCase(),
                localport: Number(formData.nport),
                ...(formData.type.toUpperCase() === 'HTTP' || formData.type.toUpperCase() === 'HTTPS'
                    ? { banddomain: formData.domain }
                    : { remoteport: Number(formData.dorp) }),
                encryption: formData.encryption,
                compression: formData.compression,
                extraparams: formData.ap,
            });

            message.success('隧道编辑成功');
            return data;
        } catch (error) {
            message.error('隧道编辑失败: ' + (error as Error).message);
        }
        return null;
    };

    const editTunnel = async () => {
        loading.value = true;

        try {
            // 获取实际的节点信息
            const actualNodeInfo = getActualNodeInfo();

            // 检查合规性
            if (!checkFormData(formData, actualNodeInfo)) {
                loading.value = false;
                return;
            }

            // HTTP 或 HTTPS 隧道
            if (formData.type === 'HTTP' || formData.type === 'HTTPS') {
                // 免费域名
                if (formData.domainNameLabel === '免费域名') {
                    const freeDomainChanged =
                        formData.choose !== formData.chooseOld ||
                        formData.recordValue !== formData.recordValueOld ||
                        formData.node !== formData.nodeOld ||
                        formData.name !== formData.nameOld;

                    if (freeDomainChanged) {
                        formData.domain = formData.recordValue + '.' + formData.choose;
                        let nodeInfoData = await apiGetNodeInfo(formData.node);
                        if (nodeInfoData === null) {
                            loading.value = false;
                            return;
                        }

                        let err = await apiUpdateFreeDomain(
                            formData.chooseOld,
                            formData.recordValueOld,
                            formData.choose,
                            formData.recordValue,
                            nodeInfoData.ip,
                            '解析 网站 到 ' + formData.name + ' - ' + formData.node,
                            true
                        );
                        if (err === null) {
                            message.error('免费域名修改失败');
                            loading.value = false;
                            return;
                        }
                    }

                    try {
                        let err = await apiChangeTunnelV1();
                        if (err === null) {
                            let nodeInfoOld = await apiGetNodeInfo(formData.nodeOld);
                            if (nodeInfoOld === null) {
                                message.error('修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
                                loading.value = false;
                                return;
                            }
                            let err = await apiUpdateFreeDomain(
                                formData.choose,
                                formData.recordValue,
                                formData.chooseOld,
                                formData.recordValueOld,
                                nodeInfoOld.ip,
                                '解析 网站 到 ' + formData.nameOld + ' - ' + formData.nodeOld,
                                false
                            );
                            if (err === null) {
                                message.error('修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
                                loading.value = false;
                                return;
                            }
                            message.error('修改失败，回溯成功');
                            loading.value = false;
                            return;
                        }

                        const freeDomainChanged =
                            formData.choose !== formData.chooseOld ||
                            formData.recordValue !== formData.recordValueOld ||
                            formData.node !== formData.nodeOld ||
                            formData.name !== formData.nameOld;

                        if (freeDomainChanged) {
                            dialog.success({
                                title: '成功',
                                content:
                                    '隧道修改成功！此隧道使用的免费域名已同步更新解析，但是域名解析通常不会立即生效，需要等待DNS缓存更新，这个时间一般10分钟，慢的则需要48小时。请耐心等待，期间域名可能无法访问。',
                                positiveText: '我知道了',
                            });
                        }

                        onSuccess();
                    } catch (error) {
                        message.error('隧道编辑API调用失败:' + error);
                    }
                }
                // 自定义域名
                else {
                    try {
                        let err = await apiChangeTunnelV1();
                        err === null ? null : onSuccess();
                    } catch (error) {
                        message.error('隧道编辑API调用失败:' + error);
                    }
                }
            }
            // TCP 或 UDP 隧道
            else {
                try {
                    let err = await apiChangeTunnelV2();
                    err === null ? null : onSuccess();
                } catch (error) {
                    message.error('隧道编辑API调用失败:' + error);
                }
            }
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        editTunnel,
    };
}
