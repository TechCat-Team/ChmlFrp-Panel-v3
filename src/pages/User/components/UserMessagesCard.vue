<template>
    <n-card title="消息">
        <n-alert v-if="userInfo?.usergroup === '封禁'" title="您的账户已被封禁" type="error" style="margin-bottom: 10px">
            理由：理由信息正在开发中，如果想知道具体原因请联系QQ：242247494
        </n-alert>
        <n-alert v-if="userInfo?.realname === '未实名'" title="未实名通知" type="warning" style="margin-bottom: 10px">
            您尚未实名，请前往右侧实名认证填写处进行实名，每位用户提供3次免费实名，次数耗尽后请联系QQ242247494进行重置。我们允许14岁以上人群实名，但请不要使用非本人身份证实名。
        </n-alert>
        <n-alert v-if="isTermExpiringSoon" title="您的会员即将到期" type="info" style="margin-bottom: 10px">
            您的ChmlFrp{{ userInfo?.usergroup }}将于 {{ userInfo?.term }} 到期，剩余 {{ remainingDays }} 天，请及时续费。
        </n-alert>
    </n-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
    userInfo?: {
        usergroup?: string;
        realname?: string;
        term?: string;
    };
    remainingDays: number;
}

const props = defineProps<Props>();

const isTermExpiringSoon = computed(() => {
    return props.remainingDays < 7 && props.remainingDays >= 0;
});
</script>

