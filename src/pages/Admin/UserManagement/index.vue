<template>
    <n-card title="用户管理">
        <!-- 搜索区域 -->
        <div style="margin-bottom: 16px">
            <n-space>
                <n-select
                    v-model:value="searchForm.type"
                    :options="searchTypeOptions"
                    style="width: 120px"
                    placeholder="搜索类型"
                />
                <n-input
                    v-model:value="searchForm.value"
                    placeholder="请输入搜索内容"
                    style="width: 200px"
                    @keyup.enter="handleSearch"
                />
                <n-button type="primary" @click="handleSearch" :loading="loading"> 搜索 </n-button>
                <n-button @click="handleReset"> 重置 </n-button>
            </n-space>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="isSearchMode" style="margin-bottom: 16px">
            <n-alert type="info" :show-icon="false">
                搜索结果：{{ getSearchTypeLabel() }}包含"{{ searchForm.value }}"的用户，共找到
                {{ pagination.itemCount }} 个
                <n-button text type="primary" @click="handleReset" style="margin-left: 8px"> 查看全部用户 </n-button>
            </n-alert>
        </div>
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
                :data="users"
                :pagination="pagination"
                :loading="loading"
                @update:page="handlePageChange"
                @update:page-size="handlePageSizeChange"
                :remote="true"
                :scroll-x="1200"
            />
        </n-watermark>
    </n-card>

    <n-modal v-model:show="showEditModal" preset="card" style="width: 700px" :bordered="false" size="large">
        <template #header>
            <div style="display: flex; align-items: center; gap: 12px">
                <n-avatar v-if="currentUser.userimg" round size="medium" :src="currentUser.userimg" />
                <n-avatar v-else round size="medium">
                    {{ currentUser.username?.[0]?.toUpperCase() || 'U' }}
                </n-avatar>
                <div>
                    <div style="font-size: 18px; font-weight: 600">编辑用户信息</div>
                    <div style="font-size: 12px; opacity: 0.6; margin-top: 2px">
                        {{ currentUser.username || '用户' }}
                    </div>
                </div>
            </div>
        </template>

        <n-divider />

        <n-form ref="formRef" :model="currentUser" :rules="rules" label-placement="left" label-width="120">
            <!-- 基本信息 -->
            <div class="form-section">
                <n-row :gutter="[16, 16]">
                    <n-col :span="12">
                        <n-form-item path="username" label="用户名">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="PersonOutline" :size="16" />
                                    <span>用户名</span>
                                </div>
                            </template>
                            <n-input v-model:value="currentUser.username" placeholder="请输入用户名" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item path="email" label="邮箱">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="MailOutline" :size="16" />
                                    <span>邮箱</span>
                                </div>
                            </template>
                            <n-input v-model:value="currentUser.email" placeholder="请输入邮箱地址" clearable />
                        </n-form-item>
                    </n-col>
                </n-row>
                <n-row :gutter="[16, 16]">
                    <n-col :span="12">
                        <n-form-item path="qq" label="QQ">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="ChatbubbleOutline" :size="16" />
                                    <span>QQ</span>
                                </div>
                            </template>
                            <n-input v-model:value="currentUser.qq" placeholder="请输入QQ号" clearable />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item path="usergroup" label="用户组">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="PeopleOutline" :size="16" />
                                    <span>用户组</span>
                                </div>
                            </template>
                            <n-select
                                v-model:value="currentUser.usergroup"
                                :options="userGroupOptions"
                                filterable
                                tag
                                placeholder="选择或输入用户组"
                                clearable
                            />
                        </n-form-item>
                    </n-col>
                </n-row>
            </div>

            <n-divider />

            <!-- 资源配额 -->
            <div class="form-section">
                <n-row :gutter="[16, 16]">
                    <n-col :span="12">
                        <n-form-item path="integral" label="积分">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="StarOutline" :size="16" />
                                    <span>积分</span>
                                </div>
                            </template>
                            <n-input-number
                                v-model:value="currentUser.integral"
                                :min="0"
                                placeholder="积分数量"
                                :show-button="false"
                                :precision="0"
                                style="width: 100%"
                                :format="(value: number | null) => (value !== null ? value.toLocaleString() : '')"
                                :parse="
                                    (input: string) => {
                                        const num = Number(input.replace(/,/g, ''));
                                        return isNaN(num) ? null : num;
                                    }
                                "
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item path="bandwidth" label="带宽">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="SpeedometerOutline" :size="16" />
                                    <span>带宽</span>
                                </div>
                            </template>
                            <n-input-number
                                v-model:value="currentUser.bandwidth"
                                :min="0"
                                placeholder="带宽限制"
                                :show-button="false"
                                :precision="0"
                                style="width: 100%"
                                :format="(value: number | null) => (value !== null ? value.toLocaleString() : '')"
                                :parse="
                                    (input: string) => {
                                        const num = Number(input.replace(/,/g, ''));
                                        return isNaN(num) ? null : num;
                                    }
                                "
                            />
                        </n-form-item>
                    </n-col>
                </n-row>
                <n-row :gutter="[16, 16]" style="margin-top: 16px">
                    <n-col :span="12">
                        <n-form-item path="tunnel" label="隧道数量">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="GitBranchOutline" :size="16" />
                                    <span>隧道数</span>
                                </div>
                            </template>
                            <n-input-number
                                v-model:value="currentUser.tunnel"
                                :min="0"
                                placeholder="隧道数量"
                                :show-button="false"
                                :precision="0"
                                style="width: 100%"
                                :format="(value: number | null) => (value !== null ? value.toLocaleString() : '')"
                                :parse="
                                    (input: string) => {
                                        const num = Number(input.replace(/,/g, ''));
                                        return isNaN(num) ? null : num;
                                    }
                                "
                            />
                        </n-form-item>
                    </n-col>
                </n-row>
            </div>

            <n-divider />

            <!-- 其他设置 -->
            <div class="form-section">
                <n-row :gutter="[16, 16]">
                    <n-col :span="12">
                        <n-form-item path="term" label="会员到期时间">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="CalendarOutline" :size="16" />
                                    <span>到期时间</span>
                                </div>
                            </template>
                            <n-date-picker
                                v-model:value="termTimestamp"
                                type="date"
                                clearable
                                placeholder="留空表示终身会员"
                                style="width: 100%"
                                @update:value="handleTermChange"
                            />
                        </n-form-item>
                    </n-col>
                    <n-col :span="12">
                        <n-form-item path="password" label="新密码">
                            <template #label>
                                <div style="display: flex; align-items: center; gap: 6px">
                                    <n-icon :component="LockClosedOutline" :size="16" />
                                    <span>新密码</span>
                                </div>
                            </template>
                            <n-input
                                type="password"
                                v-model:value="currentUser.password"
                                placeholder="留空则不修改密码"
                                show-password-on="click"
                                clearable
                                autocomplete="new-password"
                                :input-props="{ autocomplete: 'new-password' }"
                            />
                        </n-form-item>
                    </n-col>
                </n-row>
            </div>

            <n-divider />

            <!-- 操作按钮 -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px">
                <n-button size="large" @click="showEditModal = false"> 取消 </n-button>
                <n-button type="primary" size="large" @click="handleSave" :loading="saving"> 保存更改 </n-button>
            </div>
        </n-form>
    </n-modal>
    <n-back-top :right="100" />
</template>

<script lang="ts" setup>
import { ref, onMounted, h, reactive, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {
    NDataTable,
    NButton,
    NCard,
    NModal,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NRow,
    NCol,
    useMessage,
    NBackTop,
    NSpace,
    NSelect,
    NAlert,
    NAvatar,
    NDatePicker,
    NDivider,
    NIcon,
} from 'naive-ui';
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
import {
    PersonOutline,
    MailOutline,
    ChatbubbleOutline,
    PeopleOutline,
    StarOutline,
    SpeedometerOutline,
    GitBranchOutline,
    CalendarOutline,
    LockClosedOutline,
} from '@vicons/ionicons5';
import api from '@/api';
import { useUserStore } from '@/stores/user';

const route = useRoute();

const userStore = useUserStore();
const userInfoStore = userStore.userInfo;

// 定义用户类型
type User = {
    id: number;
    username: string;
    email: string;
    qq: string;
    usergroup: string;
    realname: string;
    integral: number;
    bandwidth: number;
    tunnel: number;
    userimg: string;
    term?: string; // 会员到期时间
    password?: string; // 用于重置密码
};

const message = useMessage();
const users = ref<User[]>([]);
const loading = ref(true);
const showEditModal = ref(false);
const formRef = ref<FormInst | null>(null);
const currentUser = ref<Partial<User>>({});
const isSearchMode = ref(false);
const termTimestamp = ref<number | null>(null);
const saving = ref(false);

// 预设用户组选项
const defaultUserGroupOptions = [
    { label: '免费用户', value: '免费用户' },
    { label: '普通会员', value: '普通会员' },
    { label: '高级会员', value: '高级会员' },
    { label: '超级会员', value: '超级会员' },
    { label: '定制会员', value: '定制会员' },
    { label: '封禁', value: '封禁' },
];

// 计算用户组选项，包含当前值（如果不在预设选项中）
const userGroupOptions = computed(() => {
    const options = [...defaultUserGroupOptions];
    if (
        currentUser.value.usergroup &&
        !defaultUserGroupOptions.some((opt) => opt.value === currentUser.value.usergroup)
    ) {
        options.push({
            label: currentUser.value.usergroup,
            value: currentUser.value.usergroup,
        });
    }
    return options;
});

// 搜索表单
const searchForm = reactive({
    type: 'id',
    value: '',
});

// 搜索类型选项
const searchTypeOptions = [
    { label: '用户ID', value: 'id' },
    { label: '用户名', value: 'username' },
    { label: '邮箱', value: 'email' },
];

// 分页配置
const pagination = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    pageSizes: [10, 20, 50, 100],
    showSizePicker: true,
});

// 表单验证规则
const rules: FormRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
};

// 获取搜索类型标签
const getSearchTypeLabel = () => {
    const option = searchTypeOptions.find((opt) => opt.value === searchForm.type);
    return option?.label || '搜索';
};

// 获取用户列表
const fetchUsers = async () => {
    loading.value = true;
    try {
        const adminToken = userInfoStore?.usertoken || '';
        let data;

        if (isSearchMode.value && searchForm.value.trim()) {
            const res = await api.v2.admin.searchUsers(
                searchForm.type as 'username' | 'email' | 'id',
                searchForm.value.trim(),
                pagination.page,
                pagination.pageSize
            );
            data = res.data;
        } else {
            const res = await api.v2.admin.getUsers(pagination.page, pagination.pageSize);
            data = res.data;
        }

        users.value = data.users;
        pagination.itemCount = data.total;
    } catch (error: any) {
        const msg = error?.message || '请求失败，请检查网络或联系管理员';
        message.error(msg);
        console.error(error);
    } finally {
        loading.value = false;
    }
};

// 处理分页变化
const handlePageChange = (page: number) => {
    pagination.page = page;
    fetchUsers();
};

const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1; // 回到第一页
    fetchUsers();
};

// 搜索用户
const handleSearch = () => {
    if (!searchForm.value.trim()) {
        message.warning('请输入搜索内容');
        return;
    }
    isSearchMode.value = true;
    pagination.page = 1; // 重置到第一页
    fetchUsers();
};

// 重置搜索
const handleReset = () => {
    searchForm.value = '';
    isSearchMode.value = false;
    pagination.page = 1; // 重置到第一页
    fetchUsers();
};

// 处理 term 日期变化
const handleTermChange = (value: number | null) => {
    if (value === null) {
        currentUser.value.term = '9999-09-09';
    } else {
        const date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        currentUser.value.term = `${year}-${month}-${day}`;
    }
};

// 编辑用户
const handleEdit = (user: User) => {
    currentUser.value = { ...user };
    // 清空密码字段，避免显示旧密码的hash
    currentUser.value.password = '';

    // 先重置日期选择器，避免闪烁
    termTimestamp.value = null;

    // 先打开模态框
    showEditModal.value = true;

    // 在模态框完全渲染后再设置日期值，避免日期选择器闪烁
    nextTick(() => {
        // 处理 term 字段，转换为时间戳用于日期选择器
        // 处理 9999-09-09 格式（终身会员）
        if (currentUser.value.term && currentUser.value.term !== '9999-09-09') {
            try {
                const date = new Date(currentUser.value.term);
                if (!isNaN(date.getTime())) {
                    termTimestamp.value = date.getTime();
                } else {
                    termTimestamp.value = null;
                }
            } catch (e) {
                termTimestamp.value = null;
            }
        } else {
            termTimestamp.value = null;
        }
    });
};

// 保存用户信息
const handleSave = () => {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            saving.value = true;
            try {
                const adminToken = userInfoStore?.usertoken || '';
                const userId = currentUser.value.id;

                // 构造请求体，只包含需要更新的字段
                const requestBody: Partial<User> = { ...currentUser.value };
                delete requestBody.id;
                // 如果密码为空，则不提交密码字段
                if (!requestBody.password || requestBody.password.trim() === '') {
                    delete requestBody.password;
                }
                // 如果 term 为空或日期选择器为空，则设置为 9999-09-09（终身会员）
                if (termTimestamp.value === null || !requestBody.term || requestBody.term.trim() === '') {
                    requestBody.term = '9999-09-09';
                }

                await api.v2.admin.updateUser(userId as number, requestBody as Record<string, unknown>);
                message.success('用户信息更新成功');
                showEditModal.value = false;
                termTimestamp.value = null;
                fetchUsers();
            } catch (error: any) {
                const msg = error?.message || '请求失败，请检查网络或联系管理员';
                message.error(`更新失败: ${msg}`);
                console.error(error);
            } finally {
                saving.value = false;
            }
        }
    });
};

// 定义表格列
const columns: DataTableColumns<User> = [
    { title: 'ID', key: 'id', width: 80, sorter: 'default' },
    {
        title: '用户名',
        key: 'username',
        sorter: 'default',
        minWidth: 150,
        width: 180,
        render(row) {
            return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
                h(NAvatar, {
                    size: 'small',
                    src: row.userimg || undefined,
                    fallbackSrc: '/default-avatar.png',
                }),
                h('span', { style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, row.username),
            ]);
        },
    },
    {
        title: '邮箱',
        key: 'email',
        minWidth: 180,
        width: 220,
        ellipsis: {
            tooltip: true,
        },
    },
    {
        title: '用户组',
        key: 'usergroup',
        sorter: 'default',
        minWidth: 100,
        width: 120,
    },
    {
        title: '积分',
        key: 'integral',
        sorter: 'default',
        width: 100,
        align: 'right',
    },
    {
        title: '带宽',
        key: 'bandwidth',
        sorter: 'default',
        width: 100,
        align: 'right',
    },
    {
        title: '隧道数',
        key: 'tunnel',
        sorter: 'default',
        width: 100,
        align: 'right',
    },
    {
        title: '操作',
        key: 'actions',
        width: 100,
        fixed: 'right',
        render(row) {
            return h(
                NButton,
                {
                    size: 'small',
                    onClick: () => handleEdit(row),
                },
                { default: () => '编辑' }
            );
        },
    },
];

// 监听模态框关闭，重置 termTimestamp
watch(showEditModal, (newVal) => {
    if (!newVal) {
        termTimestamp.value = null;
    }
});

// 组件挂载时获取数据
onMounted(() => {
    // 检查路由参数，支持从其他页面跳转过来并自动搜索
    const searchType = route.query.searchType as string;
    const searchValue = route.query.searchValue as string;

    if (searchType && searchValue) {
        searchForm.type = searchType;
        searchForm.value = searchValue;
        isSearchMode.value = true;
    }

    fetchUsers();
});
</script>

<style scoped>
.form-section {
    margin-bottom: 8px;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

:deep(.n-form-item-label) {
    font-weight: 500;
}

:deep(.n-input),
:deep(.n-input-number),
:deep(.n-date-picker) {
    transition: all 0.2s ease;
}

:deep(.n-input:focus),
:deep(.n-input-number:focus),
:deep(.n-date-picker:focus) {
    box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.1);
}

:deep(.n-modal__content) {
    padding: 24px;
}

:deep(.n-form-item) {
    margin-bottom: 0;
}
</style>
