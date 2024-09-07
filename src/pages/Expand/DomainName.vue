<template>
    <n-back-top :right="100" />
    <n-card style="margin-bottom: 20px;" title="域名列表">
        <template #header-extra>
            <n-button round quaternary @click="fetchDomainData" :loading="loading">
                <template #icon>
                    <n-icon :component="RefreshOutline" />
                </template>
                刷新
            </n-button>
            <n-button @click="createDomainName" :loading="createDomainNameLoading" type="primary" round quaternary>
                <template #icon>
                    <n-icon :component="AddOutline" />
                </template>
                新增域名
            </n-button>
        </template>
    </n-card>
    <n-grid v-if="loading" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="190.6px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="domain in domainData" :key="domain.id">
            <n-card size="small" :title="domain.record + '.' + domain.domain">
                <template #header-extra>
                    <n-tooltip v-if="domain.type === 'SRV' && (domain.record.includes('_minecraft._tcp'))"
                        trigger="hover">
                        <template #trigger>
                            <n-tag round :bordered="false" type="primary">
                                {{ domain.type }}
                            </n-tag>
                        </template>
                        此域名通过SRV解析隐藏了MCJava版服务器端口，可直接通过{{ domain.record + '.' + domain.domain }}连接
                    </n-tooltip>
                    <n-tag v-else round :bordered="false" type="primary">
                        {{ domain.type }}
                    </n-tag>
                </template>
                <n-tag round :bordered="false" type="primary" size="small">
                    {{ domain.remarks || '自定义地址' }}
                </n-tag>
                <template #footer>
                    名称：{{ domain.record }}
                    <br />
                    域名：{{ domain.domain }}
                    <br />
                    内容：{{ domain.target }}
                    <br />
                    TTL：{{ domain.ttl }}
                </template>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-card v-if="!loading && domainData.length === 0">
        <n-empty description="您似乎还没创建免费域名">
            <template #extra>
                <n-button size="small" :loading="createDomainNameLoading" @click="createDomainName"
                    :disabled="createDomainNameLoading">
                    <template #icon>
                        <n-icon v-if="!createDomainNameLoading" :component="AddOutline" />
                    </template>
                    创建免费域名
                </n-button>
            </template>
        </n-empty>
    </n-card>
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
import axios from 'axios';
// 获取登录信息
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const message = useMessage()
const dialog = useDialog()

const determineLoading = ref(false)
const createDomainNameModal = ref(false)
const createDomainNameLoading = ref(false)
const loading = ref(false)

const size = ref('medium')

// 无限滚动
const count = ref(16)
const handleLoad = () => {
    count.value += 1
}

interface freeDomain {
    id: number;
    userid: number;
    domain: string;
    record: string;
    type: string;
    target: string;
    remarks?: string;
    ttl: string;
}

const domainData = ref<freeDomain[]>([])

const fetchDomainData = async () => {
    loading.value = true
    try {
        const response = await axios.get(`https://cf-v2.uapis.cn/get_user_free_subdomains?token=${userInfo?.usertoken}`)
        if (response.data.code === 200) {
            domainData.value = response.data.data
        } else {
            console.error('获取创建的免费域名数据失败:', response.data.msg)
        }
    } catch (error) {
        console.error('获取创建的免费域名API请求失败:', error)
    } finally {
        loading.value = false
    }
}

// 在组件挂载时调用API
onMounted(() => {
    fetchDomainData()
})

const createDomainName = async () => {
    createDomainNameLoading.value = true
    await subDomainData();
    createDomainNameModal.value = true
    createDomainNameLoading.value = false
}

const model = ref({
    selectedDomain: null,
    selectedRecordType: 'A',
    recordValue: null,
    weight: null,
    priority: null,
    port: null,
    TTLValue: '1小时',
})

const fastModel = ref({
    selectedDomain: null,
    selectedRecordType: 'CNAME',
    selectedTunnel: null,
    recordValue: null,
})

interface Domain {
    id: number
    domain: string
    remarks: string | null
    icpFiling: boolean
}

// 用于存储域名选项的数据
const domainNameOptions = ref([])

// 从 API 获取域名数据并将其格式化为 n-select 的选项格式
const subDomainData = async () => {
    try {
        const response = await axios.get('https://cf-v2.uapis.cn/list_available_domains')
        const domains = response.data.data

        domainNameOptions.value = domains.map((domain: Domain) => ({
            label: domain.domain, // 显示的域名名称
            value: domain.domain  // 选项的值
        }))
    } catch (error) {
        console.error('获取域名数据失败:', error)
    }
}

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