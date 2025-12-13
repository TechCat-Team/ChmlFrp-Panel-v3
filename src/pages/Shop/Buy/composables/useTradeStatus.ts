import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDialog, useMessage } from 'naive-ui';
import { useLoadUserInfo } from '@/components/useLoadUser';
import api from '@/api/v2';

/**
 * 订单状态查询 composable
 * 用于页面加载时检查URL中的订单号并查询订单状态
 */
export function useTradeStatus() {
    const route = useRoute();
    const router = useRouter();
    const dialog = useDialog();
    const message = useMessage();

    /**
     * 检查并查询订单状态
     */
    const checkTradeStatus = async () => {
        // 从URL参数中获取订单号
        const outTradeNo = route.query.outTradeNo as string;
        
        if (!outTradeNo) {
            return;
        }

        try {
            // 查询订单状态
            const response = await api.payment.queryPayment({ outTradeNo });

            if (!response.success) {
                message.error(response.message || '查询订单状态失败');
                clearQueryParams();
                return;
            }

            // 根据订单状态显示不同的提示
            switch (response.tradeStatus) {
                case 'success':
                    showSuccessDialog(response);
                    break;
                case 'pending':
                    message.warning('订单尚未支付，请完成支付');
                    clearQueryParams();
                    break;
                case 'closed':
                    message.error('订单已关闭（超时未支付）');
                    clearQueryParams();
                    break;
                case 'refund':
                    message.info('订单已退款');
                    clearQueryParams();
                    break;
                default:
                    message.warning('未知的订单状态');
                    clearQueryParams();
                    break;
            }
        } catch (error: any) {
            console.error('查询订单状态失败:', error);
            message.error(error.message || '查询订单状态异常，请稍后再试');
            clearQueryParams();
        }
    };

    /**
     * 显示支付成功对话框
     */
    const showSuccessDialog = (orderInfo: any) => {
        const { name, money, payTime } = orderInfo;
        
        let content = '';
        if (name === '永久会员购买' || name === '终身会员购买') {
            content = `恭喜您成功购买永久会员！支付金额：${money}元`;
        } else if (name === '积分充值') {
            const points = money * 1000; // 1元 = 1000积分
            content = `积分充值成功！充值金额：${money}元，获得积分：${points}`;
        } else {
            content = `支付成功！商品：${name}，金额：${money}元`;
        }

        if (payTime) {
            content += `\n支付时间：${payTime}`;
        }

        dialog.success({
            title: '支付成功',
            content,
            positiveText: '确定',
            onPositiveClick: () => {
                clearQueryParams();
                message.success('感谢您的支持！');
                // 刷新用户信息
                useLoadUserInfo();
            },
            maskClosable: false,
            onMaskClick: () => {
                message.warning('请点击确定关闭此弹窗');
            },
            onEsc: () => {
                clearQueryParams();
                message.success('感谢您的支持！');
                useLoadUserInfo();
            },
        });
    };

    /**
     * 清除URL中的查询参数
     */
    const clearQueryParams = () => {
        router.replace({ path: route.path, query: {} });
    };

    // 组件挂载时检查订单状态
    onMounted(() => {
        checkTradeStatus();
    });

    return {
        checkTradeStatus,
    };
}
