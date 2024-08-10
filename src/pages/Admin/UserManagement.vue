<template>
  <div>
    <n-card size="small" title="用户管理">
      <template #header-extra>
        <div style="display: flex; align-items: center;">
          <n-input 
            v-model="searchQuery" 
            placeholder="搜索用户" 
            style="margin-right: 8px;" 
          />
          <n-button type="primary" @click="searchUsers">搜索</n-button>
          <n-button type="primary" @click="toggleAddUserForm" style="margin-left: 8px;">添加用户</n-button>
        </div>
      </template>
    </n-card>

    <!-- 只有在执行搜索后才显示匹配的用户 -->
    <n-card v-if="searchPerformed" size="small" style="margin-top: 16px;">
      <h3>搜索结果</h3>
        <p v-if="searchPerformed && userExists">{{ user.username }} ({{ user.email }})</p>
        <p v-if="searchPerformed && !userExists">用户不存在</p>
    </n-card>


    <n-card v-if="isAddUserFormVisible" size="small" title="添加用户信息" style="margin-top: 16px;">
      <n-form :model="userForm" label-width="100">
        <n-form-item label="用户名">
          <n-input v-model="userForm.username" placeholder="输入用户名" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model="userForm.email" placeholder="输入邮箱" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input type="password" v-model="userForm.password" placeholder="输入密码" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" :loading="isLoading" @click="addUser">添加用户</n-button>
          <n-button type="default" @click="resetAddUserForm" style="margin-left: 8px;">取消</n-button>
        </n-form-item>
        <n-alert v-if="errorMessage" type="error">{{ errorMessage }}</n-alert>
      </n-form>
    </n-card>

    <n-card size="small" title="已封禁用户" style="margin-top: 16px;">
      <template #header-extra>
        <n-input v-model="banSearchQuery" placeholder="搜索封禁用户" />
      </template>
      <div style="display: flex; flex-wrap: wrap;">
        <n-card v-for="user in filteredBannedUsers" :key="user.id" size="small" style="margin: 8px;">
          <div>
            <p><strong>用户名:</strong> {{ user.username }}</p>
            <p><strong>邮箱:</strong> {{ user.email }}</p>
            <div>
              <n-button type="default" @click="viewUserDetails(user.id)" style="margin-right: 8px;">详情</n-button>
              <n-button type="error" @click="unbanUser(user.id)">解封</n-button>
            </div>
          </div>
        </n-card>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

// 定义用户类型
interface User {
  id: number;
  username: string;
  email: string;
}

// 用户状态管理
const searchQuery = ref('');
const isAddUserFormVisible = ref(false);
const userForm = ref<User>({ id: 0, username: '', email: '' });
const isLoading = ref(false);
const errorMessage = ref('');
const banSearchQuery = ref('');
const searchPerformed = ref(false);
const userExists = ref(false); // 跟踪用户是否存在的状态

// 假设的数据源
const Users = ref<User[]>([
  { id: 1, username: 'chaoji', email: 'chaoji@chcat.cn' },
  { id: 2, username: '宅时光', email: 'zhaishis@ighx.me' },
]);

const bannedUsers = ref<User[]>([
  { id: 1, username: 'user1', email: 'user1@example.com' },
  { id: 2, username: 'user2', email: 'user2@example.com' },
]);

// 计算过滤后的已封禁用户
const filteredBannedUsers = computed(() => {
  return bannedUsers.value.filter(user =>
    user.username.toLowerCase().includes(banSearchQuery.value.toLowerCase())
  );
});

const searchUsers = () => {
  searchPerformed.value = true;
  // 确保大小写一致，并去除空格
  const trimmedQuery = searchQuery.value.trim().toLowerCase();
  userExists.value = Users.value.some(user => user.username.toLowerCase() === trimmedQuery);
  if (userExists.value) {
    const foundUser = Users.value.find(user => user.username.toLowerCase() === trimmedQuery);
    if (foundUser) {
      console.log('用户存在:', foundUser);
    }
  }
};


// 添加用户函数
const addUser = async () => {
  if (!validateUserForm()) return;

  isLoading.value = true;
  try {
    const newUser: User = { ...userForm.value, id: Users.value.length + 1 };
    Users.value.push(newUser);
    resetAddUserForm();
  } catch (error) {
    errorMessage.value = '添加用户失败，请重试。';
  } finally {
    isLoading.value = false;
  }
};

// 重置添加用户表单
const resetAddUserForm = () => {
  isAddUserFormVisible.value = false;
  userForm.value = { id: 0, username: '', email: '' };
  errorMessage.value = '';
};

// 验证用户表单
const validateUserForm = (): boolean => {
  if (!userForm.value.username || !userForm.value.email) {
    errorMessage.value = '所有字段均为必填项。';
    return false;
  }
  return true;
};

// 解封用户
const unbanUser = (id: number) => {
  console.log('解封用户:', id);
};

// 切换添加用户表单显示状态
const toggleAddUserForm = () => {
  isAddUserFormVisible.value = !isAddUserFormVisible.value;
};
</script>


<style scoped>
.user-item {
  cursor: pointer;
  transition: background-color 0.3s; 
}

.user-item:hover {
  background-color: #f5f5f5; 
}
</style>
