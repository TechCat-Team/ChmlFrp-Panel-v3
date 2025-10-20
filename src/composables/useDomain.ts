import { ref } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import { useUserStore } from '@/stores/user';
import type { Domain, NodeInfo } from '@/types/tunnel';

export function useDomain() {
    const message = useMessage();
    const dialog = useDialog();
    const userStore = useUserStore();
    const userInfo = userStore.userInfo;

    const domainNameOptions = ref<{ label: string; value: string }[]>([]);

    /**
     * 获取可用的免费域名列表
     */
    const fetchAvailableDomains = async (nodeInfo: NodeInfo) => {
        try {
            const domains = (await api.v2.domain.listAvailableDomains()).data;

            // 境内节点过滤掉无备案的域名
            domainNameOptions.value = domains
                .filter(
                    (domain: Domain) =>
                        nodeInfo.china !== 'yes' ||
                        ['香港', '澳门', '台湾'].some((region) => nodeInfo.area.includes(region)) ||
                        domain.icpFiling
                )
                .map((domain: Domain) => ({
                    label: domain.domain,
                    value: domain.domain,
                }));

            // 如果没有可选域名，给出提示
            if (domainNameOptions.value.length === 0) {
                dialog.error({
                    title: '此节点没有可选的免费域名',
                    content: '当前节点为中国境内节点，禁止使用免费域名，请更换为中国境外节点（允许港澳台节点，无需备案）',
                    positiveText: '确定',
                });
                return false;
            }

            return true;
        } catch (error) {
            message.error('获取域名数据失败: ' + (error as Error).message);
            return false;
        }
    };

    /**
     * 获取用户的免费二级域名
     */
    const getUserFreeSubdomains = async () => {
        try {
            const data = await api.v2.domain.getUserFreeSubdomains(userInfo?.usertoken || '');
            return data.data;
        } catch (error) {
            message.error('获取用户域名失败: ' + (error as Error).message);
            return null;
        }
    };

    /**
     * 创建免费域名
     */
    const createFreeDomain = async (
        domain: string,
        record: string,
        target: string,
        remarks: string,
        showMessage = true
    ) => {
        try {
            const data = await api.v2.domain.createFreeSubdomain({
                token: userInfo?.usertoken || '',
                domain: domain,
                record: record,
                type: 'CNAME',
                target: target,
                ttl: '10分钟',
                remarks: remarks,
            });

            if (showMessage) {
                message.success('免费域名创建成功');
            }
            return data;
        } catch (error) {
            message.error('免费域名创建失败: ' + (error as Error).message);
            throw error;
        }
    };

    /**
     * 删除免费域名
     */
    const deleteFreeDomain = async (domain: string, record: string, showMessage = true) => {
        try {
            const data = await api.v2.domain.deleteFreeSubdomain({
                token: userInfo?.usertoken || '',
                domain: domain,
                record: record,
            });

            if (showMessage) {
                message.success('免费域名删除成功');
            }
            return data;
        } catch (error) {
            message.error('免费域名删除失败: ' + (error as Error).message);
            throw error;
        }
    };

    /**
     * 更新免费域名（通过删除旧记录并创建新记录）
     */
    const updateFreeDomain = async (
        domainOld: string,
        recordOld: string,
        domain: string,
        record: string,
        target: string,
        remarks: string,
        showMessage = true
    ) => {
        try {
            // 获取旧解析参数
            const freeDomainOld = await getUserFreeSubdomains();
            if (!freeDomainOld) {
                return null;
            }

            const oldRecord = freeDomainOld.find(
                (item: { record: string; domain: string }) =>
                    item.record === recordOld && item.domain === domainOld
            );

            if (!oldRecord) {
                message.error('未找到旧域名记录');
                return null;
            }

            const targetOld = oldRecord.target;
            const remarksOld = oldRecord.remarks;

            // 删除原记录
            const deleteResponse = await deleteFreeDomain(domainOld, recordOld, false);
            if (!deleteResponse) {
                return null;
            }

            // 创建新记录
            try {
                const createResponse = await createFreeDomain(domain, record, target, remarks, false);
                if (showMessage) {
                    message.success('免费域名修改成功');
                }
                return createResponse;
            } catch (error) {
                // 回溯删除原记录
                try {
                    await createFreeDomain(domainOld, recordOld, targetOld, remarksOld, false);
                    message.error('免费域名修改失败，已回溯');
                } catch (rollbackError) {
                    message.error('免费域名修改失败，回溯失败，请前往免费域名管理页面删除错误域名');
                }
                return null;
            }
        } catch (error) {
            message.error('免费域名修改API请求失败:' + error);
            return null;
        }
    };

    /**
     * 检查域名是否为免费域名
     */
    const checkIsFreeDomain = async (dorp: string) => {
        try {
            const data = await getUserFreeSubdomains();
            if (!data) return null;

            const domainRecord = data.find(
                (item: { record: string; domain: string }) => item.record + '.' + item.domain === dorp
            );

            if (domainRecord && domainRecord.remarks.includes('网站')) {
                return domainRecord;
            }
            return null;
        } catch (error) {
            console.error('检查免费域名失败', error);
            return null;
        }
    };

    return {
        domainNameOptions,
        fetchAvailableDomains,
        getUserFreeSubdomains,
        createFreeDomain,
        deleteFreeDomain,
        updateFreeDomain,
        checkIsFreeDomain,
    };
}

