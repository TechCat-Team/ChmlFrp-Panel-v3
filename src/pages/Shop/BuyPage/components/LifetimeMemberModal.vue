<template>
    <n-modal :show="show" @update:show="$emit('update:show', $event)">
        <n-card style="max-width: 420px" title="终身会员购买" :bordered="false" role="dialog" aria-modal="true">
            <n-text>
                您正在请求购买 终身{{ targetGroup }}，您当前为
                <n-text v-if="isLifetime && userGroup !== '免费用户'">终身</n-text>
                {{ userGroup }}，升级到 终身{{ targetGroup }} 需要支付 {{ payAmount }} 元。
                <br />请选择支付方式。
            </n-text>
            <template #footer>
                <n-flex justify="end">
                    <n-button strong secondary size="small" @click="$emit('update:show', false)">取消</n-button>
                    <n-button
                        :loading="loading"
                        :disabled="loading"
                        type="success"
                        size="small"
                        @click="$emit('pay', 'wechat')"
                    >
                        微信
                    </n-button>
                    <n-button
                        :loading="loading"
                        :disabled="loading"
                        type="info"
                        size="small"
                        @click="$emit('pay', 'alipay')"
                    >
                        支付宝
                    </n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
interface Props {
    show: boolean;
    targetGroup: string;
    userGroup?: string;
    isLifetime?: boolean;
    payAmount: number;
    loading: boolean;
}

defineProps<Props>();
defineEmits<{
    'update:show': [value: boolean];
    pay: [type: 'wechat' | 'alipay'];
}>();
</script>

