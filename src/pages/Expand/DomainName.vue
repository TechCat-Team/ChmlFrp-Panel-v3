<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px;" title="域名列表">
        <template #header-extra>
            <n-button round quaternary>
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="createDomainNameModal = true" type="primary" round quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                新增域名
            </n-button>
        </template>
    </n-card>
    <n-grid cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item>
            <n-card size="small" title="mc.frp.wtf">
                <template #header-extra>
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-tag round :bordered="false" type="primary">
                                SRV
                            </n-tag>
                        </template>
                        此域名通过SRV解析隐藏了MCjava服务器端口，可直接通过mc.frp.wtf连接
                    </n-tooltip>
                </template>
                <n-tag round :bordered="false" type="primary" size="small">
                    解析隧道：ChmlFrp-Tunnel
                </n-tag>
                <template #footer>
                    名称：_minecraft._tcp.mc
                    <br />
                    域名：frp.wtf
                    <br />
                    内容：5 0 25598 bj.frp.one
                    <br />
                    TTL：1分钟
                </template>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card size="small" title="chaoji.frp.wtf">
                <template #header-extra>
                    <n-tag round :bordered="false" type="primary">
                        CNAME
                    </n-tag>
                </template>
                <n-tag round :bordered="false" type="primary" size="small">
                    自定义地址
                </n-tag>
                <template #footer>
                    名称：chaoji
                    <br />
                    域名：frp.wtf
                    <br />
                    内容：bj.frp.one
                    <br />
                    TTL：1分钟
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-modal v-model:show="createDomainNameModal">
        <n-card style="width: 600px" size="small" :bordered="false" role="dialog" aria-modal="true">
            <n-tabs type="line" size="large">
                <n-tab-pane name="自定义解析">
                    <n-form style="margin-top: 10px;" :model="model" ref="formRef" label-placement="left"
                        label-width="auto" require-mark-placement="right-hanging" :size="size">
                        <n-grid :key="model.selectedRecordType" cols="1 s:2" x-gap="12" responsive="screen">
                            <n-grid-item>
                                <n-form-item label="域名" path="selectValue">
                                    <n-select placeholder="请选择域名" :options="domainNameOptions"
                                        v-model:value="model.selectedDomain" />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="类型">
                                    <n-select placeholder="请选择记录类型" :options="recordTypeOptions"
                                        v-model:value="model.selectedRecordType" />
                                </n-form-item>
                            </n-grid-item>
                            <template v-if="model.selectedRecordType === 'SRV'">
                                <n-grid-item>
                                    <n-form-item label="权重">
                                        <n-input v-model:value="model.weight" placeholder="请输入权重" />
                                    </n-form-item>
                                </n-grid-item>
                                <n-grid-item>
                                    <n-form-item label="优先级">
                                        <n-input v-model:value="model.priority" placeholder="请输入优先级" />
                                    </n-form-item>
                                </n-grid-item>
                                <n-grid-item>
                                    <n-form-item label="端口">
                                        <n-input v-model:value="model.port" placeholder="请输入端口" />
                                    </n-form-item>
                                </n-grid-item>
                            </template>
                            <n-grid-item>
                                <n-form-item label="记录">
                                    <n-input v-model:value="model.recordValue">
                                        <template #suffix>
                                            .{{ model.selectedDomain }}
                                        </template>
                                    </n-input>
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="TTL">
                                    <n-select placeholder="请选择TTL" v-model:value="model.TTLValue"
                                        :options="TTLOptions" />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item :span="2">
                                <n-form-item label="目标">
                                    <n-input :placeholder="targetPlaceholder" />
                                </n-form-item>
                            </n-grid-item>
                        </n-grid>
                        <div style="display: flex; justify-content: flex-end">
                            <n-button round type="primary" :loading="determineLoading" @click="determineClick">
                                确定
                            </n-button>
                        </div>
                    </n-form>
                </n-tab-pane>
                <n-tab-pane name="快速解析">
                    <n-form style="margin-top: 10px;" :model="fastModel" ref="formRef" label-placement="left"
                        label-width="auto" require-mark-placement="right-hanging" :size="size">
                        <n-grid :key="model.selectedRecordType" cols="1 s:2" x-gap="12" responsive="screen">
                            <n-grid-item>
                                <n-form-item label="域名" path="selectValue">
                                    <n-select placeholder="请选择域名" :options="domainNameOptions"
                                        v-model:value="fastModel.selectedDomain" />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="类型">
                                    <n-select placeholder="请选择记录类型" :options="fastRecordTypeOptions"
                                        v-model:value="fastModel.selectedRecordType" />
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="记录">
                                    <n-input v-model:value="fastModel.recordValue">
                                        <template #suffix>
                                            .{{ fastModel.selectedDomain }}
                                        </template>
                                    </n-input>
                                </n-form-item>
                            </n-grid-item>
                            <n-grid-item>
                                <n-form-item label="隧道">
                                    <n-select placeholder="请选择隧道" :options="tunnelOptions"
                                        v-model:value="fastModel.selectedTunnel" />
                                </n-form-item>
                            </n-grid-item>
                        </n-grid>
                        <div style="display: flex; justify-content: flex-end">
                            <n-button round type="primary" :loading="determineLoading" @click="determineClick">
                                确定
                            </n-button>
                        </div>
                    </n-form>
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { RefreshOutline, AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const dialog = useDialog()

const determineLoading = ref(false)
const createDomainNameModal = ref(false)

const size = ref('medium')

const model = ref({
    selectedDomain: null,
    selectedRecordType: 'A',
    recordValue: null,
    weight: null,
    priority: null,
    port: null,
    TTLValue: '1分钟',
})

const fastModel = ref({
    selectedDomain: null,
    selectedRecordType: 'CNAME',
    selectedTunnel: null,
    recordValue: null,
})

const domainNameOptions = ['frp.wtf'].map((v) => ({
    label: v,
    value: v
}))

const recordTypeOptions = ['A', 'AAAA', 'CNAME', 'SRV'].map((v) => ({
    label: v,
    value: v
}))

const fastRecordTypeOptions = ['CNAME', '网站', 'Java版MC'].map((v) => ({
    label: v,
    value: v
}))

const TTLOptions = [
    '1分钟',
    '2分钟',
    '5分钟',
    '10分钟',
    '15分钟',
    '30分钟',
    '1小时',
    '2小时',
    '5小时',
    '12小时',
    '1天'
].map((v) => ({
    label: v,
    value: v
}))

const tunnelOptions = [
    'ChmlFrp-Tunnel-1',
    'ChmlFrp-Tunnel-2',
].map((v) => ({
    label: v,
    value: v
}))

const targetPlaceholder = computed(() => {
    switch (model.value.selectedRecordType) {
        case 'A':
            return '请输入IPv4地址'
        case 'AAAA':
            return '请输入IPv6地址'
        case 'CNAME':
            return '请输入域名'
        case 'SRV':
            return '请输入服务目标'
        default:
            return '这这，这不对吧，有这个选项吗？'
    }
})

const determineClick = () => {
    determineLoading.value = true
    setTimeout(() => {
        determineLoading.value = false
        createDomainNameModal.value = false
        dialog.success({
            title: '成功',
            content: '域名解析创建成功，但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效',
            positiveText: '我知道了',
            onPositiveClick: () => {
                message.success('免费域名创建成功')
            }
        })
    }, 2000)
}
</script>