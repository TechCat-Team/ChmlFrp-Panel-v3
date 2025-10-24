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
                <n-button type="primary" @click="handleSearch" :loading="loading">
                    搜索
                </n-button>
                <n-button @click="handleReset">
                    重置
                </n-button>
            </n-space>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="isSearchMode" style="margin-bottom: 16px">
            <n-alert type="info" :show-icon="false">
                搜索结果：{{ searchForm.type === 'username' ? '用户名' : '邮箱' }}包含"{{ searchForm.value }}"的用户，共找到 {{ pagination.itemCount }} 个
                <n-button text type="primary" @click="handleReset" style="margin-left: 8px">
                    查看全部用户
                </n-button>
            </n-alert>
        </div>

        <n-data-table
            :columns="columns"
            :data="users"
            :pagination="pagination"
            :loading="loading"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
            :remote="true"
        />
    </n-card>

    <n-modal v-model:show="showEditModal" preset="card" style="width: 600px" title="编辑用户">
        <n-form ref="formRef" :model="currentUser" :rules="rules">
            <n-form-item path="username" label="用户名">
                <n-input v-model:value="currentUser.username" />
            </n-form-item>
            <n-form-item path="email" label="邮箱">
                <n-input v-model:value="currentUser.email" />
            </n-form-item>
            <n-form-item path="qq" label="QQ">
                <n-input v-model:value="currentUser.qq" />
            </n-form-item>
            <n-form-item path="usergroup" label="用户组">
                <n-input v-model:value="currentUser.usergroup" />
            </n-form-item>
            <n-form-item path="integral" label="积分">
                <n-input-number v-model:value="currentUser.integral" :min="0" />
            </n-form-item>
            <n-form-item path="bandwidth" label="带宽">
                <n-input-number v-model:value="currentUser.bandwidth" :min="0" />
            </n-form-item>
            <n-form-item path="tunnel" label="隧道数量">
                <n-input-number v-model:value="currentUser.tunnel" :min="0" />
            </n-form-item>
             <n-form-item path="password" label="新密码 (可选)">
                <n-input type="text" v-model:value="currentUser.password" placeholder="留空则不修改密码" />
            </n-form-item>
            <n-row :gutter="[0, 24]">
                <n-col :span="24">
                    <div style="display: flex; justify-content: flex-end">
                        <n-button @click="showEditModal = false">取消</n-button>
                        <n-button type="primary" @click="handleSave" style="margin-left: 8px">保存</n-button>
                    </div>
                </n-col>
            </n-row>
        </n-form>
    </n-modal>
    <n-back-top :right="100" />
</template>

<script lang="ts" setup>
import { ref, onMounted, h, reactive } from 'vue';
import { NDataTable, NButton, NCard, NModal, NForm, NFormItem, NInput, NInputNumber, NRow, NCol, useMessage, NBackTop, NSpace, NSelect, NAlert, NAvatar } from 'naive-ui';
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui';
import axios from 'axios';
import { useUserStore } from '@/stores/user';

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
    password?: string; // 用于重置密码
};

const message = useMessage();
const users = ref<User[]>([]);
const loading = ref(true);
const showEditModal = ref(false);
const formRef = ref<FormInst | null>(null);
const currentUser = ref<Partial<User>>({});
const isSearchMode = ref(false);

// 搜索表单
const searchForm = reactive({
    type: 'username',
    value: ''
});

// 搜索类型选项
const searchTypeOptions = [
    { label: '用户名', value: 'username' },
    { label: '邮箱', value: 'email' }
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

// 获取用户列表
const fetchUsers = async () => {
    loading.value = true;
    try {
        const adminToken = userInfoStore?.usertoken || 'YOUR_ADMIN_TOKEN';
        let response;

        if (isSearchMode.value && searchForm.value.trim()) {
            // 搜索模式
            response = await axios.get('https://cf-v2.uapis.cn/admin/search/users', {
                params: {
                    type: searchForm.type,
                    value: searchForm.value.trim(),
                    page: pagination.page,
                    size: pagination.pageSize,
                    admin_token: adminToken,
                },
            });
        } else {
            // 普通获取用户列表
            response = await axios.get('https://cf-v2.uapis.cn/admin/users', {
                params: {
                    page: pagination.page,
                    size: pagination.pageSize,
                    admin_token: adminToken,
                },
            });
        }

        if (response.data.code === 200) {
            users.value = response.data.data.users;
            pagination.itemCount = response.data.data.total;
        } else {
            message.error(`${isSearchMode.value ? '搜索用户' : '获取用户列表'}失败: ${response.data.message}`);
        }
    } catch (error) {
        message.error('请求失败，请检查网络或联系管理员');
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

// 编辑用户
const handleEdit = (user: User) => {
    currentUser.value = { ...user };
    // 清空密码字段，避免显示旧密码的hash
    currentUser.value.password = '';
    showEditModal.value = true;
};

// 保存用户信息
const handleSave = () => {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            try {
                const adminToken = userInfoStore?.usertoken || 'YOUR_ADMIN_TOKEN';
                const userId = currentUser.value.id;

                // 构造请求体，只包含需要更新的字段
                const requestBody: Partial<User> = { ...currentUser.value };
                delete requestBody.id;
                // 如果密码为空，则不提交密码字段
                if (!requestBody.password || requestBody.password.trim() === '') {
                    delete requestBody.password;
                }

                const response = await axios.put(`https://cf-v2.uapis.cn/admin/users/${userId}`, requestBody, {
                    params: { admin_token: adminToken },
                });

                if (response.data.code === 200) {
                    message.success('用户信息更新成功');
                    showEditModal.value = false;
                    fetchUsers(); // 刷新列表
                } else {
                    message.error(`更新失败: ${response.data.message}`);
                }
            } catch (error: any) {
                if (error.response) {
                     message.error(`更新失败: ${error.response.data.message || '服务器错误'}`);
                } else {
                    message.error('请求失败，请检查网络或联系管理员');
                }
                console.error(error);
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
        width: 150,
        render(row) {
            return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
                h(NAvatar, {
                    size: 'small',
                    src: row.userimg || undefined,
                    fallbackSrc: '/default-avatar.png'
                    }),
                h('span', row.username)
            ]);
        }
    },
    { title: '邮箱', key: 'email' },
    { title: '用户组', key: 'usergroup', sorter: 'default' },
    { title: '积分', key: 'integral', sorter: 'default' },
    { title: '带宽', key: 'bandwidth', sorter: 'default' },
    { title: '隧道数', key: 'tunnel', sorter: 'default' },
    {
        title: '操作',
        key: 'actions',
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

// 组件挂载时获取数据
onMounted(() => {
    fetchUsers();
});

</script>
