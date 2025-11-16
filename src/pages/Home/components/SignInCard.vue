<template>
    <n-space justify="end" style="margin-top: 15px">
        <n-skeleton v-if="loading" :width="56" :sharp="false" size="medium" />
        <div v-else>
            <n-button
                v-if="!signInInfo.is_signed_in_today"
                :loading="loadingButton && !signedInSuccess"
                type="primary"
                strong
                secondary
                @click="onSignButtonClick"
            >
                <template v-if="signedInSuccess">
                    <n-icon>
                        <CheckmarkCircle />
                    </n-icon>
                </template>
                <template v-else>
                    {{ qianDaoText }}
                </template>
            </n-button>
            <n-tooltip v-else>
                <template #trigger>
                    <n-button type="primary" strong secondary disabled tag="div"> 签到 </n-button>
                </template>
                您今天已经签到过啦
            </n-tooltip>
        </div>
        <n-popover trigger="hover" style="border-radius: 8px">
            <template #trigger>
                <n-skeleton v-if="loading" :width="84" :sharp="false" size="medium" />
                <n-button v-else strong secondary>签到信息</n-button>
            </template>
            <n-thing title="统计信息" content-style="margin-top: 10px;">
                上次签到时间：{{ signInInfo.last_sign_in_time || '暂无数据' }}<br />
                累计签到积分：{{ signInInfo.total_points || '暂无数据' }}<br />
                累计签到次数：{{ signInInfo.total_sign_ins || '暂无数据' }}<br />
                今日签到人数：{{ signInInfo.count_of_matching_records || 0 }}
            </n-thing>
        </n-popover>
    </n-space>
</template>

<script lang="ts" setup>
import { CheckmarkCircle } from '@vicons/ionicons5';
import type { SignInInfo } from '../types';

interface Props {
    loading: boolean;
    loadingButton: boolean;
    qianDaoText: string;
    signedInSuccess: boolean;
    signInInfo: SignInInfo;
    onSignButtonClick: () => void;
}

defineProps<Props>();
</script>

