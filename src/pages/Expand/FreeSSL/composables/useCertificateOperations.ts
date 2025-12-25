import { ref, h } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import api from '@/api';
import type { Certificate } from '../types';

/**
 * 证书操作 composable
 */
export function useCertificateOperations(
    userInfo: { usertoken?: string; integral?: number } | undefined,
    onRefresh: () => void
) {
    const message = useMessage();
    const dialog = useDialog();
    const verifying = ref<number | null>(null);
    const deleting = ref<number | null>(null);
    const downloading = ref<number | null>(null);

    // 计算距离到期日的天数
    const getDaysUntilExpiry = (expiresAt: string): number => {
        const expiryDate = new Date(expiresAt);
        const now = new Date();
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // 验证证书
    const verifyCertificate = async (certificate: Certificate) => {
        if (!userInfo?.usertoken) {
            message.error('用户信息不完整');
            return;
        }

        verifying.value = certificate.id;
        message.info('正在进行验证，这可能需要些时间，请耐心等待');
        try {
            await api.v2.ssl.verifyCertificate(certificate.id, {
                usertoken: userInfo.usertoken,
            });
            message.success('证书验证成功，已自动签发');
            onRefresh();
        } catch (error) {
            message.error('验证证书失败: ' + (error as Error).message);
        } finally {
            verifying.value = null;
        }
    };

    // 删除证书
    const deleteCertificate = async (certificate: Certificate) => {
        if (!userInfo?.usertoken) {
            message.error('用户信息不完整');
            return;
        }

        // 检查是否需要扣除积分
        const shouldDeductPoints =
            certificate.status === 'issued' && certificate.expiresAt && getDaysUntilExpiry(certificate.expiresAt) > 7;

        if (shouldDeductPoints) {
            // 显示积分扣除提示
            const currentIntegral = userInfo?.integral || 0;
            const afterDeleteIntegral = currentIntegral - 1000;

            dialog.warning({
                title: '确认删除证书',
                content: () =>
                    h('div', { style: 'line-height: 1.6;' }, [
                        h('p', `确定要删除证书 "${certificate.domains}" 吗？`),
                        h('p', { style: 'color: #f5222d; margin: 8px 0;' }, [
                            '⚠️ 删除未到期SSL将扣除 ',
                            h('span', { style: 'font-weight: 600;' }, '1000'),
                            ' 积分',
                        ]),
                        h('div', { style: 'color: #666; font-size: 13px;' }, [
                            '当前积分：',
                            h('span', { style: 'font-weight: 500;' }, currentIntegral),
                            ' → 删除后：',
                            h('span', { style: 'color: #f5222d; font-weight: 500;' }, afterDeleteIntegral),
                        ]),
                        h('p', { style: 'color: #999; font-size: 12px; margin-top: 8px;' }, '此操作不可恢复'),
                    ]),
                positiveText: '确认删除',
                negativeText: '取消',
                onPositiveClick: async () => {
                    if (!userInfo?.usertoken) {
                        message.error('用户信息不完整');
                        return;
                    }

                    deleting.value = certificate.id;
                    try {
                        await api.v2.ssl.deleteCertificate(certificate.id, {
                            usertoken: userInfo.usertoken,
                        });
                        message.success('证书删除成功');
                        onRefresh();
                    } catch (error) {
                        message.error('删除失败: ' + (error as Error).message);
                    } finally {
                        deleting.value = null;
                    }
                },
            });
        } else {
            // 普通删除确认
            dialog.warning({
                title: '确认删除',
                content: `确定要删除证书 "${certificate.domains}" 吗？此操作不可恢复。`,
                positiveText: '确定',
                negativeText: '取消',
                onPositiveClick: async () => {
                    if (!userInfo?.usertoken) {
                        message.error('用户信息不完整');
                        return;
                    }
                    deleting.value = certificate.id;
                    try {
                        await api.v2.ssl.deleteCertificate(certificate.id, {
                            usertoken: userInfo.usertoken,
                        });
                        message.success('证书删除成功');
                        onRefresh();
                    } catch (error) {
                        message.error('删除证书失败: ' + (error as Error).message);
                    } finally {
                        deleting.value = null;
                    }
                },
            });
        }
    };

    // 下载证书
    const downloadCertificate = async (
        certificate: Certificate,
        type: 'certificate' | 'privatekey' | 'chain' | 'full' = 'full'
    ) => {
        if (!userInfo?.usertoken) {
            message.error('用户信息不完整');
            return;
        }

        downloading.value = certificate.id;
        try {
            const content = await api.v2.ssl.downloadCertificate(certificate.id, userInfo.usertoken, type);

            // 创建下载链接
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // 生成文件名
            const domainName = certificate.domains.split(',')[0].replace(/^\*\./, '').replace(/\./g, '_');
            const typeMap = {
                certificate: 'certificate.pem',
                privatekey: 'private.key',
                chain: 'chain.pem',
                full: 'fullchain.pem',
            };
            a.download = `${domainName}_${typeMap[type]}`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            message.success('证书下载成功');
        } catch (error) {
            message.error('下载证书失败: ' + (error as Error).message);
        } finally {
            downloading.value = null;
        }
    };

    // 查看证书详情
    const viewCertificateDetail = async (certificate: Certificate) => {
        if (!userInfo?.usertoken) {
            message.error('用户信息不完整');
            return;
        }

        try {
            const response = await api.v2.ssl.getCertificateDetail(certificate.id, userInfo.usertoken);
            return response.data;
        } catch (error) {
            message.error('获取证书详情失败: ' + (error as Error).message);
            return null;
        }
    };

    return {
        verifying,
        deleting,
        downloading,
        verifyCertificate,
        deleteCertificate,
        downloadCertificate,
        viewCertificateDetail,
    };
}
