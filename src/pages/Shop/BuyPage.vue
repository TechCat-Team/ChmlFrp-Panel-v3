<template>
    <n-back-top :right="100" />
    <n-card size="small">
        <n-alert title="购买须知" type="warning">
            确认购买后，本站不支持退款。多次购买同一套餐则增加对应会员时长。
            此页面尚未完善，如需购买请前往v2面板，链接：https://panel.chmlfrp.cn
        </n-alert>
    </n-card>
    <n-grid style="margin-top: 12px" :x-gap="12" :y-gap="12" cols="1 s:2 m:3 l:4" responsive="screen">
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    免费用户
                </template>
                <n-ul>
                    <n-li>节点权限：普通节点</n-li>
                    <n-li>国内节点速率限制：8m</n-li>
                    <n-li>国外节点速率限制：32m</n-li>
                    <n-li>隧道数量：4条</n-li>
                    <n-li>二级域名数量：2条</n-li>
                    <n-li>免费SSL数量：1条</n-li>
                    <n-li>官方技术支持：不支持</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>0积分/月</n-p>
                        <n-button round disabled type="error" size="small">注册即得</n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    普通会员
                </template>
                <n-ul>
                    <n-li>节点权限：普通/会员节点</n-li>
                    <n-li>国内节点速率限制：16m</n-li>
                    <n-li>国外节点速率限制：64m</n-li>
                    <n-li>隧道数量：8条</n-li>
                    <n-li>二级域名数量：4条</n-li>
                    <n-li>免费SSL数量：2条</n-li>
                    <n-li>官方技术支持：不支持</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>8000积分/月</n-p>
                        <n-button @click="show = true" round type="primary" size="small">立即购买</n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    高级会员
                </template>
                <n-ul>
                    <n-li>节点权限：普通/会员节点</n-li>
                    <n-li>国内节点速率限制：24m</n-li>
                    <n-li>国外节点速率限制：96m</n-li>
                    <n-li>隧道数量：12条</n-li>
                    <n-li>二级域名数量：8条</n-li>
                    <n-li>免费SSL数量：4条</n-li>
                    <n-li>官方技术支持：支持</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>16000积分/月</n-p>
                        <n-button @click="show = true" round type="primary" size="small">立即购买</n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    超级会员
                </template>
                <n-ul>
                    <n-li>节点权限：普通/会员节点</n-li>
                    <n-li>国内节点速率限制：32m</n-li>
                    <n-li>国外节点速率限制：128m</n-li>
                    <n-li>隧道数量：16条</n-li>
                    <n-li>二级域名数量：16条</n-li>
                    <n-li>免费SSL数量：12条</n-li>
                    <n-li>官方技术支持：支持</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>24000积分/月</n-p>
                        <n-button @click="show = true" round type="primary" size="small">立即购买</n-button>
                    </n-flex>
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-drawer v-model:show="show" :width="502" style="max-width: 100%">
        <n-drawer-content title="购买" closable>
            <n-tabs type="segment" animated>
                <n-tab-pane name="1" tab="会员购买">
                    <!-- <n-radio-group v-model:value="value" name="radiogroup">
                        <n-space>
                            <n-radio v-for="song in songs" :key="song.value" :value="song.value">
                                {{ song.label }}
                            </n-radio>
                        </n-space>
                    </n-radio-group> -->
                    此页面尚未完善，如需购买请前往v2面板，链接：https://panel.chmlfrp.cn
                </n-tab-pane>
                <n-tab-pane name="2" tab="会员升级">
                    此页面尚未完善，如需购买请前往v2面板，链接：https://panel.chmlfrp.cn
                </n-tab-pane>
                <n-tab-pane name="3" tab="兑换码购买">
                    此页面尚未完善，如需购买请前往v2面板，链接：https://panel.chmlfrp.cn
                </n-tab-pane>
            </n-tabs>
        </n-drawer-content>
    </n-drawer>
</template>

<script lang="ts" setup>
const show = ref(false)
const value = ref(null)
const songs = ref([
    {
        value: '普通会员',
        label: '普通会员'
    },
    {
        value: '高级会员',
        label: '高级会员'
    },
    {
        value: '超级会员',
        label: '超级会员'
    }
].map((s) => {
    s.value = s.value.toLowerCase()
    return s
}))
</script>
