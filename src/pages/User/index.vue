<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <SystemMessagesCard />
                <UserSettingsCard :settings="settingCard">
                    <template #header-extra>
                        <n-skeleton v-if="loadingQianDao" :width="56" round :sharp="false" size="medium" />
                        <div v-else>
                            <n-button
                                v-if="!signInInfo.is_signed_in_today"
                                round
                                :loading="loadingQianDaoButton && !signedInSuccess"
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
                                上次签到时间：{{ signInInfo.last_sign_in_time || '暂无数据' }}<br />
                                累计签到积分：{{ signInInfo.total_points || '暂无数据' }}<br />
                                累计签到次数：{{ signInInfo.total_sign_ins || '暂无数据' }}<br />
                                今日签到人数：{{ signInInfo.count_of_matching_records || 0 }}
                            </n-thing>
                        </n-popover>
                    </template>
                </UserSettingsCard>
            </n-gi>
            <n-gi :span="2">
                <RealNameForm
                    :loading="loadingRealName"
                    :model="realNameModel"
                    :user-info="userInfo ? { realname: userInfo.realname } : undefined"
                    :on-submit="submitRealName"
                />
                <ExchangeCodeForm
                    :loading="loadingGiftCode"
                    :model="exchangeCodeModel"
                    :on-submit="submitExchangeCode"
                    :history-loading="loadingGiftcardHistory"
                    :history-data="historyData"
                    :on-view-history="loadHistory"
                />
                <UserProfileCard
                    :user-info="
                        userInfo
                            ? {
                                  userimg: userInfo.userimg,
                                  username: userInfo.username,
                                  id: userInfo.id,
                                  email: userInfo.email,
                                  regtime: userInfo.regtime,
                                  qq: userInfo.qq,
                                  usergroup: userInfo.usergroup,
                                  term: userInfo.term,
                                  realname: userInfo.realname,
                                  integral: userInfo.integral,
                                  tunnelCount: userInfo.tunnelCount,
                                  tunnel: userInfo.tunnel,
                                  bandwidth: userInfo.bandwidth,
                                  usertoken: userInfo.usertoken,
                              }
                            : undefined
                    "
                />
            </n-gi>
        </n-grid>
    </n-flex>
    <ChangeUsernameModal
        v-model:show="changeTheUsernameModal"
        :loading="loadingUpdateUserName"
        :model="userNameModel"
        :on-submit="handleResetUserName"
    />
    <ChangeAvatarModal
        v-model:show="modifyAvatarModal"
        :loading="loadingUpdateImg"
        :model="userImageModel"
        :qq-img="QQImg"
        :cravatar-img="CravatarImg"
        :qq="userInfo?.qq"
        :email="userInfo?.email"
        :on-submit="handleResetUserImg"
        :on-set-q-q-avatar="handleSetQQAvatar"
        :on-set-cravatar-avatar="handleSetCravatarAvatar"
    />
    <ChangePasswordModal
        v-model:show="changePasswordModal"
        :loading="loadingUpdatePassword"
        :model="resetPasswordValue"
        :on-submit="resetPassword"
    />
    <ChangeEmailModal
        v-model:show="changeTheMailboxModal"
        v-model:old-code="oldCode"
        v-model:new-email="newEmail"
        v-model:new-code="newCode"
        :loading="loadingResetEmail"
        :old-button-text="oldButtonText"
        :new-button-text="newButtonText"
        :old-button-disabled="oldButtonDisabled"
        :new-button-disabled="newButtonDisabled"
        :old-loading-captcha="oldLoadingCaptcha"
        :new-loading-captcha="newLoadingCaptcha"
        :on-gee-test="handleGeeTest"
        :on-submit="handleResetEmail"
    />
    <ChangeQQModal
        v-model:show="changeQQModal"
        :loading="loadingUpdateQQ"
        :model="qqModel"
        :on-submit="handleResetQQ"
    />
    <DeleteAccountModal
        v-model:show="deleteAccountVerificationModal"
        v-model:code="deleteAccountCode"
        :loading="deleteAccountLoading"
        :loading-captcha="deleteAccountLoadingCaptcha"
        :button-disabled="deleteAccountButtonDisabled"
        :button-text="deleteAccountButtonText"
        :on-gee-test="handleDeleteAccountGeeTest"
        :on-back="showDeleteAccountTips"
        :on-submit="showFinalWarning"
    />

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
import { ref, computed, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useLoadUserInfo } from '@/components/useLoadUser';

// Composables
import { useSignIn } from './composables/useSignIn';
import { useRealName } from './composables/useRealName';
import { useExchangeCode } from './composables/useExchangeCode';
import { useGiftcardHistory } from './composables/useGiftcardHistory';
import { useEmailVerification } from './composables/useEmailVerification';
import { useAccountDeletion } from './composables/useAccountDeletion';
import { useUserSettings, createSettingsCards } from './composables/useUserSettings';
import { useUserProfile } from './composables/useUserProfile';
import { useUserUpdates } from './composables/useUserUpdates';

// Components
import SystemMessagesCard from './components/SystemMessagesCard.vue';
import UserSettingsCard from './components/UserSettingsCard.vue';
import UserProfileCard from './components/UserProfileCard.vue';
import RealNameForm from './components/RealNameForm.vue';
import ExchangeCodeForm from './components/ExchangeCodeForm.vue';
import ChangeUsernameModal from './components/ChangeUsernameModal.vue';
import ChangeAvatarModal from './components/ChangeAvatarModal.vue';
import ChangePasswordModal from './components/ChangePasswordModal.vue';
import ChangeEmailModal from './components/ChangeEmailModal.vue';
import ChangeQQModal from './components/ChangeQQModal.vue';
import DeleteAccountModal from './components/DeleteAccountModal.vue';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

// Composables
const {
    loading: loadingQianDao,
    loadingButton: loadingQianDaoButton,
    qianDaoText: QianDaoTest,
    signedInSuccess,
    showBlurOverlay,
    signInInfo,
    fetchSignInInfo,
    onSignButtonClick,
} = useSignIn(userInfo || {});

const { loading: loadingRealName, model: realNameModel, submit: submitRealName } = useRealName(userInfo || {});

const {
    loading: loadingGiftCode,
    model: exchangeCodeModel,
    submit: submitExchangeCode,
} = useExchangeCode(userInfo || {});

const { loading: loadingGiftcardHistory, historyData, loadHistory } = useGiftcardHistory(userInfo || {});

const {
    oldButtonText,
    newButtonText,
    oldButtonDisabled,
    newButtonDisabled,
    oldLoadingCaptcha,
    newLoadingCaptcha,
    oldCode,
    newCode,
    handleGeeTest: handleEmailGeeTest,
} = useEmailVerification();

const {
    showModal: deleteAccountVerificationModal,
    loading: deleteAccountLoading,
    loadingCaptcha: deleteAccountLoadingCaptcha,
    buttonDisabled: deleteAccountButtonDisabled,
    buttonText: deleteAccountButtonText,
    code: deleteAccountCode,
    showDeleteAccountTips,
    showFinalWarning,
    handleGeeTest: handleDeleteAccountGeeTest,
} = useAccountDeletion(userInfo || {});
const newEmail = ref('');

// User Settings & Updates
const { loadingOfflineAllTunnels, resetToken, offlineAllTunnels } = useUserSettings(userInfo || {});
const { QQImg, CravatarImg } = useUserProfile(userInfo ? { qq: userInfo.qq, email: userInfo.email } : undefined);
const {
    loadingUpdateImg,
    loadingUpdateUserName,
    loadingUpdateQQ,
    loadingUpdatePassword,
    loadingResetEmail,
    userNameModel,
    qqModel,
    userImageModel,
    resetPasswordValue,
    resetUserImg,
    resetUserName,
    resetQQ,
    resetPassword,
    resetEmail: resetEmailAPI,
} = useUserUpdates();

const changeTheUsernameModal = ref(false);
const modifyAvatarModal = ref(false);
const changePasswordModal = ref(false);
const changeTheMailboxModal = ref(false);
const changeQQModal = ref(false);

onMounted(() => {
    fetchSignInInfo();
    useLoadUserInfo();
});

const handleResetUserImg = async () => {
    const success = await resetUserImg();
    if (success) {
        modifyAvatarModal.value = false;
    }
};

const handleResetUserName = async () => {
    const success = await resetUserName();
    if (success) {
        changeTheUsernameModal.value = false;
    }
};

const handleResetQQ = async () => {
    const success = await resetQQ();
    if (success) {
        changeQQModal.value = false;
    }
};

const handleResetEmail = () => {
    resetEmailAPI(newEmail.value, oldCode.value, newCode.value);
    changeTheMailboxModal.value = false;
};

const handleSetQQAvatar = () => {
    userImageModel.newUserImage = QQImg.value;
    handleResetUserImg();
};

const handleSetCravatarAvatar = () => {
    userImageModel.newUserImage = CravatarImg.value;
    handleResetUserImg();
};

const handleGeeTest = async (type: 'old' | 'new') => {
    const email = type === 'old' ? userInfo?.email || '' : newEmail.value;
    handleEmailGeeTest(type, email);
};

watch(newEmail, (newVal) => {
    newButtonDisabled.value = !newVal;
});

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

const settingCard = computed(() =>
    createSettingsCards(
        {
            resetToken,
            openChangeUsername: openChangeTheUsernameModal,
            openModifyAvatar: openModifyAvatarModal,
            openChangePassword: openChangePasswordModal,
            openChangeEmail: openChangeTheMailboxModal,
            openChangeQQ: openChangeQQModal,
            offlineAllTunnels,
            showDeleteAccountTips,
        },
        loadingOfflineAllTunnels.value
    )
);
</script>
