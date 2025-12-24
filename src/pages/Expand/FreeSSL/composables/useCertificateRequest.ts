import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { CertificateFormModel } from '../types';
import type { SSLProvider, ChallengeType } from '@/api/v2/ssl/ssl';

/**
 * 申请证书 composable
 */
export function useCertificateRequest(userInfo: { usertoken?: string } | undefined, onSuccess: () => void) {
    const message = useMessage();
    const loading = ref(false);

    const requestCertificate = async (model: CertificateFormModel) => {
        if (!userInfo?.usertoken) {
            message.error('用户信息不完整');
            return;
        }

        if (!model.provider) {
            message.error('请选择证书提供商');
            return;
        }

        if (!model.domains || model.domains.length === 0) {
            message.error('请至少输入一个域名');
            return;
        }

        loading.value = true;
        try {
            // 处理域名：去除空白，验证格式
            const domains = model.domains.map((d) => d.trim()).filter((d) => d.length > 0);

            if (domains.length === 0) {
                message.error('请至少输入一个有效的域名');
                return;
            }

            await api.v2.ssl.requestCertificate({
                usertoken: userInfo.usertoken,
                provider: model.provider as SSLProvider,
                domains: domains,
                challengeType: model.challengeType || 'http01',
            });

            message.success('证书申请已创建，请完成域名验证');
            onSuccess();
        } catch (error) {
            message.error('申请证书失败: ' + (error as Error).message);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        requestCertificate,
    };
}
