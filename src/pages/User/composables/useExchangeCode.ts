import { ref, h } from 'vue';
import { FormInst, NText, NSpace, NTag } from 'naive-ui';
import { useDialog, useMessage } from 'naive-ui';
import { redeemGiftcard } from '@/api/v2/giftcard/giftcard';
import type { RedeemGiftcardResponse } from '@/api/v2/giftcard/giftcard';

interface ExchangeCodeModel {
    exchangeCode: string | null;
}

/**
 * 兑换码 composable
 */
export function useExchangeCode(userInfo: { id?: number; usertoken?: string }) {
    const dialog = useDialog();
    const message = useMessage();
    const loading = ref(false);
    const formRef = ref<FormInst | null>(null);
    const model = ref<ExchangeCodeModel>({
        exchangeCode: null,
    });

    const submit = async () => {
        if (!userInfo?.usertoken) {
            message.error('用户令牌无效，请重新登录');
            return;
        }

        if (!model.value.exchangeCode) {
            message.error('请输入礼品卡码');
            return;
        }

        loading.value = true;
        try {
            const response: RedeemGiftcardResponse = await redeemGiftcard({
                usertoken: userInfo.usertoken,
                giftcode: model.value.exchangeCode,
            });

            // 检查响应状态
            if (response.code === 200 && response.state === 'success' && response.data) {
                const data = response.data;
                // 根据不同的奖励类型显示不同的内容
                if (data.rewardType === '会员') {
                    dialog.success({
                        title: '兑换成功',
                        content: () =>
                            h(NSpace, { vertical: true, size: 'small' }, () => [
                                h(NText, null, () => response.msg),
                                h('div', { style: 'margin-top: 12px' }, [
                                    h(NText, { strong: true }, () => '礼品卡名称：'),
                                    h(NText, null, () => data.cardName),
                                ]),
                                h('div', [
                                    h(NText, { strong: true }, () => '会员类型：'),
                                    h(NTag, { type: 'success', size: 'small' }, () => data.memberType),
                                ]),
                                h('div', [
                                    h(NText, { strong: true }, () => '有效期：'),
                                    h(NText, null, () => `${data.memberDays} 天`),
                                ]),
                                h('div', [
                                    h(NText, { strong: true }, () => '到期时间：'),
                                    h(NText, { type: 'info' }, () => data.newTerm),
                                ]),
                            ]),
                        positiveText: '好的',
                        onPositiveClick: () => {
                            // 刷新页面以更新用户信息
                            window.location.reload();
                        },
                    });
                } else if (data.rewardType === '积分') {
                    dialog.success({
                        title: '兑换成功',
                        content: () =>
                            h(NSpace, { vertical: true, size: 'small' }, () => [
                                h(NText, null, () => response.msg),
                                h('div', { style: 'margin-top: 12px' }, [
                                    h(NText, { strong: true }, () => '礼品卡名称：'),
                                    h(NText, null, () => data.cardName),
                                ]),
                                h('div', [
                                    h(NText, { strong: true }, () => '获得积分：'),
                                    h(NTag, { type: 'success', size: 'small' }, () => `+${data.points}`),
                                ]),
                                h('div', [
                                    h(NText, { strong: true }, () => '当前总积分：'),
                                    h(NText, { type: 'info' }, () => data.newIntegral.toString()),
                                ]),
                            ]),
                        positiveText: '好的',
                        onPositiveClick: () => {
                            // 刷新页面以更新用户信息
                            window.location.reload();
                        },
                    });
                }
                // 清空输入框
                model.value.exchangeCode = null;
            } else {
                // 处理失败情况
                if (response.rate_limit_info) {
                    // 显示频率限制信息
                    const info = response.rate_limit_info;
                    dialog.error({
                        title: '兑换失败',
                        content: () =>
                            h(NSpace, { vertical: true, size: 'small' }, () => [
                                h(NText, { type: 'error' }, () => response.msg),
                                h(
                                    'div',
                                    {
                                        style: 'margin-top: 12px; padding: 12px; background-color: var(--n-color-target); border-radius: 4px',
                                    },
                                    [
                                        h('div', { style: 'margin-bottom: 8px' }, [
                                            h(NText, { strong: true }, () => '状态：'),
                                            h(NTag, { type: 'error', size: 'small' }, () => info.status),
                                        ]),
                                        h('div', { style: 'margin-bottom: 8px' }, [
                                            h(NText, null, () => `最近尝试次数：${info.recent_attempts} 次`),
                                        ]),
                                        h('div', { style: 'margin-bottom: 8px' }, [
                                            h(NText, null, () => `总尝试次数：${info.total_attempts} 次`),
                                        ]),
                                        h('div', { style: 'margin-bottom: 8px' }, [
                                            h(NText, null, () => `连续失败次数：${info.consecutive_failures} 次`),
                                        ]),
                                        info.remaining_ban_minutes !== undefined &&
                                            h('div', { style: 'margin-bottom: 8px' }, [
                                                h(
                                                    NText,
                                                    { type: 'warning' },
                                                    () => `剩余封禁时间：${info.remaining_ban_minutes} 分钟`
                                                ),
                                            ]),
                                        info.ban_end_time &&
                                            h('div', { style: 'margin-bottom: 8px' }, [
                                                h(NText, null, () => `封禁结束时间：${info.ban_end_time}`),
                                            ]),
                                        h(
                                            'div',
                                            {
                                                style: 'margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--n-border-color)',
                                            },
                                            [h(NText, { type: 'info', italic: true }, () => info.tips)]
                                        ),
                                    ]
                                ),
                            ]),
                        positiveText: '知道了',
                    });
                } else {
                    message.error(response.msg || '兑换失败');
                }
            }
        } catch (error) {
            console.error('礼品卡兑换API调用失败', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error('礼品卡兑换失败: ' + errorMessage);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        formRef,
        model,
        submit,
    };
}
