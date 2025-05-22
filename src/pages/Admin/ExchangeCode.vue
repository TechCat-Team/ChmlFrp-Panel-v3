<template>
    <n-back-top :right="100" />
    <n-space vertical>
        <!-- 生成兑换码表单 -->
        <n-card title="生成兑换码" size="small">
            <n-form ref="formRef" :model="generateForm" :rules="rules" label-placement="left" label-width="auto"
                require-mark-placement="right-hanging">
                <n-grid :cols="24" :x-gap="24">
                    <n-form-item-gi :span="8" label="会员类型" path="type">
                        <n-select v-model:value="generateForm.type" :options="memberTypeOptions"
                            placeholder="请选择会员类型" />
                    </n-form-item-gi>
                    <n-form-item-gi :span="8" label="有效期" path="duration">
                        <n-select v-model:value="generateForm.duration" :options="durationOptions"
                            placeholder="请选择有效期" />
                    </n-form-item-gi>
                    <n-form-item-gi :span="8" label="生成数量" path="count">
                        <n-input-number v-model:value="generateForm.count" :min="1" :max="100" placeholder="请输入生成数量" />
                    </n-form-item-gi>
                </n-grid>
                <n-space justify="end" style="margin-top: 16px">
                    <n-button type="primary" @click="handleGenerate"> 生成 </n-button>
                    <n-button @click="resetForm"> 重置 </n-button>
                </n-space>
            </n-form>
        </n-card>

        <!-- 兑换码列表 -->
        <n-card title="兑换码列表" size="small">
            <n-space vertical>
                <n-space justify="space-between">
                    <n-space>
                        <n-input v-model:value="searchValue" placeholder="搜索兑换码" clearable @clear="handleSearchClear"
                            @keydown.enter="handleSearch" />
                        <n-button type="primary" @click="handleSearch"> 搜索 </n-button>
                    </n-space>
                </n-space>

                <n-data-table :columns="columns" :data="filteredCodes" :pagination="pagination" :loading="loading"
                    :bordered="false" striped />
            </n-space>
        </n-card>
    </n-space>
</template>

<script lang="ts" setup>
import { DataTableColumns, FormRules, NButton, NSpace, PaginationProps, SelectOption } from 'naive-ui'
import { ref, computed, onMounted } from 'vue'

interface RedeemCode {
    id: string
    code: string
    type: string
    duration: string
    status: '未使用' | '已使用'
    userid: number | null
}

// 表单数据
const generateForm = ref({
    type: '' as string | null,
    duration: null as number | null,
    count: 1,
    prefix: ''
})

const searchValue = ref('')
const loading = ref(false)
const message = useMessage()

// 分页配置
const pagination = ref<PaginationProps>({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
        pagination.value.page = page
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.value.pageSize = pageSize
        pagination.value.page = 1
    }
})

// 会员类型选项
const memberTypeOptions: SelectOption[] = [
    {
        label: '普通会员',
        value: 'normal',
        color: '#2080f0'
    },
    {
        label: '高级会员',
        value: 'premium',
        color: '#18a058'
    },
    {
        label: '超级会员',
        value: 'super',
        color: '#f0a020'
    }
]

// 有效期选项
const durationOptions: SelectOption[] = [
    ...Array.from({ length: 12 }, (_, i) => ({
        label: `${i + 1}个月`,
        value: i + 1
    })),
    {
        label: '永久',
        value: 0
    }
]

// 表单验证规则
const rules: FormRules = {
    type: {
        required: true,
        message: '请选择会员类型',
        trigger: 'blur'
    },
    duration: {
        required: true,
        validator(rule, value) {
            void rule;
            
            if (value === null || value === undefined) {
                return new Error('请选择有效期')
            }
            return true
        },
        trigger: 'blur'
    },
    count: {
        required: true,
        validator(rule, value) {
            void rule;
            
            if (value < 1 || value > 100) {
                return new Error('数量范围1-100')
            }
            return true
        },
        trigger: 'blur'
    }
}

// 兑换码数据
const redeemCodes = ref<RedeemCode[]>([])

// 表格列定义
const columns: DataTableColumns<RedeemCode> = [
    {
        title: '兑换码',
        key: 'code',
        render(row) {
            return row.code
        }
    },
    {
        title: '会员类型',
        key: 'type',
        render(row) {
            const typeMap: Record<string, { text: string; color: string }> = {
                normal: { text: '普通会员', color: '#2080f0' },
                premium: { text: '高级会员', color: '#18a058' },
                super: { text: '超级会员', color: '#f0a020' }
            }
            const typeInfo = typeMap[row.type] || { text: row.type, color: '#000' }
            return h(
                'span',
                { style: { color: typeInfo.color, fontWeight: 'bold' } },
                typeInfo.text
            )
        }
    },
    {
        title: '有效期',
        key: 'duration',
        render(row) {
            return row.duration === '0' ? '永久' : `${row.duration}个月`
        }
    },
    {
        title: '状态',
        key: 'status',
        render(row) {
            const statusMap: Record<string, { text: string; color: string }> = {
                未使用: { text: '未使用', color: '#18a058' },
                已使用: { text: '已使用', color: '#f0a020' },
                已过期: { text: '已过期', color: '#d03050' }
            }
            const statusInfo = statusMap[row.status] || { text: row.status, color: '#000' }
            return h(
                'n-tag',
                { type: row.status === '未使用' ? 'success' : row.status === '已使用' ? 'warning' : 'error' },
                { default: () => statusInfo.text }
            )
        }
    },
    {
        title: '谁用了',
        key: 'userid'
    },
    {
        title: '操作',
        key: 'actions',
        render(row) {
            return h(
                NSpace,
                {},
                {
                    default: () => [
                        h(
                            NButton,
                            {
                                size: 'small',
                                onClick: () => copyCode(row.code)
                            },
                            { default: () => '复制' }
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'error',
                                onClick: () => deleteCode(row.id)
                            },
                            { default: () => '删除' }
                        )
                    ]
                }
            )
        }
    }
]

// 生成兑换码
const handleGenerate = () => {
    if (!generateForm.value.type || generateForm.value.duration === null) {
        message.error('请填写完整信息')
        return
    }
    message.success(`成功生成 个兑换码`)
    resetForm()
}

// 重置表单
const resetForm = () => {
    generateForm.value = {
        type: null,
        duration: null,
        count: 1,
        prefix: ''
    }
}

// 复制兑换码
const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    message.success('已复制到剪贴板')
}

// 删除兑换码
const deleteCode = (id: string) => {
    redeemCodes.value = redeemCodes.value.filter(code => code.id !== id)
    message.success('删除成功')
}

// 搜索兑换码
const handleSearch = () => {
    pagination.value.page = 1
}

const handleSearchClear = () => {
    searchValue.value = ''
    handleSearch()
}

// 过滤后的兑换码
const filteredCodes = computed(() => {
    return redeemCodes.value.filter(code => {
        return code.code.toLowerCase().includes(searchValue.value.toLowerCase())
    })
})

// 初始化一些示例数据
onMounted(() => {
    loading.value = true
    // 模拟异步加载
    setTimeout(() => {
        redeemCodes.value = [
            {
                id: '1',
                code: 'ABCD1234EFGH',
                type: 'normal',
                duration: '1',
                status: '未使用',
                userid: 1,
            },
            {
                id: '2',
                code: 'EFGH5678IJKL',
                type: 'premium',
                duration: '3',
                status: '已使用',
                userid: null,
            },
            {
                id: '3',
                code: 'IJKL9012MNOP',
                type: 'super',
                duration: '12',
                status: '未使用',
                userid: 1,
            }
        ]
        loading.value = false
    }, 800)
})
</script>

<style scoped>
.card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.n-card {
    margin-bottom: 20px;
}

.n-button {
    margin-right: 8px;
}
</style>