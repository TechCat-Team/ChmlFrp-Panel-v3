<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card title="消息">
                    <n-alert
                        v-if="userInfo?.usergroup === '封禁'"
                        title="您的账户已被封禁"
                        type="error"
                        style="margin-bottom: 10px"
                    >
                        理由：理由信息正在开发中，如果想知道具体原因请联系QQ：242247494
                    </n-alert>
                    <n-alert
                        v-if="userInfo?.realname === '未实名'"
                        title="未实名通知"
                        type="warning"
                        style="margin-bottom: 10px"
                    >
                        您尚未实名，请前往右侧实名认证填写处进行实名，每位用户提供3次免费实名，次数耗尽后请联系QQ242247494进行重置。我们允许未成年实名，但请不要使用非本人身份证实名。
                    </n-alert>
                    <n-alert v-if="isTermExpiringSoon" title="您的会员即将到期" type="info" style="margin-bottom: 10px">
                        您的ChmlFrp{{ userInfo?.usergroup }}将于 {{ userInfo?.term }} 到期，剩余
                        {{ remainingDays }} 天，请及时续费。
                    </n-alert>
                </n-card>
                <n-card title="账户设置" style="margin-top: 15px">
                    <template #header-extra>
                        <n-skeleton v-if="loadingQianDao" :width="56" round :sharp="false" size="medium" />
                        <div v-else>
                            <n-button
                                v-if="!is_signed_in_today"
                                round
                                :loading="loadingQianDaoButton"
                                type="primary"
                                quaternary
                                @click="onSignButtonClick"
                            >
                                {{ QianDaoTest }}
                            </n-button>
                            <n-tooltip v-else>
                                <template #trigger>
                                    <n-button type="primary" round quaternary disabled tag="div"> 签到 </n-button>
                                </template>
                                您今天已经签到过啦
                            </n-tooltip>
                        </div>
                        <n-popover trigger="hover" style="border-radius: 8px">
                            <template #trigger>
                                <n-skeleton v-if="loadingQianDao" :width="92" round :sharp="false" size="medium" />
                                <n-button v-else quaternary round>签到信息</n-button>
                            </template>
                            <n-thing title="统计信息" content-style="margin-top: 10px;">
                                上次签到时间：{{ last_sign_in_time || '暂无数据' }}<br />
                                累计签到积分：{{ total_points || '暂无数据' }}<br />
                                累计签到次数：{{ total_sign_ins || '暂无数据' }}<br />
                                今日签到人数：{{ count_of_matching_records || 0 }}
                            </n-thing>
                        </n-popover>
                    </template>
                    <n-grid cols="1 l:2" responsive="screen" :x-gap="5" :y-gap="5">
                        <n-gi v-for="(setting, index) in settingCard" :key="index">
                            <n-card hoverable size="small" :bordered="false" @click="setting.click">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center">
                                        <n-icon size="28" :component="setting.icon" />
                                        <div style="margin-left: 15px">
                                            <p style="margin: 0; font-size: 15px">{{ setting.title }}</p>
                                            <p style="margin: 0; font-size: 12px">{{ setting.subtitle }}</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                    </n-grid>
                </n-card>
            </n-gi>
            <n-gi :span="2">
                <n-card title="实名认证" style="margin-bottom: 15px" v-if="userInfo?.realname === '未实名'">
                    <n-form
                        ref="realNameFormRef"
                        :model="realNameModel"
                        :rules="realNameRules"
                        label-placement="left"
                        label-width="auto"
                    >
                        <n-form-item path="name" label="姓名" :show-require-mark="true">
                            <n-input v-model:value="realNameModel.name" round placeholder="请输入真实姓名" />
                        </n-form-item>
                        <n-form-item path="idCard" label="身份证" :show-require-mark="true">
                            <n-input v-model:value="realNameModel.idCard" round placeholder="请输入身份证号" />
                        </n-form-item>
                        <n-row :gutter="[0, 24]">
                            <n-col :span="24">
                                <div style="display: flex; justify-content: flex-end">
                                    <n-button
                                        :loading="loadingRealName"
                                        :disabled="
                                            realNameModel.name === null ||
                                            realNameModel.idCard === null ||
                                            loadingRealName
                                        "
                                        round
                                        type="primary"
                                        @click="realNameHandleValidateButtonClick"
                                    >
                                        验证
                                    </n-button>
                                </div>
                            </n-col>
                        </n-row>
                    </n-form>
                </n-card>
                <n-card title="使用兑换码">
                    <n-form
                        ref="exchangeCodeFormRef"
                        :model="exchangeCodeModel"
                        :rules="exchangeCodeRules"
                        label-placement="left"
                        label-width="auto"
                    >
                        <n-form-item path="exchangeCode" label="兑换码" :show-require-mark="true">
                            <n-input
                                placeholder="请输入兑换码，如：XXXX-XXXX-XXXX-XXXX"
                                v-model:value="exchangeCodeModel.exchangeCode"
                                round
                            />
                        </n-form-item>
                        <n-row :gutter="[0, 24]">
                            <n-col :span="24">
                                <div style="display: flex; justify-content: flex-end">
                                    <n-button
                                        :loading="loadingGiftCode"
                                        :disabled="exchangeCodeModel.exchangeCode === null || loadingGiftCode"
                                        round
                                        type="primary"
                                        @click="giftcode"
                                    >
                                        验证
                                    </n-button>
                                </div>
                            </n-col>
                        </n-row>
                    </n-form>
                </n-card>
                <n-card style="display: flex; justify-content: center; margin-top: 15px">
                    <n-space justify="center">
                        <div
                            style="display: flex; align-items: center; justify-content: center; flex-direction: column"
                        >
                            <n-avatar :size="72" round :src="userInfo?.userimg" />
                            <div style="text-align: center">
                                <h3 style="margin: 0">
                                    Hi，{{ userInfo?.username }}
                                    <span style="color: gray; font-size: 14px">#{{ userInfo?.id }}</span>
                                </h3>
                                <p style="margin: 0; margin-top: 4px">{{ userInfo?.email }}</p>
                            </div>
                        </div>
                    </n-space>
                    <n-card :style="cardStyle" style="margin-top: 15px; text-align: center">
                        <n-descriptions
                            label-placement="top"
                            :column="screenWidth >= 600 ? 3 : 2"
                            label-align="center"
                            size="large"
                        >
                            <n-descriptions-item label="注册时间">
                                {{ userInfo?.regtime }}
                            </n-descriptions-item>
                            <n-descriptions-item label="QQ">
                                {{ userInfo?.qq }}
                            </n-descriptions-item>
                            <n-descriptions-item label="权限组">
                                {{ userInfo?.usergroup }}
                            </n-descriptions-item>
                            <n-descriptions-item label="到期时间">
                                {{ userInfo?.term }}
                            </n-descriptions-item>
                            <n-descriptions-item label="实名状态">
                                {{ userInfo?.realname }}
                            </n-descriptions-item>
                            <n-descriptions-item label="剩余积分">
                                {{ userInfo?.integral }}
                            </n-descriptions-item>
                            <n-descriptions-item label="隧道限制">
                                {{ userInfo?.tunnelCount }} / {{ userInfo?.tunnel }}
                            </n-descriptions-item>
                            <n-descriptions-item label="带宽限制">
                                国内{{ userInfo?.bandwidth }}m | 国外{{
                                    userInfo?.bandwidth ? userInfo.bandwidth * 4 : 0
                                }}m
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-card>
                    <div style="display: flex; justify-content: center">
                        <n-tag
                            v-if="!showNewContent"
                            round
                            :bordered="false"
                            type="primary"
                            style="margin-top: 15px"
                            @click="toggleContent"
                        >
                            点击显示Token
                            <template #icon>
                                <n-icon :component="KeyOutline" />
                            </template>
                        </n-tag>
                        <n-tag
                            round
                            v-if="showNewContent"
                            @click="copyAndToggleContent"
                            :bordered="false"
                            type="primary"
                            style="margin-top: 15px"
                        >
                            {{ userInfo?.usertoken }}
                        </n-tag>
                    </div>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
    <n-modal v-model:show="changeTheUsernameModal">
        <n-card style="width: 400px">
            <n-form ref="userNameFormRef" :model="userNameModel" :rules="updateUserNameRules">
                <n-form-item-row label="更改后的用户名" path="newUserName">
                    <n-input round v-model:value="userNameModel.newUserName" placeholder="请输入新的用户名" />
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                @click="resetUserName"
                :disabled="userNameModel.newUserName === null"
                :loading="loadingUpdateUserName"
                block
                secondary
                strong
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="modifyAvatarModal">
        <n-card style="width: 400px">
            <n-tabs
                class="card-tabs"
                default-value="Link"
                size="large"
                animated
                pane-wrapper-style="margin: 0 -4px"
                pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
            >
                <n-tab-pane name="Link" tab="图片链接">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        图片链接仅支持直链，且无反盗链的链接
                    </n-alert>
                    <n-form ref="userImageFormRef" :model="userImageModel" :rules="updateUserImageRules">
                        <n-form-item-row label="图片直链" path="newUserImage">
                            <n-input round v-model:value="userImageModel.newUserImage" placeholder="请输入图片直链" />
                        </n-form-item-row>
                        <n-button
                            round
                            type="primary"
                            block
                            :loading="loadingUpdateImg"
                            @click="resetUserImg"
                            secondary
                            strong
                            style="margin-top: 16px"
                        >
                            提交
                        </n-button>
                    </n-form>
                </n-tab-pane>
                <n-tab-pane name="QQ" tab="根据QQ">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        这里可以根据您绑定的QQ号自动获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48" :src="QQImg" />
                        <n-p>{{ userInfo?.qq }}</n-p>
                    </n-flex>
                    <n-button
                        round
                        type="primary"
                        block
                        :loading="loadingUpdateImg"
                        @click="setQQAvatar"
                        secondary
                        strong
                        style="margin-top: 16px"
                    >
                        提交
                    </n-button>
                </n-tab-pane>
                <n-tab-pane name="Cravatar" tab="Cravatar">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        根据您的邮箱绑定的Cravatar获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48" :src="CravatarImg" />
                        <n-p>{{ userInfo?.email }}</n-p>
                    </n-flex>
                    <n-button
                        round
                        type="primary"
                        block
                        :loading="loadingUpdateImg"
                        @click="setCravatarAvatar"
                        secondary
                        strong
                        style="margin-top: 16px"
                    >
                        提交
                    </n-button>
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </n-modal>
    <n-modal v-model:show="changePasswordModal">
        <n-card style="width: 400px">
            <n-form :model="resetPasswordValue" :rules="resetPasswordRules">
                <n-form-item-row label="原密码" path="original_password">
                    <n-input
                        round
                        type="password"
                        v-model:value="resetPasswordValue.original_password"
                        :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                        placeholder="请输入原密码"
                    />
                </n-form-item-row>
                <n-form-item-row label="新密码" path="new_password">
                    <n-input
                        round
                        type="password"
                        v-model:value="resetPasswordValue.new_password"
                        maxlength="48"
                        :show-password-on="isTouchDevice ? 'click' : 'mousedown'"
                        placeholder="请输入新密码"
                    />
                </n-form-item-row>
                <n-form-item-row label="重复新密码" path="reentered_new_password">
                    <n-input
                        round
                        type="password"
                        v-model:value="resetPasswordValue.reentered_new_password"
                        maxlength="48"
                        show-count
                        clearable
                        placeholder="请再次输入新密码"
                    />
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                @click="resetPassword"
                block
                secondary
                strong
                :loading="loadingUpdatePassword"
                :disabled="
                    !resetPasswordValue.original_password ||
                    !resetPasswordValue.new_password ||
                    !resetPasswordValue.reentered_new_password ||
                    loadingUpdatePassword
                "
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="changeTheMailboxModal">
        <n-card style="width: 400px">
            <n-form :model="{ old_code, newEmail, new_code }" :rules="resetEmailRules">
                <n-form-item-row label="旧邮箱验证码">
                    <n-grid cols="5" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="3">
                            <n-input round maxlength="6" v-model:value="old_code" placeholder="请输入6位验证码" />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button
                                        round
                                        :loading="oldLoadingCaptcha"
                                        @click="handleGeeTest('old')"
                                        :disabled="oldButtonDisabled"
                                        style="width: 100%"
                                        >{{ oldButtonText }}</n-button
                                    >
                                </template>
                                <n-card size="small"></n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
                <n-form-item-row label="新邮箱">
                    <n-input
                        round
                        maxlength="32"
                        v-model:value="newEmail"
                        show-count
                        clearable
                        placeholder="请输入新的邮箱"
                    />
                </n-form-item-row>
                <n-form-item-row label="新邮箱验证码">
                    <n-grid cols="5" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="3">
                            <n-input round maxlength="6" v-model:value="new_code" placeholder="请输入6位验证码" />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button
                                        round
                                        :loading="newLoadingCaptcha"
                                        @click="handleGeeTest('new')"
                                        :disabled="newButtonDisabled || !newEmail"
                                        style="width: 100%"
                                        >{{ newButtonText }}</n-button
                                    >
                                </template>
                                <n-card size="small"></n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                @click="resetEmail"
                :loading="LoadingResetEmail"
                block
                secondary
                strong
                :disabled="!newEmail || !old_code || !new_code"
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="changeQQModal">
        <n-card style="width: 400px">
            <n-form ref="qqFormRef" :model="qqModel" :rules="updateQQRules">
                <n-form-item-row label="新QQ号" path="newQQ">
                    <n-input
                        round
                        maxlength="20"
                        v-model:value="qqModel.newQQ"
                        show-count
                        clearable
                        placeholder="请输入新的QQ号"
                    />
                </n-form-item-row>
            </n-form>
            <n-button
                round
                type="primary"
                :disabled="qqModel.newQQ === null"
                :loading="loadingUpdateQQ"
                @click="resetQQ"
                block
                secondary
                strong
            >
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="deleteAccountVerificationModal">
        <n-card style="width: 500px" title="注销账户验证" :bordered="false" role="dialog" aria-modal="true">
            <n-alert type="warning"> 为了确保安全，我们需要对您的邮箱发送验证码，以确认本人操作。 </n-alert>
            <n-form style="margin-top: 16px">
                <n-form-item-row label="旧邮箱验证码">
                    <n-grid cols="5" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="3">
                            <n-input
                                round
                                maxlength="6"
                                v-model:value="deleteAccountCode"
                                placeholder="请输入6位验证码"
                            />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button
                                        round
                                        :loading="deleteAccountLoadingCaptcha"
                                        @click="deleteAccountGeeTest"
                                        :disabled="deleteAccountButtonDisabled"
                                        style="width: 100%"
                                        >{{ deleteAccountButtonText }}</n-button
                                    >
                                </template>
                                <n-card size="small"></n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
            </n-form>
            <template #footer>
                <n-flex justify="end">
                    <n-button round @click="deleteAccountTips">上一步</n-button>
                    <n-button
                        round
                        type="primary"
                        strong
                        secondary
                        @click="deleteAccountAtLastTips"
                        :loading="deleteAccountLoading"
                        >执行注销</n-button
                    >
                </n-flex>
            </template>
        </n-card>
    </n-modal>

    <!-- 模糊遮罩 -->
    <div
        v-show="showBlurOverlay"
        style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(var(--modal-filter));
            z-index: 9998;
            pointer-events: all;
        "
    ></div>
</template>

<script setup lang="ts">
import {
    KeyOutline,
    PersonOutline,
    ImageOutline,
    MailOutline,
    LockClosedOutline,
    ChatboxEllipsesOutline,
    TrashBinOutline,
    CodeDownloadOutline,
} from '@vicons/ionicons5';
import { ref, computed, reactive } from 'vue';
import { FormInst, FormRules } from 'naive-ui';
import { useStyleStore } from '@/stores/style';
import { useScreenStore } from '@/stores/useScreen';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import CryptoJS from 'crypto-js';
// 获取登录信息
import { useUserStore } from '@/stores/user';
import { useLoadUserInfo } from '@/components/useLoadUser';

import { inject } from 'vue';

import api from '@/api';
import {
    realNameRules,
    exchangeCodeRules,
    resetEmailRules,
    updateQQRules,
    updateUserNameRules,
    updateUserImageRules,
} from '@/utils/authRules';

const isTouchDevice = inject('isTouchDevice');

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());
const dialog = useDialog();
const message = useMessage();
const router = useRouter();

const loadingQianDao = ref(true); // 签到骨架屏加载状态

const showBlurOverlay = ref(false);

const loadingQianDaoButton = ref(false); // 签到按钮加载状态
const loadingUpdateImg = ref(false); // 用户名确定按钮加载状态
const loadingUpdateUserName = ref(false); // 用户名确定按钮加载状态
const loadingUpdateQQ = ref(false); // QQ确定按钮加载状态
const loadingUpdatePassword = ref(false);
const loadingRealName = ref(false);
const loadingGiftCode = ref(false);

const newEmail = ref('');
const oldButtonText = ref('发送验证码');
const newButtonText = ref('发送验证码');
const deleteAccountButtonText = ref('发送验证码');
const oldButtonDisabled = ref(false);
const newButtonDisabled = ref(false);
const deleteAccountButtonDisabled = ref(false);
const oldLoadingCaptcha = ref(false);
const newLoadingCaptcha = ref(false);
const deleteAccountLoadingCaptcha = ref(false);
const LoadingResetEmail = ref(false);
const countdownTime = 60;
const countdownAccountButton = ref(60);
const deleteAccountLoading = ref(false);

const old_code = ref();
const new_code = ref();
const deleteAccountCode = ref();

const QianDaoTest = ref('签到'); // 签到按钮默认文字
const resetPasswordValue = reactive({
    original_password: '',
    new_password: '',
    reentered_new_password: '',
});

const resetPasswordRules: FormRules = {
    original_password: [
        { required: true, message: '原密码不能为空', trigger: 'blur' },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input'],
        },
    ],
    new_password: [
        { required: true, message: '新密码不能为空', trigger: 'blur' },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input'],
        },
    ],
    reentered_new_password: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: (_rule, value) => {
                if (value !== resetPasswordValue.new_password) {
                    return new Error('两次输入的新密码不一致');
                }
                return true;
            },
            trigger: ['blur', 'input'],
        },
    ],
};

const QQImg = `https://q.qlogo.cn/headimg_dl?dst_uin=${userInfo?.qq}&spec=640&img_type=jpg`; // 根据QQ获取头像
const emailHash = CryptoJS.MD5(userInfo?.email || 'chaoji@chcat.cn').toString(); // md5加密邮箱
const CravatarImg = `https://cravatar.cn/avatar/${emailHash}`; // 根据Creavata获取头像

const changeTheUsernameModal = ref(false); // 更改 用户名 模态框状态
const modifyAvatarModal = ref(false); // 更改 头像 模态框状态
const changePasswordModal = ref(false); // 更改 密码 模态框状态
const changeTheMailboxModal = ref(false); // 更改 邮箱 模态框状态
const changeQQModal = ref(false); // 更改 QQ 模态框状态
const deleteAccountVerificationModal = ref(false);

const userNameFormRef = ref<FormInst | null>(null);
const qqFormRef = ref<FormInst | null>(null);
const userImageFormRef = ref<FormInst | null>(null);

const userNameModel = reactive({ newUserName: '' });
const qqModel = reactive({ newQQ: '' });
const userImageModel = reactive({ newUserImage: '' });

onMounted(() => {
    qiandaoinfo(); //加载签到信息
    useLoadUserInfo(); //更新用户信息
});

const remainingDays = computed(() => {
    if (!userInfo?.term) return 0;

    const termDate = new Date(userInfo.term);
    const today = new Date();

    const diffTime = termDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
});

const isTermExpiringSoon = computed(() => {
    return remainingDays.value < 7 && remainingDays.value >= 0;
});

const deleteAccountTips = () => {
    deleteAccountVerificationModal.value = false;
    dialog.warning({
        title: '警告',
        content:
            '注销账户后，您在本站的所有信息将被永久删除，无法恢复。如果您在本站购买了会员服务，注销账户后该服务将终止。请注意，账户注销后，您将不再受当前的服务条款和隐私策略约束，但与账户注销前产生的事务相关的法律义务仍将继续适用。',
        positiveText: '我接受',
        negativeText: '取消',
        onPositiveClick: () => {
            deleteAccountVerificationModal.value = true;
        },
    });
};

const deleteAccountAtLastTips = () => {
    dialog.warning({
        title: '警告',
        content: '注销账户立即执行，请确认注销，这是最后一道提示。',
        positiveText: '我确定',
        negativeText: '取消',
        onPositiveClick: () => {
            deleteAccount();
        },
    });
};

const deleteAccount = async () => {
    deleteAccountLoading.value = true;
    try {
        const response = await api.v2.user.deleteAccount(userInfo?.usertoken || '', deleteAccountCode.value);

        message.success(response.msg + '，账户注销成功');
        dialog.success({
            title: '账户注销成功',
            content: '您的账户已经成功注销，所有数据均已删除，期待下次与您相见！',
            positiveText: '好的',
            onPositiveClick: () => {
                userStore.clearUser();
                router.push('/sign');
            },
        });
    } catch (error) {
        message.error('注销账户失败: ' + (error as Error).message);
    }
    deleteAccountLoading.value = false;
};

const deleteAccountGeeTest = () => {
    deleteAccountLoadingCaptcha.value = true;
    window.initGeetest4(
        {
            product: 'bind',
            captchaId: '8253677cc86aae19e1b760f01d78ef27',
            width: '100%',
        },
        (captchaObj: CaptchaObj) => {
            captchaObj.showCaptcha();
            captchaObj.onClose(function () {
                message.warning('人机验证关闭');
                deleteAccountLoadingCaptcha.value = false;
            });
            captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate();
                if (result) {
                    sendDeleteAccountVerificationCode(result);
                }
            });
        }
    );
};

const sendDeleteAccountVerificationCode = async (geetestResult: GeetestResult) => {
    try {
        await api.v2.user.sendMailCode(
            'delete_account',
            userInfo?.email || '',
            geetestResult.lot_number,
            geetestResult.captcha_output,
            geetestResult.pass_token,
            geetestResult.gen_time
        );
        message.success('邮箱验证码发送成功');
        deleteAccountButtonDisabled.value = true;
        startDeleteAccountCountdown();
    } catch (error) {
        console.error('邮件发送失败: ', (error as Error).message);
    }
    deleteAccountLoadingCaptcha.value = false;
};

const startDeleteAccountCountdown = () => {
    deleteAccountButtonText.value = `重新发送(${countdownAccountButton.value}s)`;
    const interval = setInterval(() => {
        countdownAccountButton.value -= 1;
        deleteAccountButtonText.value = `重新发送(${countdownAccountButton.value}s)`;
        if (countdownAccountButton.value <= 0) {
            clearInterval(interval);
            deleteAccountButtonDisabled.value = false;
            deleteAccountButtonText.value = '发送验证码';
            countdownAccountButton.value = 60; // 重置倒计时
        }
    }, 1000);
};

const OfflineAllTunnels = () => {
    deleteAccountVerificationModal.value = false;
    dialog.warning({
        title: '警告',
        content: '此操作将会停止运行所有您正在运行中的隧道，且frp进程将会自动关闭。请确定此操作是您预期内的。',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {},
    });
};

const last_sign_in_time = ref('');
const total_points = ref(0);
const total_sign_ins = ref(0);
const count_of_matching_records = ref(0);
const is_signed_in_today = ref(false);
const qiandaoinfo = async () => {
    loadingQianDao.value = true;
    try {
        const response = await axios.get(`https://cf-v1.uapis.cn/api/qdxx.php?userid=${userInfo?.id}`);
        if (response.data.code === 200) {
            last_sign_in_time.value = response.data.last_sign_in_time;
            total_points.value = response.data.total_points;
            total_sign_ins.value = response.data.total_sign_ins;
            count_of_matching_records.value = response.data.count_of_matching_records;
            is_signed_in_today.value = response.data.is_signed_in_today;
        }
    } catch (error) {
        console.error('签到信息获取失败: ', error);
    }
    loadingQianDao.value = false;
};

const onSignButtonClick = () => {
    loadingQianDaoButton.value = true;
    QianDaoTest.value = '初始化验证[1/3]';
    window.initGeetest4(
        {
            product: 'bind',
            captchaId: '3891b578aa85e4866c5f8205b02b165a',
            width: '100%',
        },
        (captchaObj: CaptchaObj) => {
            captchaObj.onNextReady(function () {
                QianDaoTest.value = '验证码验证[2/3]';
            });
            captchaObj.showCaptcha();

            showBlurOverlay.value = true;

            captchaObj.onClose(function () {
                message.warning('签到验证关闭，此次签到未成功');
                showBlurOverlay.value = false;
                loadingQianDaoButton.value = false;
                QianDaoTest.value = '签到';
            });
            captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate();
                if (result) {
                    console.log('Geetest 验证成功:', result);
                    // 调用签到API
                    signIn(result);
                }
            });
        }
    );
};

const signIn = async (geetestResult: GeetestResult) => {
    QianDaoTest.value = '调用签到API[3/3]';

    try {
        const data = await api.v2.user.signIn(
            userInfo?.usertoken || '',
            geetestResult.lot_number,
            geetestResult.captcha_output,
            geetestResult.pass_token,
            geetestResult.gen_time
        );

        showBlurOverlay.value = false;
        loadingQianDaoButton.value = false;
        is_signed_in_today.value = true;
        dialog.success({
            title: '签到成功',
            content: data.msg,
            positiveText: '哇',
        });
    } catch (error) {
        showBlurOverlay.value = false;
        is_signed_in_today.value = false;
        loadingQianDaoButton.value = false;
        QianDaoTest.value = '签到';
        message.error('签到失败: ' + (error as Error).message);
    }
    setTimeout(() => {
        showBlurOverlay.value = false;
        is_signed_in_today.value = false;
        loadingQianDaoButton.value = false;
        QianDaoTest.value = '签到';
        qiandaoinfo();
    }, 3000);
};

const resetUserImg = async () => {
    try {
        await userImageFormRef.value?.validate();
    } catch (e) {
        message.warning('请输入图片链接');
        return;
    }
    loadingUpdateImg.value = true;
    try {
        const response = await api.v2.user.updateUserImage(userInfo?.usertoken || '', userImageModel.newUserImage);
        message.success(response.msg);
        modifyAvatarModal.value = false;
        userStore.setUser({ userimg: userImageModel.newUserImage });
    } catch (error) {
        message.error('修改头像失败: ' + (error as Error).message);
    } finally {
        loadingUpdateImg.value = false;
    }
};

const resetTokenAPI = async () => {
    try {
        await api.v2.user.resetToken(userInfo?.usertoken || '');

        message.success('TOKEN已重置，请重新登录');
        userStore.clearUser();
        router.push('/sign');
    } catch (error) {
        message.error('重置Token失败: ' + (error as Error).message);
    }
};

const resetQQ = async () => {
    try {
        await qqFormRef.value?.validate();
    } catch (errors) {
        message.warning('QQ号不能为空');
        return;
    }
    loadingUpdateQQ.value = true;
    try {
        const response = await api.v2.user.updateQQ(userInfo?.usertoken || '', qqModel.newQQ);
        message.success(response.msg);
        changeQQModal.value = false;
        userStore.setUser({ qq: qqModel.newQQ });
    } catch (error) {
        message.error('修改QQ失败: ' + (error as Error).message);
    }
    loadingUpdateQQ.value = false;
};

const resetUserName = async () => {
    try {
        await userNameFormRef.value?.validate();
    } catch (e: any) {
        // e 是一个对象，结构为 { newUserName: [{ message: 'xxx', ... }] }
        // 取第一个错误的 message
        const msg = e?.newUserName?.[0]?.message || '用户名校验未通过';
        message.warning(msg);
        return;
    }
    loadingUpdateUserName.value = true;
    try {
        const response = await api.v2.user.updateUserName(userInfo?.usertoken || '', userNameModel.newUserName);
        message.success(response.msg);
        changeTheUsernameModal.value = false;
        userStore.setUser({ username: userNameModel.newUserName });
    } catch (error) {
        message.error('修改用户名失败: ' + (error as Error).message);
    }
    loadingUpdateUserName.value = false;
};

const resetPassword = async () => {
    loadingUpdatePassword.value = true;
    try {
        const response = await api.v2.user.resetPassword(
            resetPasswordValue.original_password,
            resetPasswordValue.new_password,
            userInfo?.usertoken || ''
        );

        message.success(response.msg);
        changePasswordModal.value = false;
        userStore.clearUser();
        router.push('/sign');
    } catch (error) {
        message.error('修改密码失败: ' + (error as Error).message);
    }
    loadingUpdatePassword.value = false;
};

const handleGeeTest = (type: 'old' | 'new') => {
    const loadingCaptcha = type === 'old' ? oldLoadingCaptcha : newLoadingCaptcha;
    const buttonText = type === 'old' ? oldButtonText : newButtonText;
    const buttonDisabled = type === 'old' ? oldButtonDisabled : newButtonDisabled;
    const email = type === 'old' ? userInfo?.email : newEmail.value;

    loadingCaptcha.value = true;
    window.initGeetest4(
        {
            product: 'bind',
            captchaId: '8253677cc86aae19e1b760f01d78ef27',
            width: '100%',
        },
        (captchaObj: CaptchaObj) => {
            captchaObj.showCaptcha();
            captchaObj.onClose(() => {
                message.warning('人机验证关闭');
                loadingCaptcha.value = false;
            });
            captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate();
                if (result) {
                    sendVerificationCode(email || '', result, buttonText, buttonDisabled, loadingCaptcha);
                }
            });
        }
    );
};

const sendVerificationCode = async (
    email: string,
    geetestResult: GeetestResult,
    buttonText: Ref<string>,
    buttonDisabled: Ref<boolean>,
    loadingCaptcha: Ref<boolean>
) => {
    try {
        await api.v2.user.sendMailCode(
            'reset_email',
            email,
            geetestResult.lot_number,
            geetestResult.captcha_output,
            geetestResult.pass_token,
            geetestResult.gen_time
        );

        message.success('邮箱验证码发送成功');
        buttonDisabled.value = true;
        startCountdown(buttonText, buttonDisabled);
    } catch (error) {
        message.error('邮件发送失败: ' + (error as Error).message);
    } finally {
        loadingCaptcha.value = false;
    }
};

const startCountdown = (buttonText: Ref<string>, buttonDisabled: Ref<boolean>) => {
    let countdown = countdownTime;
    buttonText.value = `重新发送(${countdown}s)`;
    const interval = setInterval(() => {
        countdown -= 1;
        buttonText.value = `重新发送(${countdown}s)`;
        if (countdown <= 0) {
            clearInterval(interval);
            buttonDisabled.value = false;
            buttonText.value = '发送验证码';
        }
    }, 1000);
};

watch(newEmail, (newVal) => {
    newButtonDisabled.value = !newVal;
});

const resetEmail = async () => {
    LoadingResetEmail.value = true;
    try {
        const response = await api.v2.user.resetEmail(
            userInfo?.usertoken || '',
            newEmail.value,
            old_code.value,
            new_code.value
        );

        message.success(response.msg);
        changeTheMailboxModal.value = false;
        userStore.clearUser();
        router.push('/sign');
    } catch (error) {
        message.error('修改邮箱失败: ' + (error as Error).message);
    }
    LoadingResetEmail.value = false;
};

// 重置TOKEN提示框
const resetToken = () => {
    dialog.warning({
        title: '警告',
        content:
            '重置TOKEN后旧的配置文件均无法使用，这代表着您的所有隧道需要重新获取配置文件再启动、且所有保存登录的设备均需重新登录。',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            resetTokenAPI();
        },
    });
};

const giftcode = async () => {
    loadingGiftCode.value = true;
    try {
        const response = await axios.get(
            `https://cf-v1.uapis.cn/api/giftcode.php?usertoken=${userInfo?.usertoken}&userid=${userInfo?.id}&giftcode=${exchangeCodeModel.value.exchangeCode}`
        );
        if (response.data.success) {
            dialog.success({
                title: '兑换成功',
                content: '礼品码使用成功，内容:' + response.data.gift_value,
                positiveText: '好的',
            });
        } else {
            message.error(response.data.message);
        }
    } catch (error) {
        console.error('礼品码兑换API调用失败', error);
        message.error('礼品码兑换API调用失败' + error);
    }
    loadingGiftCode.value = false;
};

// 实名认证表单
interface RealNameModelType {
    name: string | null;
    idCard: string | null;
}

const realNameFormRef = ref<FormInst | null>(null);
const realNameModel = ref<RealNameModelType>({
    name: null,
    idCard: null,
});

const realNameHandleValidateButtonClick = async () => {
    if (!realNameFormRef.value?.validate()) {
        return;
    }
    loadingRealName.value = true;
    try {
        const formData = new FormData();
        formData.append('name', realNameModel.value.name || '');
        formData.append('idcard', realNameModel.value.idCard || '');
        formData.append('userid', userInfo?.id ? String(userInfo.id) : '');
        formData.append('usertoken', userInfo?.usertoken || '');
        const response = await axios.post('https://cf-v1.uapis.cn/api/realname.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        const data = response.data;
        if (data.status === 'success') {
            message.success('实名认证成功');
            userStore.setUser({ realname: '已实名' });
        } else {
            message.error(data.message);
            console.error('实名认证失败:', data.message);
        }
    } catch (error) {
        console.error('实名认证API调用失败:', error);
    }
    loadingRealName.value = false;
};

// 兑换码表单
interface ExchangeCodeType {
    exchangeCode: string | null;
}

const exchangeCodeFormRef = ref<FormInst | null>(null);
const exchangeCodeModel = ref<ExchangeCodeType>({
    exchangeCode: null,
});

// 显示token
const showNewContent = ref(false);

const toggleContent = () => {
    showNewContent.value = !showNewContent.value;
};

const copyAndToggleContent = () => {
    navigator.clipboard
        .writeText(userInfo?.usertoken || 'ChmlFrp账户Token复制失败')
        .then(() => {
            message.success('Token已复制到剪切板');
        })
        .catch((err) => {
            console.error('Token复制失败：', err);
            message.error('Token复制失败：', err);
        });
    toggleContent();
};

const openChangeTheUsernameModal = () => {
    changeTheUsernameModal.value = true;
};

const openModifyAvatarModal = () => {
    modifyAvatarModal.value = true;
};

const openChangePasswordModal = () => {
    changePasswordModal.value = true;
};

const openChangeTheMailboxModal = () => {
    changeTheMailboxModal.value = true;
};

const openChangeQQModal = () => {
    changeQQModal.value = true;
};

const settingCard = ref([
    {
        title: '重置token',
        subtitle: '重置后所有客户端均需重新登录',
        icon: markRaw(KeyOutline),
        click: resetToken,
    },
    {
        title: '修改用户名',
        subtitle: '点击这里可以修改您的用户名',
        icon: markRaw(PersonOutline),
        click: openChangeTheUsernameModal,
    },
    {
        title: '更改头像',
        subtitle: '不支持上传图片文件，请填写图片链接',
        icon: markRaw(ImageOutline),
        click: openModifyAvatarModal,
    },
    {
        title: '修改密码',
        subtitle: '点击这里可以修改您的登录密码',
        icon: markRaw(LockClosedOutline),
        click: openChangePasswordModal,
    },
    {
        title: '更改邮箱',
        subtitle: '此操作风险较大，请谨慎操作',
        icon: markRaw(MailOutline),
        click: openChangeTheMailboxModal,
    },
    {
        title: '更改QQ号',
        subtitle: '不正确的QQ号可能会影响到后续功能',
        icon: markRaw(ChatboxEllipsesOutline),
        click: openChangeQQModal,
    },
    {
        title: '下线所有隧道',
        subtitle: '一键下线所有运行中的隧道',
        icon: markRaw(CodeDownloadOutline),
        click: OfflineAllTunnels,
    },
    {
        title: '注销账户',
        subtitle: '注销ChmlFrp账户，删除账户所有信息',
        icon: markRaw(TrashBinOutline),
        click: deleteAccountTips,
    },
]);

const setQQAvatar = () => {
    userImageModel.newUserImage = QQImg;
    resetUserImg();
};

const setCravatarAvatar = () => {
    userImageModel.newUserImage = CravatarImg;
    resetUserImg();
};
</script>
