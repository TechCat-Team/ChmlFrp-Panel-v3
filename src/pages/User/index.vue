<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card style="margin-bottom: 15px">
                    <n-alert
                        title="提示"
                        type="warning"
                        v-if="userInfo?.realname === '未实名'"
                        style="margin-bottom: 8px; cursor: pointer"
                        @click="openRealnameConsole"
                    >
                        您尚未实名，请前往轻爪账户控制台（点击跳转）完成实名认证。根据中国法律规定，未实名将无法使用ChmlFrp提供的服务。
                        <template #action>
                            <n-button text type="warning" @click.stop="openRealnameConsole">前往实名</n-button>
                        </template>
                    </n-alert>
                    <n-alert type="info" title="提示" style="cursor: pointer" @click="openAccountConsole">
                        如果要更改账户信息，请前往轻爪账户控制台（点击跳转）
                        <template #action>
                            <n-button text type="primary" @click.stop="openAccountConsole">前往控制台</n-button>
                        </template>
                    </n-alert>
                </n-card>
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
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useLoadUserInfo } from '@/components/useLoadUser';

// Composables
import { useSignIn } from './composables/useSignIn';
import { useExchangeCode } from './composables/useExchangeCode';
import { useGiftcardHistory } from './composables/useGiftcardHistory';
import { useUserSettings, createSettingsCards } from './composables/useUserSettings';

// Components
import SystemMessagesCard from './components/SystemMessagesCard.vue';
import UserSettingsCard from './components/UserSettingsCard.vue';
import UserProfileCard from './components/UserProfileCard.vue';
import ExchangeCodeForm from './components/ExchangeCodeForm.vue';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

// Composables
const {
    loading: loadingQianDao,
    loadingButton: loadingQianDaoButton,
    qianDaoText: QianDaoTest,
    signedInSuccess,
    signInInfo,
    fetchSignInInfo,
    onSignButtonClick,
} = useSignIn(userInfo || {});

const {
    loading: loadingGiftCode,
    model: exchangeCodeModel,
    submit: submitExchangeCode,
} = useExchangeCode(userInfo || {});

const { loading: loadingGiftcardHistory, historyData, loadHistory } = useGiftcardHistory(userInfo || {});

// User Settings & Updates
const { resetToken, offlineAllTunnels, openAccountConsole } = useUserSettings();

const openRealnameConsole = () => {
    window.location.href = 'https://account.qzhua.net/console?tab=realname';
};

onMounted(() => {
    fetchSignInInfo();
    useLoadUserInfo();
});

const settingCard = computed(() =>
    createSettingsCards({
        resetToken,
        offlineAllTunnels,
    })
);
</script>
