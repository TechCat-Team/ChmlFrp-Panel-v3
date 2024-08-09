<template>
  <div class="container">
    <n-back-top :right="100" />
    <n-card size="small" class="top-card">
      <n-collapse>
        <n-collapse-item name="1" title="添加用户" class="custom-collapse-item">
          <n-card size="small">
            <template #header-extra>
              <n-tag round :bordered="false" type="primary">
                用户表单
              </n-tag>
            </template>
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
                <n-button type="primary" @click="addUser">添加用户</n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-collapse-item>

        <n-collapse-item name="2" title="删除用户" class="custom-collapse-item">
          <n-card size="small">
            <template #header-extra>
              <n-tag round :bordered="false" type="primary">
                用户删除
              </n-tag>
            </template>
            <n-form :model="userForm" label-width="100">
              <n-form-item label="用户名">
                <n-input v-model="userForm.username" placeholder="输入用户名" />
              </n-form-item>
              <n-form-item label="邮箱">
                <n-input v-model="userForm.email" placeholder="输入邮箱" />
              </n-form-item>
              <n-form-item>
                <n-button type="primary" @click="delUser">删除</n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-collapse-item>

        <n-collapse-item name="3" title="封禁用户" class="custom-collapse-item">
          <n-card size="small">
            <template #header-extra>
              <n-tag round :bordered="false" type="primary">
                用户封禁
              </n-tag>
            </template>
            <n-form :model="userForm" label-width="100">
              <n-form-item label="用户名">
                <n-input v-model="userForm.username" placeholder="输入用户名" />
              </n-form-item>
              <n-form-item label="邮箱">
                <n-input v-model="userForm.email" placeholder="输入邮箱" />
              </n-form-item>
              <n-form-item label="封禁原因">
                <n-input v-model="userForm.why" placeholder="输入封禁原因" />
              </n-form-item>
              <n-form-item label="解封时间">
                <n-input type="date" v-model="userForm.time" placeholder="" />
              </n-form-item>
              <n-form-item>
                <n-button type="primary" @click="banUser">GoBan</n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-collapse-item>

        <n-collapse-item name="4" title="解封用户" class="custom-collapse-item">
          <n-card size="small">
            <template #header-extra>
              <n-tag round :bordered="false" type="primary">
                用户解封
              </n-tag>
            </template>
            <n-form :model="userForm" label-width="100">
              <n-form-item label="用户名">
                <n-input v-model="userForm.username" placeholder="输入用户名" />
              </n-form-item>
              <n-form-item label="邮箱">
                <n-input v-model="userForm.email" placeholder="输入邮箱" />
              </n-form-item>
              <n-form-item>
                <n-button type="primary" @click="unBanUser">UnBan</n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-collapse-item>

        <n-collapse-item name="5" title="给予会员" class="custom-collapse-item">
          <n-card size="small">
            <template #header-extra>
              <n-tag round :bordered="false" type="primary">
                会员管理
              </n-tag>
            </template>
            <n-form :model="membershipForm" label-width="100">
              <n-form-item label="用户名">
                <n-input v-model="membershipForm.username" placeholder="输入用户名" />
              </n-form-item>
              <n-form-item label="邮箱">
                <n-input v-model="membershipForm.email" placeholder="输入邮箱" />
              </n-form-item>
              <n-form-item label="会员期限">
                <n-input type="date" v-model="membershipForm.expiryDate" placeholder="" />
              </n-form-item>
              <n-form-item>
                <n-button type="primary" @click="manageMembership">提交</n-button>
              </n-form-item>
            </n-form>
          </n-card>
        </n-collapse-item>
      </n-collapse>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const userForm = ref({
  username: '',
  email: '',
  password: '',
  why: '',
  time: '',
});

const membershipForm = ref({
  username: '',
  email: '',
  expiryDate: '',
});

function addUser() {
  // 添加用户的逻辑
}

function delUser() {
  // 删除用户的逻辑
}

function banUser() {
  // 封禁用户的逻辑
}

function unBanUser() {
  // 解封用户的逻辑
}

function manageMembership() {
  // 给予/收回会员的逻辑
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.top-card {
  padding: 20px;
  background-color: #ffffff; /* 胶带顶级卡片的背景颜色 */
}

.custom-collapse-item .n-collapse-item-content {
  background-color: #ffffff; /* 设置折叠内容的背景颜色为白色 */
  padding: 16px;
}
</style>
