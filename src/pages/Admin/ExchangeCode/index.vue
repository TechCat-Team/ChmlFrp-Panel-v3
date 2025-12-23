<template>
    <n-back-top :right="100" />
    <n-space vertical :size="16">
        <!-- 礼品卡列表 -->
        <n-card title="礼品卡管理" :bordered="false">
            <n-space vertical :size="16">
                <!-- 操作栏 -->
                <n-space justify="space-between">
                    <n-space>
                        <n-input
                            v-model:value="searchKeyword"
                            placeholder="搜索礼品卡码或名称"
                            clearable
                            style="width: 240px"
                            @keydown.enter="loadGiftCards"
                        >
                            <template #prefix>
                                <n-icon :component="SearchOutline" />
                            </template>
                        </n-input>
                        <n-select
                            v-model:value="filterRewardType"
                            placeholder="奖励类型"
                            clearable
                            style="width: 130px"
                            :options="rewardTypeOptions"
                            @update:value="loadGiftCards"
                        />
                        <n-select
                            v-model:value="filterStatus"
                            placeholder="状态"
                            clearable
                            style="width: 120px"
                            :options="statusOptions"
                            @update:value="loadGiftCards"
                        />
                        <n-button @click="handleRefresh">
                            <template #icon>
                                <n-icon :component="RefreshOutline" />
                            </template>
                            刷新
                        </n-button>
                    </n-space>
                    <n-button type="primary" @click="handleOpenCreateModal">
                        <template #icon>
                            <n-icon :component="AddOutline" />
                        </template>
                        创建礼品卡
                    </n-button>
                </n-space>

                <!-- 表格 -->
                <n-data-table
                    :columns="columns"
                    :data="giftCards"
                    :pagination="pagination"
                    :loading="loading"
                    :bordered="false"
                    striped
                    :row-key="(row: GiftCard) => row.id"
                    :scroll-x="1200"
                    :remote="true"
                    @update:page="handlePageChange"
                    @update:page-size="handlePageSizeChange"
                />
            </n-space>
        </n-card>
    </n-space>

    <!-- 创建礼品卡对话框 -->
    <n-modal
        v-model:show="showCreateModal"
        preset="card"
        title="创建礼品卡"
        style="width: 600px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-form ref="createFormRef" :model="createForm" :rules="createRules" label-placement="left" label-width="120">
            <n-form-item label="礼品卡码" path="card_code">
                <n-input-group>
                    <n-input v-model:value="createForm.card_code" placeholder="请输入唯一的礼品卡码" />
                    <n-button @click="() => generateRandomCardCode(true)" quaternary>
                        <template #icon>
                            <n-icon :component="RefreshOutline" />
                        </template>
                        随机生成
                    </n-button>
                </n-input-group>
            </n-form-item>
            <n-form-item label="礼品卡名称" path="card_name">
                <n-input v-model:value="createForm.card_name" placeholder="默认为'礼品卡'" />
            </n-form-item>
            <n-form-item label="奖励类型" path="reward_type">
                <n-radio-group v-model:value="createForm.reward_type">
                    <n-space>
                        <n-radio value="会员">会员</n-radio>
                        <n-radio value="积分">积分</n-radio>
                    </n-space>
                </n-radio-group>
            </n-form-item>

            <!-- 会员类型配置 -->
            <template v-if="createForm.reward_type === '会员'">
                <n-form-item label="会员类型" path="member_type">
                    <n-select
                        v-model:value="createForm.member_type"
                        :options="memberTypeOptions"
                        placeholder="请选择会员类型"
                    />
                </n-form-item>
                <n-form-item label="会员天数" path="member_days">
                    <n-input-number
                        v-model:value="createForm.member_days"
                        placeholder="请输入会员天数"
                        :min="1"
                        style="width: 100%"
                    />
                </n-form-item>
            </template>

            <!-- 积分类型配置 -->
            <template v-if="createForm.reward_type === '积分'">
                <n-form-item label="积分数量" path="points">
                    <n-input-number
                        v-model:value="createForm.points"
                        placeholder="请输入积分数量"
                        :min="1"
                        style="width: 100%"
                    />
                </n-form-item>
            </template>

            <n-form-item label="总使用次数" path="total_usage_limit">
                <n-input-number
                    v-model:value="createForm.total_usage_limit"
                    placeholder="0表示无限次"
                    :min="0"
                    style="width: 100%"
                />
            </n-form-item>
            <n-form-item label="每人可用次数" path="per_user_limit">
                <n-input-number
                    v-model:value="createForm.per_user_limit"
                    placeholder="每人可使用次数"
                    :min="1"
                    style="width: 100%"
                />
            </n-form-item>
            <n-form-item label="生效时间" path="valid_from">
                <n-date-picker
                    v-model:value="createForm.valid_from"
                    type="datetime"
                    style="width: 100%"
                    format="yyyy-MM-dd HH:mm:ss"
                />
            </n-form-item>
            <n-form-item label="过期时间" path="valid_until">
                <n-date-picker
                    v-model:value="createForm.valid_until"
                    type="datetime"
                    style="width: 100%"
                    format="yyyy-MM-dd HH:mm:ss"
                />
            </n-form-item>
            <n-form-item label="是否激活" path="is_active">
                <n-switch v-model:value="createForm.is_active" />
            </n-form-item>
        </n-form>
        <template #footer>
            <n-space justify="end">
                <n-button @click="showCreateModal = false">取消</n-button>
                <n-button type="primary" :loading="createLoading" @click="handleCreate">创建</n-button>
            </n-space>
        </template>
    </n-modal>

    <!-- 礼品卡详情对话框 -->
    <n-modal
        v-model:show="showDetailModal"
        preset="card"
        title="礼品卡详情"
        style="width: 800px"
        :bordered="false"
        :segmented="{ content: 'soft' }"
    >
        <n-spin :show="detailLoading">
            <n-space vertical :size="16" v-if="currentDetail">
                <n-descriptions :column="2" bordered>
                    <n-descriptions-item label="礼品卡码">
                        {{ currentDetail.cardCode }}
                    </n-descriptions-item>
                    <n-descriptions-item label="礼品卡名称">
                        {{ currentDetail.cardName }}
                    </n-descriptions-item>
                    <n-descriptions-item label="奖励类型">
                        <n-tag :type="currentDetail.rewardType === '会员' ? 'success' : 'info'">
                            {{ currentDetail.rewardType }}
                        </n-tag>
                    </n-descriptions-item>
                    <n-descriptions-item label="状态">
                        <n-tag :type="currentDetail.isActive ? 'success' : 'error'">
                            {{ currentDetail.isActive ? '激活' : '禁用' }}
                        </n-tag>
                    </n-descriptions-item>
                    <n-descriptions-item label="会员类型" v-if="currentDetail.rewardType === '会员'">
                        {{ currentDetail.memberType }}
                    </n-descriptions-item>
                    <n-descriptions-item label="会员天数" v-if="currentDetail.rewardType === '会员'">
                        {{ currentDetail.memberDays }} 天
                    </n-descriptions-item>
                    <n-descriptions-item label="积分数量" v-if="currentDetail.rewardType === '积分'">
                        {{ currentDetail.points }}
                    </n-descriptions-item>
                    <n-descriptions-item label="使用情况">
                        {{ currentDetail.usedCount }} /
                        {{ currentDetail.totalUsageLimit === 0 ? '∞' : currentDetail.totalUsageLimit }}
                    </n-descriptions-item>
                    <n-descriptions-item label="每人限用"> {{ currentDetail.perUserLimit }} 次 </n-descriptions-item>
                    <n-descriptions-item label="生效时间">
                        {{ currentDetail.validFrom ? formatDateTime(currentDetail.validFrom) : '立即生效' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="过期时间">
                        {{ currentDetail.validUntil ? formatDateTime(currentDetail.validUntil) : '永不过期' }}
                    </n-descriptions-item>
                    <n-descriptions-item label="创建时间">
                        {{ formatDateTime(currentDetail.createTime) }}
                    </n-descriptions-item>
                </n-descriptions>

                <n-divider />

                <n-h3>使用记录</n-h3>
                <n-data-table
                    :columns="usageColumns"
                    :data="usageRecords"
                    :loading="usageLoading"
                    :pagination="{ pageSize: 10 }"
                    :bordered="false"
                    striped
                    size="small"
                />
            </n-space>
        </n-spin>
    </n-modal>
</template>

<script lang="ts" setup>
import {
    DataTableColumns,
    FormInst,
    FormRules,
    NButton,
    NSpace,
    NTag,
    PaginationProps,
    SelectOption,
    NDropdown,
    NIcon,
    useDialog,
    NInputGroup,
} from 'naive-ui';
import { ref, reactive, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import {
    AddOutline,
    SearchOutline,
    RefreshOutline,
    TrashOutline,
    EyeOutline,
    PowerOutline,
    CopyOutline,
    EllipsisVertical,
    CheckmarkCircle,
    CloseCircle,
} from '@vicons/ionicons5';
import {
    getGiftCards,
    createGiftCard,
    deleteGiftCard,
    toggleGiftCardStatus,
    getGiftCardDetail,
    getGiftCardUsageByCard,
    type GiftCard,
    type GiftCardUsageRecord,
    type CreateGiftCardRequest,
} from '@/api/v2/admin/admin';
import { useUserStore } from '@/stores/user';

const message = useMessage();
const dialog = useDialog();
const router = useRouter();
const userStore = useUserStore();

// 状态管理
const loading = ref(false);
const createLoading = ref(false);
const detailLoading = ref(false);
const usageLoading = ref(false);
const showCreateModal = ref(false);
const showDetailModal = ref(false);

// 数据
const giftCards = ref<GiftCard[]>([]);
const currentDetail = ref<GiftCard | null>(null);
const usageRecords = ref<GiftCardUsageRecord[]>([]);

// 搜索和筛选
const searchKeyword = ref('');
const filterRewardType = ref<'会员' | '积分' | null>(null);
const filterStatus = ref<string | null>(null);

// 分页配置
const pagination = reactive<PaginationProps>({
    page: 1,
    pageSize: 20,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    itemCount: 0,
    prefix: ({ itemCount }) => `共 ${itemCount} 条`,
});

// 处理分页变化
const handlePageChange = (page: number) => {
    pagination.page = page;
    loadGiftCards();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    loadGiftCards();
};

// 创建表单接口（使用 number 类型用于日期选择器）
interface CreateFormData {
    card_code?: string;
    card_name?: string;
    reward_type?: '会员' | '积分';
    member_type?: '普通会员' | '高级会员' | '超级会员';
    member_days?: number;
    points?: number;
    total_usage_limit?: number;
    per_user_limit?: number;
    valid_from?: number; // 使用 number 类型用于日期选择器
    valid_until?: number; // 使用 number 类型用于日期选择器
    is_active?: boolean;
}

// 创建表单
const createFormRef = ref<FormInst | null>(null);
const createForm = ref<CreateFormData>({
    card_code: '',
    card_name: '',
    reward_type: '会员',
    member_type: undefined,
    member_days: undefined,
    points: undefined,
    total_usage_limit: 1,
    per_user_limit: 1,
    valid_from: undefined,
    valid_until: undefined,
    is_active: true,
});

// 表单验证规则
const createRules: FormRules = {
    card_code: {
        required: true,
        message: '请输入礼品卡码',
        trigger: ['blur', 'input'],
    },
    reward_type: {
        required: true,
        message: '请选择奖励类型',
        trigger: ['blur', 'change'],
    },
    member_type: {
        required: true,
        validator: (_rule, value) => {
            if (createForm.value.reward_type === '会员' && !value) {
                return new Error('请选择会员类型');
            }
            return true;
        },
        trigger: ['blur', 'change'],
    },
    member_days: {
        required: true,
        validator: (_rule, value) => {
            if (createForm.value.reward_type === '会员' && (!value || value < 1)) {
                return new Error('请输入会员天数');
            }
            return true;
        },
        trigger: ['blur', 'change'],
    },
    points: {
        required: true,
        validator: (_rule, value) => {
            if (createForm.value.reward_type === '积分' && (!value || value < 1)) {
                return new Error('请输入积分数量');
            }
            return true;
        },
        trigger: ['blur', 'change'],
    },
};

// 选项配置
const memberTypeOptions: SelectOption[] = [
    { label: '普通会员', value: '普通会员' },
    { label: '高级会员', value: '高级会员' },
    { label: '超级会员', value: '超级会员' },
];

const rewardTypeOptions: SelectOption[] = [
    { label: '会员', value: '会员' },
    { label: '积分', value: '积分' },
];

const statusOptions: SelectOption[] = [
    { label: '激活', value: 'active' },
    { label: '禁用', value: 'inactive' },
];

// 表格列定义
const columns: DataTableColumns<GiftCard> = [
    {
        title: '礼品卡码',
        key: 'cardCode',
        width: 180,
        fixed: 'left',
        sorter: 'default',
        ellipsis: {
            tooltip: true,
        },
        render(row) {
            return h(
                'span',
                {
                    style: {
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: '#18a058',
                    },
                },
                row.cardCode
            );
        },
    },
    {
        title: '礼品卡名称',
        key: 'cardName',
        width: 150,
        sorter: 'default',
        ellipsis: {
            tooltip: true,
        },
    },
    {
        title: '奖励类型',
        key: 'rewardType',
        width: 140,
        align: 'center',
        render(row) {
            return h(
                NTag,
                {
                    type: row.rewardType === '会员' ? 'success' : 'info',
                    size: 'small',
                    round: true,
                    style: {
                        minWidth: '100px',
                        justifyContent: 'center',
                        display: 'inline-flex',
                        alignItems: 'center',
                    },
                },
                {
                    default: () => {
                        if (row.rewardType === '会员') {
                            return `${row.memberType} ${row.memberDays}天`;
                        } else {
                            return `${row.points}积分`;
                        }
                    },
                }
            );
        },
    },
    {
        title: '使用情况',
        key: 'usedCount',
        width: 130,
        align: 'center',
        render(row) {
            const percentage = row.totalUsageLimit === 0 ? 0 : (row.usedCount / row.totalUsageLimit) * 100;
            const color = percentage >= 90 ? '#d03050' : percentage >= 50 ? '#f0a020' : '#18a058';
            return h(
                'span',
                { style: { color, fontWeight: 'bold' } },
                `${row.usedCount} / ${row.totalUsageLimit === 0 ? '∞' : row.totalUsageLimit}`
            );
        },
    },
    {
        title: '每人限用',
        key: 'perUserLimit',
        width: 100,
        align: 'center',
        render(row) {
            return `${row.perUserLimit} 次`;
        },
    },
    {
        title: '有效期',
        key: 'validUntil',
        width: 180,
        ellipsis: {
            tooltip: true,
        },
        render(row) {
            if (!row.validUntil) return '永不过期';
            const isExpired = new Date(row.validUntil) < new Date();
            return h('span', { style: { color: isExpired ? '#d03050' : '#666' } }, formatDateTime(row.validUntil));
        },
    },
    {
        title: '状态',
        key: 'isActive',
        width: 85,
        align: 'center',
        render(row) {
            return h(
                NTag,
                {
                    type: row.isActive ? 'success' : 'error',
                    size: 'small',
                    round: true,
                    style: {
                        minWidth: '60px',
                        justifyContent: 'center',
                        display: 'inline-flex',
                        alignItems: 'center',
                    },
                },
                {
                    default: () => (row.isActive ? '激活' : '禁用'),
                    icon: () => h(NIcon, null, { default: () => h(row.isActive ? CheckmarkCircle : CloseCircle) }),
                }
            );
        },
    },
    {
        title: '操作',
        key: 'actions',
        width: 60,
        align: 'center',
        fixed: 'right',
        render(row) {
            const options = [
                {
                    label: '查看详情',
                    key: 'detail',
                    icon: () => h(NIcon, { component: EyeOutline }),
                    props: {
                        onClick: () => handleViewDetail(row.cardCode),
                    },
                },
                {
                    label: '复制卡码',
                    key: 'copy',
                    icon: () => h(NIcon, { component: CopyOutline }),
                    props: {
                        onClick: () => handleCopyCode(row),
                    },
                },
                {
                    type: 'divider',
                    key: 'd1',
                },
                {
                    label: row.isActive ? '禁用' : '启用',
                    key: 'toggle',
                    icon: () => h(NIcon, { component: PowerOutline }),
                    props: {
                        onClick: () => handleToggleStatus(row.cardCode, !row.isActive),
                        style: row.isActive ? 'color: #f0a020;' : 'color: #18a058;',
                    },
                },
                {
                    type: 'divider',
                    key: 'd2',
                },
                {
                    label: '删除',
                    key: 'delete',
                    icon: () => h(NIcon, { component: TrashOutline }),
                    props: {
                        onClick: () => handleDeleteConfirm(row),
                        style: 'color: #d03050;',
                    },
                },
            ];
            return h(
                NDropdown,
                {
                    trigger: 'click',
                    options: options,
                    placement: 'bottom-end',
                    showArrow: true,
                },
                {
                    default: () =>
                        h(
                            NButton,
                            {
                                size: 'small',
                                quaternary: true,
                                circle: true,
                            },
                            {
                                icon: () =>
                                    h(NIcon, {
                                        component: EllipsisVertical,
                                        size: 18,
                                    }),
                            }
                        ),
                }
            );
        },
    },
];

// 使用记录表格列
const usageColumns: DataTableColumns<GiftCardUsageRecord> = [
    {
        title: 'ID',
        key: 'id',
        width: 80,
    },
    {
        title: '用户ID',
        key: 'userId',
        width: 100,
        render(row) {
            return h(
                NButton,
                {
                    text: true,
                    type: 'primary',
                    size: 'small',
                    onClick: () => {
                        router.push({
                            path: '/admin/user',
                            query: {
                                searchType: 'id',
                                searchValue: String(row.userId),
                            },
                        });
                    },
                },
                { default: () => row.userId }
            );
        },
    },
    {
        title: '奖励类型',
        key: 'rewardType',
        width: 120,
        render(row) {
            return h(
                NTag,
                {
                    type: row.rewardType === '会员' ? 'success' : 'info',
                    size: 'small',
                },
                { default: () => row.rewardType }
            );
        },
    },
    {
        title: '奖励内容',
        key: 'reward',
        render(row) {
            if (row.rewardType === '会员') {
                return `${row.memberType} ${row.memberDays}天`;
            } else {
                return `${row.points}积分`;
            }
        },
    },
    {
        title: '使用时间',
        key: 'usageTime',
        render(row) {
            return formatDateTime(row.usageTime);
        },
    },
];

// 加载礼品卡列表
const loadGiftCards = async () => {
    try {
        loading.value = true;
        const adminToken = userStore.userInfo?.usertoken;
        if (!adminToken) {
            message.error('未找到管理员令牌');
            return;
        }

        const response = await getGiftCards(
            adminToken,
            pagination.page || 1,
            pagination.pageSize || 20,
            searchKeyword.value || undefined
        );

        if (response.code === 200 && response.data) {
            // 直接使用服务端返回的数据，不进行客户端筛选
            // 客户端筛选会导致分页计数不准确
            giftCards.value = response.data.gift_cards;
            // 使用服务端返回的总数
            pagination.itemCount = response.data.total || 0;
        } else {
            message.error(response.msg || '加载失败');
        }
    } catch (error: any) {
        message.error(error.message || '加载礼品卡列表失败');
    } finally {
        loading.value = false;
    }
};

// 创建礼品卡
const handleCreate = async () => {
    try {
        await createFormRef.value?.validate();
        createLoading.value = true;

        const adminToken = userStore.userInfo?.usertoken;
        if (!adminToken) {
            message.error('未找到管理员令牌');
            return;
        }

        // 格式化日期
        const payload: CreateGiftCardRequest = {
            admin_token: adminToken,
            card_code: createForm.value.card_code!,
            card_name: createForm.value.card_name || undefined,
            reward_type: createForm.value.reward_type!,
            total_usage_limit: createForm.value.total_usage_limit,
            per_user_limit: createForm.value.per_user_limit,
            is_active: createForm.value.is_active,
        };

        if (createForm.value.reward_type === '会员') {
            payload.member_type = createForm.value.member_type;
            payload.member_days = createForm.value.member_days;
        } else {
            payload.points = createForm.value.points;
        }

        if (createForm.value.valid_from) {
            payload.valid_from = formatDateTimeToString(createForm.value.valid_from);
        }
        if (createForm.value.valid_until) {
            payload.valid_until = formatDateTimeToString(createForm.value.valid_until);
        }

        const response = await createGiftCard(payload);

        if (response.code === 200) {
            message.success('礼品卡创建成功');
            showCreateModal.value = false;
            resetCreateForm();
            loadGiftCards();
        } else {
            message.error(response.msg || '创建失败');
        }
    } catch (error: any) {
        if (error?.message) {
            // 表单验证错误
            return;
        }
        message.error(error?.message || '创建礼品卡失败');
    } finally {
        createLoading.value = false;
    }
};

// 删除礼品卡确认
const handleDeleteConfirm = (card: GiftCard) => {
    dialog.warning({
        title: '确认删除',
        content: `确定要删除礼品卡"${card.cardName || card.cardCode}"吗？此操作不可恢复。`,
        positiveText: '确认删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            await handleDelete(card.cardCode);
        },
    });
};

// 删除礼品卡
const handleDelete = async (cardCode: string) => {
    try {
        const adminToken = userStore.userInfo?.usertoken;
        if (!adminToken) {
            message.error('未找到管理员令牌');
            return;
        }

        const response = await deleteGiftCard(adminToken, cardCode);

        if (response.code === 200) {
            message.success('删除成功');
            loadGiftCards();
        } else {
            message.error(response.msg || '删除失败');
        }
    } catch (error: any) {
        message.error(error.message || '删除礼品卡失败');
    }
};

// 切换状态
const handleToggleStatus = async (cardCode: string, isActive: boolean) => {
    try {
        const adminToken = userStore.userInfo?.usertoken;
        if (!adminToken) {
            message.error('未找到管理员令牌');
            return;
        }

        const response = await toggleGiftCardStatus(adminToken, cardCode, isActive);

        if (response.code === 200) {
            message.success(`已${isActive ? '启用' : '禁用'}`);
            loadGiftCards();
        } else {
            message.error(response.msg || '操作失败');
        }
    } catch (error: any) {
        message.error(error.message || '切换状态失败');
    }
};

// 查看详情
const handleViewDetail = async (cardCode: string) => {
    try {
        detailLoading.value = true;
        showDetailModal.value = true;

        const adminToken = userStore.userInfo?.usertoken;
        if (!adminToken) {
            message.error('未找到管理员令牌');
            return;
        }

        // 获取详情
        const detailResponse = await getGiftCardDetail(adminToken, cardCode);
        if (detailResponse.code === 200 && detailResponse.data) {
            currentDetail.value = detailResponse.data;
        }

        // 获取使用记录
        usageLoading.value = true;
        const usageResponse = await getGiftCardUsageByCard(adminToken, cardCode);
        if (usageResponse.code === 200 && usageResponse.data) {
            usageRecords.value = usageResponse.data.usage_records;
        }
        usageLoading.value = false;
    } catch (error: any) {
        message.error(error.message || '加载详情失败');
    } finally {
        detailLoading.value = false;
    }
};

// 生成随机礼品卡码
const generateRandomCardCode = (showMessage = true) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const segments: string[] = [];

    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);

    // 将随机字节转换为字符
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            const index = i * 4 + j;
            const charIndex = randomBytes[index] % chars.length;
            segment += chars.charAt(charIndex);
        }
        segments.push(segment);
    }

    const code = segments.join('-');
    createForm.value.card_code = code;
    if (showMessage) {
        message.success('已生成随机礼品卡码');
    }
};

// 打开创建对话框
const handleOpenCreateModal = () => {
    showCreateModal.value = true;
    // 自动生成随机礼品卡码
    generateRandomCardCode(false);
};

// 复制代码
const handleCopyCode = (card: GiftCard) => {
    // 构建内容部分
    let contentText = '';
    if (card.rewardType === '会员') {
        contentText = `${card.memberType}\n时长：${card.memberDays}天`;
    } else {
        contentText = `${card.points}积分`;
    }

    // 构建有效期部分
    let validUntilText = '';
    if (card.validUntil) {
        validUntilText = `兑换码有效期为：${formatDateTime(card.validUntil)}`;
    } else {
        validUntilText = '兑换码有效期为：永不过期';
    }

    // 构建完整的复制文本
    const copyText = `ChmlFrp兑换码
=================
兑换码：${card.cardCode}
=================
内容：${contentText}
${validUntilText}
=================
温馨提示:请妥善保管好您的兑换码
本信息只发一次 如有丢失无法找回`;

    navigator.clipboard.writeText(copyText);
    message.success('已复制到剪贴板');
};

// 刷新
const handleRefresh = () => {
    searchKeyword.value = '';
    filterRewardType.value = null;
    filterStatus.value = null;
    pagination.page = 1;
    loadGiftCards();
};

// 重置创建表单
const resetCreateForm = () => {
    createForm.value = {
        card_code: '',
        card_name: '',
        reward_type: '会员',
        member_type: undefined,
        member_days: undefined,
        points: undefined,
        total_usage_limit: 1,
        per_user_limit: 1,
        valid_from: undefined,
        valid_until: undefined,
        is_active: true,
    };
    createFormRef.value?.restoreValidation();
};

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

// 格式化日期时间为字符串（用于API）
const formatDateTimeToString = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 初始化
onMounted(() => {
    loadGiftCards();
});
</script>

<style scoped lang="scss">
.stat-remaining {
    background: linear-gradient(135deg, #2080f0 0%, #1866c7 100%);

    &:hover {
        box-shadow: 0 8px 24px rgba(32, 128, 240, 0.4);
    }
}

:deep(.n-data-table) {
    .n-data-table-th {
        font-weight: 600;
        background-color: #fafafa;
    }

    .n-data-table-td {
        font-size: 14px;
    }
}

:deep(.n-modal) {
    .n-card {
        border-radius: 16px;
    }
}

:deep(.n-form) {
    .n-form-item-label {
        font-weight: 500;
    }
}

:deep(.n-input),
:deep(.n-select),
:deep(.n-date-picker) {
    border-radius: 8px;
}

:deep(.n-button) {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-1px);
    }
}
</style>
