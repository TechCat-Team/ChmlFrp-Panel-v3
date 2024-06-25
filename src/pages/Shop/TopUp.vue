<template>
    <n-back-top :right="100" />
    <n-card>
        <n-h3 prefix="bar">
            <n-text type="primary">
                预设金额
            </n-text>
        </n-h3>
        <n-grid cols="2 s:3 m:4 l:5 xl:6 2xl:7" :x-gap="12" :y-gap="12" responsive="screen">
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-flex justify="space-between">
                        8000积分
                        <n-flex justify="end">
                            8￥
                        </n-flex>
                    </n-flex>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-flex justify="space-between">
                        12000积分
                        <n-flex justify="end">
                            12￥
                        </n-flex>
                    </n-flex>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-flex justify="space-between">
                        18000积分
                        <n-flex justify="end">
                            18￥
                        </n-flex>
                    </n-flex>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-flex justify="space-between">
                        96000积分
                        <n-flex justify="end">
                            80￥
                        </n-flex>
                    </n-flex>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-flex justify="space-between">
                        144000积分
                        <n-flex justify="end">
                            120￥
                        </n-flex>
                    </n-flex>
                </n-card>
            </n-grid-item>
        </n-grid>
        <n-h3 prefix="bar">
            <n-text type="primary">
                自定义金额
            </n-text>
        </n-h3>
        <n-input v-model:value="value" round clearable type="text" :allow-input="onlyAllowNumber" placeholder="只能输入整数">
            <template #prefix>
                ￥
            </template>
        </n-input>
        <n-h3 prefix="bar">
            <n-text type="primary">
                支付方式
            </n-text>
        </n-h3>
        <n-grid cols="2 s:3 l:4 xl:5 2xl:6" :x-gap="12" :y-gap="12" responsive="screen">
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-space>
                        <n-icon size="40" color="#07C160">
                            <LogoWechat />
                        </n-icon>
                        <span style="font-size: 24px;">微信支付</span>
                    </n-space>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-space>
                        <n-icon size="40" color="#1677FF">
                            <LogoAlipay />
                        </n-icon>
                        <span style="font-size: 24px;">支付宝</span>
                    </n-space>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-space>
                        <n-icon size="40" color="#003087">
                            <LogoPaypal />
                        </n-icon>
                        <span style="font-size: 24px;">PayPal</span>
                    </n-space>
                </n-card>
            </n-grid-item>
            <n-grid-item>
                <n-card size="small" hoverable>
                    <n-space>
                        <n-icon size="40" color="#000000">
                            <LogoApple />
                        </n-icon>
                        <span style="font-size: 24px;">Apple Pay</span>
                    </n-space>
                </n-card>
            </n-grid-item>
        </n-grid>
    </n-card>
</template>

<script lang="ts" setup>
import { LogoAlipay, LogoWechat, LogoPaypal, LogoApple } from '@vicons/ionicons5'
const value = ref(1)
const onlyAllowNumber = (value: string) => !value || /^\d+$/.test(value)

</script>

<style lang="scss">
.n-flex {
    font-size: 16px;
}
</style>