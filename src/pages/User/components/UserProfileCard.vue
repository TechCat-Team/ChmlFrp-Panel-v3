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
                    国内{{ userInfo?.bandwidth }}m | 国外{{ userInfo?.bandwidth ? userInfo.bandwidth * 4 : 0 }}m
                </n-descriptions-item>
            </n-descriptions>
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
import { useMessage } from 'naive-ui';
import { useScreenStore } from '@/stores/useScreen';
import { useStyleStore } from '@/stores/style';
import { storeToRefs } from 'pinia';
import { KeyOutline } from '@vicons/ionicons5';

interface Props {
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
