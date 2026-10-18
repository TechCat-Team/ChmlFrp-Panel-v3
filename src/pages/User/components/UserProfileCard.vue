<template>
    <n-card style="display: flex; justify-content: center; margin-top: 15px">
        <n-space justify="center">
            <div style="display: flex; align-items: center; justify-content: center; flex-direction: column">
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
                    {{ formattedRegtime }}
                </n-descriptions-item>
                <n-descriptions-item label="QQ">
                    {{ userInfo?.qq }}
                </n-descriptions-item>
                <n-descriptions-item label="权限组">
                    {{ userInfo?.usergroup }}
                </n-descriptions-item>
                <n-descriptions-item label="会员到期时间">
                    {{ formattedTerm }}
                </n-descriptions-item>
                <n-descriptions-item v-if="showAccountBan" label="账户封禁期限">
                    {{ formattedAccountBanTerm }}
                </n-descriptions-item>
                <n-descriptions-item label="实名状态">
                    {{ userInfo?.realname }}
                </n-descriptions-item>
                <n-descriptions-item label="剩余积分">
                    <RouterLink :to="{ name: '积分明细' }" class="integral-link">
                        {{ userInfo?.integral }}
                    </RouterLink>
                </n-descriptions-item>
                <n-descriptions-item label="隧道限制">
                    {{ userInfo?.tunnelCount }} / {{ userInfo?.tunnel }}
                </n-descriptions-item>
                <n-descriptions-item label="带宽限制">
                    国内{{ userInfo?.bandwidth }}m | 国外{{ userInfo?.bandwidth ? userInfo.bandwidth * 4 : 0 }}m
                </n-descriptions-item>
            </n-descriptions>
            <n-text v-if="showAccountBan" depth="3" style="display: block; margin-top: 12px">
                会员到期不会自动解除封禁，解封后按实际会员有效期恢复权益。
            </n-text>
        </n-card>
        <div style="display: flex; justify-content: center">
            <n-tag
                v-if="!showToken"
                round
                :bordered="false"
                type="primary"
                style="margin-top: 15px"
                @click="toggleToken"
            >
                点击显示Token
                <template #icon>
                    <n-icon :component="KeyOutline" />
                </template>
            </n-tag>
            <n-tag round v-if="showToken" @click="copyToken" :bordered="false" type="primary" style="margin-top: 15px">
                {{ userInfo?.usertoken }}
            </n-tag>
        </div>
    </n-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useScreenStore } from '@/stores/useScreen';
import { useStyleStore } from '@/stores/style';
import { storeToRefs } from 'pinia';
import { KeyOutline } from '@vicons/ionicons5';
import { formatApiDateTime, isLifetimeTerm } from '@/utils/formatApiDateTime';
import { summarizeAccountBan } from '@/utils/accountBan';
import type { MyBanRecord } from '@/api/v2/user/violation';

interface Props {
    banRecords?: MyBanRecord[] | null;
    banRecordsLoading?: boolean;
    userInfo?: {
        userimg?: string;
        username?: string;
        id?: number;
        email?: string;
        regtime?: string;
        qq?: string;
        usergroup?: string;
        term?: string;
        realname?: string;
        integral?: number;
        tunnelCount?: number;
        tunnel?: number;
        bandwidth?: number;
        usertoken?: string;
    };
}

const props = defineProps<Props>();
const message = useMessage();

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);
const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());
const formattedRegtime = computed(() => formatApiDateTime(props.userInfo?.regtime, { omitMidnight: true }));
const formattedTerm = computed(() =>
    isLifetimeTerm(props.userInfo?.term)
        ? '永久'
        : formatApiDateTime(props.userInfo?.term, { omitMidnight: true, fallback: '—' })
);
const accountBan = computed(() => summarizeAccountBan(props.banRecords ?? []));
const showAccountBan = computed(() => props.userInfo?.usergroup === '封禁' || accountBan.value.status !== 'none');
const formattedAccountBanTerm = computed(() => {
    if (props.banRecordsLoading) return '加载中';
    if (props.banRecords == null) return '获取失败，请刷新封禁记录';
    if (accountBan.value.status === 'permanent') return '永久（需审核解封）';
    if (accountBan.value.status === 'temporary') {
        return formatApiDateTime(new Date(accountBan.value.expiresAt).toISOString());
    }
    return '请查看封禁记录或联系管理员';
});

const showToken = ref(false);

const toggleToken = () => {
    showToken.value = !showToken.value;
};

const copyToken = () => {
    navigator.clipboard
        .writeText(props.userInfo?.usertoken || 'ChmlFrp账户Token复制失败')
        .then(() => {
            message.success('Token已复制到剪切板');
        })
        .catch((err) => {
            console.error('Token复制失败：', err);
            message.error('Token复制失败：' + err);
        });
    toggleToken();
};
</script>

<style scoped>
.integral-link {
    color: inherit;
    text-decoration: none;
}
</style>
