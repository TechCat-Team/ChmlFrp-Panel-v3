<template>
    <n-back-top :right="100" />
    <div class="domain-name-management">
        <n-card title="免费域名管理" :bordered="false">
            <template #header-extra>
                <n-space>
                    <n-button type="primary" @click="handleOpenCreateModal">
                        <template #icon>
                            <n-icon><AddIcon /></n-icon>
                        </template>
                        新增主域名
                    </n-button>
                    <n-button @click="fetchDomains">
                        <template #icon>
                            <n-icon><RefreshIcon /></n-icon>
                        </template>
                        刷新
                    </n-button>
                </n-space>
            </template>

            <n-space vertical :size="16" style="margin-bottom: 16px">
                <n-input
                    v-model:value="searchQuery"
                    placeholder="搜索主域名、供应商或备注...（支持拼音搜索）"
                    clearable
                    @input="handleSearch"
                >
                    <template #prefix>
                        <n-icon :component="SearchIcon" />
                    </template>
                </n-input>
            </n-space>

            <n-watermark
                :content="`禁止截图\n${userInfoStore?.username}`"
                cross
                selectable
                :font-size="16"
                :line-height="16"
                :width="192"
                :height="128"
                :x-offset="12"
                :y-offset="28"
                :rotate="-15"
                :font-color="'rgba(128, 128, 128, 0.1)'"
            >
                <n-data-table
                    :columns="columns"
                    :data="filteredDomains"
                    :loading="loading"
                    :pagination="pagination"
                    :scroll-x="1200"
                    striped
                    :single-line="false"
                    size="medium"
                />
            </n-watermark>
        </n-card>

        <!-- 新增主域名模态框 -->
        <n-modal v-model:show="showCreateModal" preset="dialog" title="新增主域名" style="width: 640px">
            <n-form
                ref="createFormRef"
                :model="createForm"
                :rules="formRules"
                label-placement="left"
                label-width="140px"
                require-mark-placement="right-hanging"
            >
                <n-form-item label="主域名" path="domain">
                    <n-input v-model:value="createForm.domain" placeholder="例如：example.com" />
                </n-form-item>
                <n-form-item label="DNS 供应商" path="supplier">
                    <n-select v-model:value="createForm.supplier" :options="supplierOptions" />
                </n-form-item>
                <n-form-item label="Cloudflare Zone ID" path="cloudflare_zone_id">
                    <n-input v-model:value="createForm.cloudflare_zone_id" placeholder="请输入 Zone ID / 腾讯云 SecretId" />
                </n-form-item>
                <n-form-item label="Cloudflare API 密钥" path="cloudflare_api_key">
                    <n-input
                        v-model:value="createForm.cloudflare_api_key"
                        type="password"
                        show-password-on="click"
                        placeholder="请输入 API 密钥 / 腾讯云 SecretKey"
                    />
                </n-form-item>
                <n-form-item label="是否已备案" path="icp_filing">
                    <n-switch v-model:value="createForm.icp_filing" />
                </n-form-item>
                <n-form-item label="备注" path="remarks">
                    <n-input
                        v-model:value="createForm.remarks"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        placeholder="关于该域名的备注信息"
                    />
                </n-form-item>
            </n-form>
            <template #action>
                <n-space>
                    <n-button @click="showCreateModal = false">取消</n-button>
                    <n-button type="primary" :loading="createLoading" @click="handleCreate">确认创建</n-button>
                </n-space>
            </template>
        </n-modal>

        <!-- 编辑主域名模态框 -->
        <n-modal v-model:show="showEditModal" preset="dialog" title="编辑主域名" style="width: 640px">
            <n-form
                ref="editFormRef"
                :model="editForm"
                :rules="formRules"
                label-placement="left"
                label-width="140px"
                require-mark-placement="right-hanging"
            >
                <n-form-item label="主域名" path="domain">
                    <n-input v-model:value="editForm.domain" placeholder="例如：example.com" />
                </n-form-item>
                <n-form-item label="DNS 供应商" path="supplier">
                    <n-select v-model:value="editForm.supplier" :options="supplierOptions" />
                </n-form-item>
                <n-form-item label="Cloudflare Zone ID" path="cloudflare_zone_id">
                    <n-input v-model:value="editForm.cloudflare_zone_id" placeholder="请输入 Zone ID / 腾讯云 SecretId" />
                </n-form-item>
                <n-form-item label="Cloudflare API 密钥" path="cloudflare_api_key">
                    <n-input
                        v-model:value="editForm.cloudflare_api_key"
                        type="password"
                        show-password-on="click"
                        placeholder="请输入 API 密钥 / 腾讯云 SecretKey"
                    />
                </n-form-item>
                <n-form-item label="是否已备案" path="icp_filing">
                    <n-switch v-model:value="editForm.icp_filing" />
                </n-form-item>
                <n-form-item label="备注" path="remarks">
                    <n-input
                        v-model:value="editForm.remarks"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        placeholder="关于该域名的备注信息"
                    />
                </n-form-item>
            </n-form>
            <template #action>
                <n-space>
                    <n-button @click="showEditModal = false">取消</n-button>
                    <n-button type="primary" :loading="editLoading" @click="handleEdit">确认修改</n-button>
                </n-space>
            </template>
        </n-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, h } from 'vue';
import {
    NCard,
    NDataTable,
    NButton,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NSwitch,
    NSpace,
    NIcon,
    NTag,
    NWatermark,
    NBackTop,
    NEllipsis,
    NDropdown,
    useMessage,
    useDialog,
} from 'naive-ui';
import {
    Add as AddIcon,
    Refresh as RefreshIcon,
    Create,
    TrashOutline,
    Search as SearchIcon,
    EllipsisVertical,
} from '@vicons/ionicons5';
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';
import { matchPinyinSearch } from '@/utils/pinyinSearch';
import type { AvailableDomain } from '@/api/v2/admin/admin';

const userStore = useUserStore();
const userInfoStore = userStore.userInfo;
const message = useMessage();
const dialog = useDialog();

interface DomainForm {
    domain: string;
    cloudflare_zone_id: string;
    cloudflare_api_key: string;
    supplier: string;
    icp_filing: boolean;
    remarks: string;
}

const loading = ref(false);
const createLoading = ref(false);
const editLoading = ref(false);
const domains = ref<AvailableDomain[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const currentEditDomain = ref<AvailableDomain | null>(null);
const searchQuery = ref('');

const createFormRef = ref<FormInst | null>(null);
const editFormRef = ref<FormInst | null>(null);

const createForm = reactive<DomainForm>({
    domain: '',
    cloudflare_zone_id: '',
    cloudflare_api_key: '',
    supplier: 'cloudflare',
    icp_filing: false,
    remarks: '',
});

const editForm = reactive<DomainForm>({
    domain: '',
    cloudflare_zone_id: '',
    cloudflare_api_key: '',
    supplier: 'cloudflare',
    icp_filing: false,
    remarks: '',
});

const supplierOptions = [
    { label: 'Cloudflare', value: 'cloudflare' },
    { label: 'DNSPod', value: 'dnspod' },
];

const formRules: FormRules = {
    domain: [{ required: true, message: '请输入主域名', trigger: 'blur' }],
    cloudflare_zone_id: [{ required: true, message: '请输入 Cloudflare Zone ID', trigger: 'blur' }],
    cloudflare_api_key: [{ required: true, message: '请输入 Cloudflare API 密钥', trigger: 'blur' }],
};

const filteredDomains = computed(() => {
    if (!searchQuery.value.trim()) {
        return domains.value;
    }
    const query = searchQuery.value.trim();
    return domains.value.filter((item) => {
        return (
            matchPinyinSearch(item.domain, query) ||
            matchPinyinSearch(item.supplier || '', query) ||
            matchPinyinSearch(item.remarks || '', query)
        );
    });
});

const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
        pagination.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize;
        pagination.page = 1;
    },
    prefix: (info: any) => `共 ${info.itemCount} 条`,
});

const maskKey = (key: string | null) => {
    if (!key) return '-';
    if (key.length <= 8) return '********';
    return `${key.slice(0, 4)}********${key.slice(-4)}`;
};

const columns: DataTableColumns<AvailableDomain> = [
    {
        title: 'ID',
        key: 'id',
        width: 70,
        sorter: 'default',
        align: 'center',
        render(row) {
            return h('span', { style: 'font-weight: 600; color: #18a058;' }, row.id);
        },
    },
    {
        title: '主域名',
        key: 'domain',
        width: 200,
        sorter: 'default',
        render(row) {
            return h(
                'span',
                { style: 'font-family: monospace; font-weight: 500;' },
                row.domain
            );
        },
    },
    {
        title: 'DNS 供应商',
        key: 'supplier',
        width: 130,
        align: 'center',
        render(row) {
            const supplier = (row.supplier || 'cloudflare').toLowerCase();
            const isCloudflare = supplier === 'cloudflare';
            return h(
                NTag,
                {
                    type: isCloudflare ? 'primary' : 'warning',
                    size: 'small',
                    round: true,
                },
                { default: () => (isCloudflare ? 'Cloudflare' : row.supplier || '未知') }
            );
        },
    },
    {
        title: '备案状态',
        key: 'icp_filing',
        width: 110,
        align: 'center',
        render(row) {
            return h(
                NTag,
                {
                    type: row.icp_filing ? 'success' : 'default',
                    size: 'small',
                    round: true,
                    bordered: false,
                },
                { default: () => (row.icp_filing ? '已备案' : '未备案') }
            );
        },
    },
    {
        title: 'Cloudflare Zone ID',
        key: 'cloudflare_zone_id',
        width: 260,
        ellipsis: { tooltip: true },
        render(row) {
            return h(
                'span',
                { style: 'font-family: monospace; font-size: 13px; color: #666;' },
                row.cloudflare_zone_id || '-'
            );
        },
    },
    {
        title: 'Cloudflare API 密钥',
        key: 'cloudflare_api_key',
        width: 220,
        ellipsis: { tooltip: true },
        render(row) {
            return h(
                'span',
                { style: 'font-family: monospace; font-size: 13px; color: #666;' },
                maskKey(row.cloudflare_api_key)
            );
        },
    },
    {
        title: '备注',
        key: 'remarks',
        width: 200,
        render(row) {
            return h(
                NEllipsis,
                { tooltip: true },
                { default: () => row.remarks || '-' }
            );
        },
    },
    {
        title: '操作',
        key: 'actions',
        width: 80,
        align: 'center',
        fixed: 'right',
        render(row) {
            const options = [
                {
                    label: '编辑',
                    key: 'edit',
                    icon: () => h(NIcon, { component: Create }),
                    props: {
                        onClick: () => handleEditClick(row),
                    },
                },
                { type: 'divider', key: 'd1' },
                {
                    label: '删除',
                    key: 'delete',
                    icon: () => h(NIcon, { component: TrashOutline, style: 'color: #d03050;' }),
                    props: {
                        onClick: () => handleDeleteClick(row),
                        style: 'color: #d03050;',
                    },
                },
            ];

            return h(
                NDropdown,
                {
                    trigger: 'click',
                    options,
                    placement: 'bottom-end',
                    showArrow: true,
                },
                {
                    default: () =>
                        h(
                            NButton,
                            { size: 'small', quaternary: true, circle: true },
                            { icon: () => h(NIcon, { component: EllipsisVertical, size: 18 }) }
                        ),
                }
            );
        },
    },
];

const resetCreateForm = () => {
    Object.assign(createForm, {
        domain: '',
        cloudflare_zone_id: '',
        cloudflare_api_key: '',
        supplier: 'cloudflare',
        icp_filing: false,
        remarks: '',
    });
};

const handleOpenCreateModal = () => {
    resetCreateForm();
    showCreateModal.value = true;
};

const fetchDomains = async () => {
    loading.value = true;
    try {
        const res = await api.v2.admin.getAvailableDomains();
        domains.value = res.data?.domains || [];
    } catch (error: any) {
        message.error(error?.message || '获取主域名列表失败');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleCreate = async () => {
    if (!createFormRef.value) return;
    try {
        await createFormRef.value.validate();
    } catch {
        return;
    }

    createLoading.value = true;
    try {
        await api.v2.admin.createAvailableDomain({
            domain: createForm.domain.trim(),
            cloudflare_zone_id: createForm.cloudflare_zone_id.trim(),
            cloudflare_api_key: createForm.cloudflare_api_key.trim(),
            supplier: createForm.supplier,
            icp_filing: createForm.icp_filing,
            remarks: createForm.remarks.trim() || undefined,
        });
        message.success('主域名创建成功');
        showCreateModal.value = false;
        resetCreateForm();
        await fetchDomains();
    } catch (error: any) {
        message.error(error?.message || '主域名创建失败');
        console.error(error);
    } finally {
        createLoading.value = false;
    }
};

const handleEditClick = (row: AvailableDomain) => {
    currentEditDomain.value = row;
    Object.assign(editForm, {
        domain: row.domain,
        cloudflare_zone_id: row.cloudflare_zone_id || '',
        cloudflare_api_key: row.cloudflare_api_key || '',
        supplier: row.supplier || 'cloudflare',
        icp_filing: !!row.icp_filing,
        remarks: row.remarks || '',
    });
    showEditModal.value = true;
};

const handleEdit = async () => {
    if (!editFormRef.value || !currentEditDomain.value) return;
    try {
        await editFormRef.value.validate();
    } catch {
        return;
    }

    editLoading.value = true;
    try {
        await api.v2.admin.updateAvailableDomain(currentEditDomain.value.id, {
            domain: editForm.domain.trim(),
            cloudflare_zone_id: editForm.cloudflare_zone_id.trim(),
            cloudflare_api_key: editForm.cloudflare_api_key.trim(),
            supplier: editForm.supplier,
            icp_filing: editForm.icp_filing,
            remarks: editForm.remarks.trim(),
        });
        message.success('主域名更新成功');
        showEditModal.value = false;
        await fetchDomains();
    } catch (error: any) {
        message.error(error?.message || '主域名更新失败');
        console.error(error);
    } finally {
        editLoading.value = false;
    }
};

const handleDeleteClick = (row: AvailableDomain) => {
    dialog.warning({
        title: '确认删除',
        content: `确定要删除主域名 "${row.domain}" 吗？\n\n删除后用户将无法再使用该域名创建免费二级域名，此操作不可恢复！`,
        positiveText: '确认删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                await api.v2.admin.deleteAvailableDomain(row.id);
                message.success('主域名删除成功');
                await fetchDomains();
            } catch (error: any) {
                message.error(error?.message || '主域名删除失败');
                console.error(error);
            }
        },
    });
};

const handleSearch = () => {
    pagination.page = 1;
};

onMounted(() => {
    fetchDomains();
});
</script>
