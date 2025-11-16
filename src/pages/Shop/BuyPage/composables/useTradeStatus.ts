import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage, useDialog } from 'naive-ui';
import { useLoadUserInfo } from '@/components/useLoadUser';

/**
 * 支付回调状态检查 composable
 */
export function useTradeStatus() {
    const route = useRoute();
    const router = useRouter();
    const dialog = useDialog();
    const message = useMessage();

    const checkTradeStatus = () => {
        if (route.query.trade_status === 'TRADE_SUCCESS') {
            dialog.success({
                title: '会员购买成功！',
                content: `您已成功购买会员，ChmlFrp感谢您的支持！。`,
                positiveText: '确定',
                onPositiveClick: () => {
                    router.replace({ path: route.path, query: {} });
                    useLoadUserInfo();
                },
                maskClosable: false,
                onMaskClick: () => {
                    message.warning('请点击确定关闭此弹窗');
                },
                onEsc: () => {
                    router.replace({ path: route.path, query: {} });
                    useLoadUserInfo();
                },
            });
        }
    };

    onMounted(() => {
        checkTradeStatus();
    });
}

