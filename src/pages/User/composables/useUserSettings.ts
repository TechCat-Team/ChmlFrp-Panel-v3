import { ref, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useDialog, useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import {
    KeyOutline,
    PersonOutline,
    ImageOutline,
    MailOutline,
    LockClosedOutline,
    ChatboxEllipsesOutline,
    CodeDownloadOutline,
    TrashBinOutline,
} from '@vicons/ionicons5';

/**
 * 用户设置 composable
 */
export function useUserSettings(userInfo: { usertoken?: string; qq?: string; email?: string }) {
    const router = useRouter();
    const dialog = useDialog();
    const message = useMessage();
    const userStore = useUserStore();

    const loadingOfflineAllTunnels = ref(false);

    const resetToken = () => {
        dialog.warning({
            title: '警告',
            content:
                '重置TOKEN后旧的配置文件均无法使用，这代表着您的所有隧道需要重新获取配置文件再启动、且所有保存登录的设备均需重新登录。',
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
                try {
                    await api.v2.user.resetToken(userInfo?.usertoken || '');
                    message.success('TOKEN已重置，请重新登录');
                    userStore.clearUser();
                    router.push('/sign');
                } catch (error) {
                    message.error('重置Token失败: ' + (error as Error).message);
                }
            },
        });
    };

    const offlineAllTunnels = () => {
        const d = dialog.warning({
            title: '警告',
            content:
                '此操作将会停止运行所有您正在运行中的隧道，且frp进程将会自动关闭。请确定此操作是您预期内的。（注意！仅FRP核心版本0.51.2_251023版本才支持此功能）',
            positiveText: '确定',
            negativeText: '取消',
            onPositiveClick: async () => {
                d.loading = true;
                loadingOfflineAllTunnels.value = true;
                try {
                    const response = await api.v2.user.offlineUserNodes();

                    const { totalNodes, successCount, failCount, results } = response.data;
                    let messageText = `下线完成！总计: ${totalNodes} 个节点，成功: ${successCount} 个，失败: ${failCount} 个`;

                    if (Object.keys(results).length > 0) {
                        const resultDetails = Object.entries(results)
                            .map(([node, status]) => `${node}: ${status}`)
                            .join('\n');
                        messageText += `\n\n详细结果:\n${resultDetails}`;
                    }

                    dialog.success({
                        title: '下线完成',
                        content: messageText,
                        positiveText: '好的',
                    });
                } catch (error) {
                    console.error('下线所有隧道失败:', error);
                    message.error('下线所有隧道失败: ' + (error as Error).message);
                } finally {
                    loadingOfflineAllTunnels.value = false;
                }
            },
        });
    };

    return {
        loadingOfflineAllTunnels,
        resetToken,
        offlineAllTunnels,
    };
}

/**
 * 创建设置卡片数据
 */
export function createSettingsCards(
    handlers: {
        resetToken: () => void;
        openChangeUsername: () => void;
        openModifyAvatar: () => void;
        openChangePassword: () => void;
        openChangeEmail: () => void;
        openChangeQQ: () => void;
        offlineAllTunnels: () => void;
        showDeleteAccountTips: () => void;
    },
    loadingOfflineAllTunnels: boolean
) {
    return [
        {
            title: '重置token',
            subtitle: '重置后所有客户端均需重新登录',
            icon: markRaw(KeyOutline),
            click: handlers.resetToken,
        },
        {
            title: '修改用户名',
            subtitle: '点击这里可以修改您的用户名',
            icon: markRaw(PersonOutline),
            click: handlers.openChangeUsername,
        },
        {
            title: '更改头像',
            subtitle: '不支持上传图片文件，请填写图片链接',
            icon: markRaw(ImageOutline),
            click: handlers.openModifyAvatar,
        },
        {
            title: '修改密码',
            subtitle: '点击这里可以修改您的登录密码',
            icon: markRaw(LockClosedOutline),
            click: handlers.openChangePassword,
        },
        {
            title: '更改邮箱',
            subtitle: '此操作风险较大，请谨慎操作',
            icon: markRaw(MailOutline),
            click: handlers.openChangeEmail,
        },
        {
            title: '更改QQ号',
            subtitle: '不正确的QQ号可能会影响到后续功能',
            icon: markRaw(ChatboxEllipsesOutline),
            click: handlers.openChangeQQ,
        },
        {
            title: '下线所有隧道',
            subtitle: '一键下线所有运行中的隧道',
            icon: markRaw(CodeDownloadOutline),
            click: handlers.offlineAllTunnels,
        },
        {
            title: '注销账户',
            subtitle: '注销ChmlFrp账户，删除账户所有信息',
            icon: markRaw(TrashBinOutline),
            click: handlers.showDeleteAccountTips,
        },
    ];
}
