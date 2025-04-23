<template>
    <n-back-top :right="100" />
    <n-card size="small">
        <n-alert title="购买须知" type="warning">
            购买后积分不退还。多次购买同一套餐则增加对应会员时长，如果要升级会员请选择升级会员。
        </n-alert>
    </n-card>
    <n-grid style="margin-top: 12px" :x-gap="12" :y-gap="12" cols="1 s:2 m:3 l:4" responsive="screen">
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    免费用户
                </template>
                <n-ul>
                    <n-li>节点权限：普通节点</n-li>
                    <n-li>国内节点速率限制：8m</n-li>
                    <n-li>国外节点速率限制：32m</n-li>
                    <n-li>流量限制：无限制</n-li>
                    <n-li>隧道数量：4条</n-li>
                    <n-li>二级域名数量：2条</n-li>
                    <n-li>免费SSL数量：1条</n-li>
                    <n-li>官方技术支持：不支持</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>0积分/月</n-p>
                        <n-button round disabled type="error" size="small">注册即得</n-button>
                    </n-flex>
                </template>
            </n-card>
            <n-card hoverable class="anniversary-card perk-card">
                <n-flex vertical align="center" justify="center" class="thank-you-content">
                    <n-flex align="center" justify="center" class="celebration-header">
                        <n-text strong type="error" style="font-size: 20px; margin-left: 8px;">
                            我们四岁啦！🎉
                        </n-text>
                    </n-flex>
                    <n-flex vertical align="center" class="thank-you-message">
                        <n-text depth="2" style="text-align: center; line-height: 1.6;" class="perk-desc">
                            ChmlFrp运营至今已满4周年，<br>
                            感谢您一直以来的信任与支持。<br>
                            四年坚持，初心不改；<br>
                            免费服务，始终无广。
                        </n-text>

                        <n-space vertical align="center" style="margin-top: 16px;">
                            <n-text depth="3" style="font-size: 12px;">
                                因为有您，我们才能走得更远
                            </n-text>
                        </n-space>
                    </n-flex>
                </n-flex>
            </n-card>

        </n-grid-item>
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    普通会员
                </template>
                <n-ul>
                    <n-li>节点权限：普通/会员节点</n-li>
                    <n-li>国内节点速率限制：16m</n-li>
                    <n-li>国外节点速率限制：64m</n-li>
                    <n-li>隧道数量：8条</n-li>
                    <n-li>流量限制：无限制</n-li>
                    <n-li>二级域名数量：4条</n-li>
                    <n-li>免费SSL数量：2条</n-li>
                    <n-li>官方技术支持：不支持</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>8000积分/月</n-p>
                        <n-button @click="show = true" round type="primary" size="small">立即购买</n-button>
                    </n-flex>
                </template>
            </n-card>
            <n-card hoverable class="perk-card">
                <n-flex vertical>
                    <n-flex align="center">
                        <n-icon size="20" color="#F56C6C">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                    fill="currentColor" />
                            </svg>
                        </n-icon>
                        <n-text strong>四周年福利</n-text>
                    </n-flex>
                    <n-text depth="2" class="perk-desc">永久会员仅需80元。一次性付费终生使用。</n-text>
                    <n-button tertiary type="error" size="small" class="perk-btn">购买永久会员</n-button>
                </n-flex>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    高级会员
                </template>
                <n-ul>
                    <n-li>节点权限：普通/会员节点</n-li>
                    <n-li>国内节点速率限制：24m</n-li>
                    <n-li>国外节点速率限制：96m</n-li>
                    <n-li>隧道数量：12条</n-li>
                    <n-li>流量限制：无限制</n-li>
                    <n-li>二级域名数量：8条</n-li>
                    <n-li>免费SSL数量：4条</n-li>
                    <n-li>官方技术支持：每月1次</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>12000积分/月</n-p>
                        <n-button @click="show = true" round type="primary" size="small">立即购买</n-button>
                    </n-flex>
                </template>
            </n-card>
            <n-card hoverable class="perk-card">
                <n-flex vertical>
                    <n-flex align="center">
                        <n-icon size="20" color="#F56C6C">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                    fill="currentColor" />
                            </svg>
                        </n-icon>
                        <n-text strong>四周年福利</n-text>
                    </n-flex>
                    <n-text depth="2" class="perk-desc">永久会员仅需120元。一次性付费终生使用。</n-text>
                    <n-button tertiary type="error" size="small" class="perk-btn">购买永久会员</n-button>
                </n-flex>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card hoverable>
                <template #header>
                    超级会员
                </template>
                <n-ul>
                    <n-li>节点权限：普通/会员节点</n-li>
                    <n-li>国内节点速率限制：32m</n-li>
                    <n-li>国外节点速率限制：128m</n-li>
                    <n-li>隧道数量：16条</n-li>
                    <n-li>流量限制：无限制</n-li>
                    <n-li>二级域名数量：16条</n-li>
                    <n-li>免费SSL数量：12条</n-li>
                    <n-li>官方技术支持：每月2次</n-li>
                </n-ul>
                <template #action>
                    <n-flex justify="space-between">
                        <n-p>18000积分/月</n-p>
                        <n-button @click="show = true" round type="primary" size="small">立即购买</n-button>
                    </n-flex>
                </template>
            </n-card>
            <n-card hoverable class="perk-card">
                <n-flex vertical>
                    <n-flex align="center">
                        <n-icon size="20" color="#F56C6C">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                    fill="currentColor" />
                            </svg>
                        </n-icon>
                        <n-text strong>四周年福利</n-text>
                    </n-flex>
                    <n-text depth="2" class="perk-desc">永久会员仅需160元。一次性付费终生使用。</n-text>
                    <n-button tertiary type="error" size="small" class="perk-btn">购买永久会员</n-button>
                </n-flex>
            </n-card>
        </n-grid-item>
    </n-grid>
    <n-drawer v-model:show="show" :width="502" style="max-width: 100%">
        <n-drawer-content title="会员购买" closable>
            <n-tabs type="segment" animated>
                <n-tab-pane name="1" tab="会员购买">
                    <n-space vertical size="large">
                        <!-- 会员购买选项 -->
                        <n-card title="选择会员类型">
                            <n-radio-group v-model:value="selectedMembership">
                                <n-space justify="space-between" size="large">
                                    <n-radio value="普通会员" label="普通会员">
                                        <n-space align="center">
                                            <n-tag type="info" size="small">普通会员</n-tag>
                                        </n-space>
                                    </n-radio>
                                    <n-radio value="高级会员" label="高级会员">
                                        <n-space align="center">
                                            <n-tag type="success" size="small">高级会员</n-tag>
                                        </n-space>
                                    </n-radio>
                                    <n-radio value="超级会员" label="超级会员">
                                        <n-space align="center">
                                            <n-tag type="warning" size="small">超级会员</n-tag>
                                        </n-space>
                                    </n-radio>
                                </n-space>
                            </n-radio-group>
                        </n-card>

                        <!-- 购买时长选项 -->
                        <n-card title="选择购买时长">
                            <n-radio-group v-model:value="selectedDuration">
                                <n-space justify="space-between">
                                    <n-radio value="1" :label="`1个月`"></n-radio>
                                    <n-radio value="3" :label="`3个月`"></n-radio>
                                    <n-radio value="6" :label="`6个月`"></n-radio>
                                    <n-radio value="12" :label="`1年`"></n-radio>
                                </n-space>
                            </n-radio-group>
                        </n-card>

                        <!-- 积分详情 -->
                        <n-card title="积分详情" hoverable>
                            <n-space vertical size="small">
                                <n-space justify="space-between">
                                    <n-text>当前积分：</n-text>
                                    <n-text strong>{{ currentPoints }}</n-text>
                                </n-space>
                                <n-space justify="space-between">
                                    <n-text>本次消费：</n-text>
                                    <n-text strong type="error">{{ costPoints }}</n-text>
                                </n-space>
                                <n-divider />
                                <n-space justify="space-between">
                                    <n-text>购买后剩余：</n-text>
                                    <n-text strong type="success">{{ remainingPoints }}</n-text>
                                </n-space>
                            </n-space>
                        </n-card>

                        <!-- 购买按钮 -->
                        <n-button type="primary" block :disabled="!selectedMembership || !selectedDuration || costPoints > currentPoints"
                            @click="handlePurchase">
                            确认购买
                        </n-button>
                    </n-space>
                </n-tab-pane>

                <!-- 会员升级标签页 -->
                <n-tab-pane name="2" tab="会员升级">
                    <n-space vertical size="large">
                        <n-alert type="info" title="会员升级说明" v-if="userInfo?.term !== '9999-09-09' && currentMembership !== '免费用户' && currentMembership !== '超级会员'">
                            您当前是{{ currentMembership }}，剩余 {{ remainingDays }} 天，升级可享受更多权益
                        </n-alert>

                        <n-card title="可升级选项">
                            <n-space vertical size="large">
                                <template v-if="currentMembership === '免费用户'">
                                    <n-text>您当前为免费用户，无法升级，如需会员请先购买</n-text>
                                </template>
                                <template v-else-if="userInfo?.term === '9999-09-09'">
                                    <n-text>您当前为永久会员，无法进行常规升级</n-text>
                                </template>
                                <template v-else-if="currentMembership === '普通会员'">
                                    <n-radio-group v-model:value="upgradeOption">
                                        <n-space justify="space-between">
                                            <n-radio value="高级会员" label="升级到高级会员">
                                                <n-space align="center">
                                                    <n-tag type="success" size="small">高级会员</n-tag>
                                                </n-space>
                                            </n-radio>
                                            <n-radio value="超级会员" label="升级到超级会员">
                                                <n-space align="center">
                                                    <n-tag type="warning" size="small">超级会员</n-tag>
                                                </n-space>
                                            </n-radio>
                                        </n-space>
                                    </n-radio-group>
                                </template>
                                <template v-else-if="currentMembership === '高级会员'">
                                    <n-radio-group v-model:value="upgradeOption">
                                        <n-space justify="space-between">
                                            <n-radio value="超级会员" label="升级到超级会员">
                                                <n-space align="center">
                                                    <n-tag type="warning" size="small">超级会员</n-tag>
                                                </n-space>
                                            </n-radio>
                                        </n-space>
                                    </n-radio-group>
                                </template>
                                <template v-else>
                                    <n-text>您已经是最高级会员，无需升级</n-text>
                                </template>
                            </n-space>
                        </n-card>

                        <n-card title="积分详情" hoverable>
                            <n-space vertical size="small">
                                <n-space justify="space-between">
                                    <n-text>当前积分：</n-text>
                                    <n-text strong>{{ currentPoints }}</n-text>
                                </n-space>
                                <n-space justify="space-between">
                                    <n-text>升级费用：</n-text>
                                    <n-text strong type="error">{{ upgradeCost }}</n-text>
                                </n-space>
                                <n-divider />
                                <n-space justify="space-between">
                                    <n-text>升级后剩余：</n-text>
                                    <n-text strong type="success">{{ remainingPointsAfterUpgrade }}</n-text>
                                </n-space>
                            </n-space>
                        </n-card>

                        <n-button type="primary" block :disabled="!upgradeOption || upgradeCost > currentPoints"
                            @click="handleUpgrade">
                            确认升级
                        </n-button>
                    </n-space>
                </n-tab-pane>
            </n-tabs>
        </n-drawer-content>
    </n-drawer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const show = ref(false);
const selectedMembership = ref(''); // 购买会员类型
const selectedDuration = ref(null); // 购买时长
const currentMembership = userInfo?.usergroup;
const upgradeOption = ref('');
const redeemCode = ref('');
const currentPoints = userInfo?.integral || 0;

// 定义基础月费类型
interface MembershipCost {
    [key: string]: number;
    '普通会员': number;
    '高级会员': number;
    '超级会员': number;
}

// 定义基础月费
const baseMonthlyCost: MembershipCost = {
    '普通会员': 8000,
    '高级会员': 12000,
    '超级会员': 18000
};

// 计算本次消费积分
const costPoints = computed(() => {
    if (!selectedMembership.value || !selectedDuration.value) return 0;
    const monthlyCost = baseMonthlyCost[selectedMembership.value];
    const months = Number(selectedDuration.value);
    return monthlyCost * months;
});

// 计算购买后剩余积分
const remainingPoints = computed(() => {
    return currentPoints - costPoints.value;
});

// 计算剩余天数
const calculateRemainingDays = () => {
    if (userInfo?.term === '9999-09-09') return Infinity; // 永久会员
    if (!userInfo?.term) return 0; // term 为 undefined
    const today = new Date();
    const termDate = new Date(userInfo.term);
    const diffTime = termDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
};

const remainingDays = computed(() => {
    return calculateRemainingDays();
});

// 升级费用计算
const upgradeCost = computed(() => {
    // 不可升级的情况
    if (currentMembership === '免费用户' || userInfo?.term === '9999-09-09' || currentMembership === '超级会员') {
        return 0;
    }

    const remaining = remainingDays.value;
    if (remaining <= 0 || !currentMembership) return 0; // 会员已过期或 currentMembership 为 undefined

    // 定义每日费用（每月固定30天）
    const dailyCost: MembershipCost = {
        '普通会员': baseMonthlyCost['普通会员'] / 30,
        '高级会员': baseMonthlyCost['高级会员'] / 30,
        '超级会员': baseMonthlyCost['超级会员'] / 30
    };

    // 当前会员的剩余价值
    const currentRemainingValue = dailyCost[currentMembership] * remaining;

    // 目标会员的费用
    const targetMembership = upgradeOption.value;
    if (!targetMembership) return 0;

    const targetCost = dailyCost[targetMembership] * remaining;

    // 补差价
    const cost = targetCost - currentRemainingValue;
    return cost > 0 ? Math.ceil(cost) : 0;
});

// 升级后剩余积分
const remainingPointsAfterUpgrade = computed(() => {
    return currentPoints - upgradeCost.value;
});

// 处理购买
const handlePurchase = () => {
    console.log(`购买 ${selectedMembership.value} 会员，时长 ${selectedDuration.value}，消耗 ${costPoints.value} 积分`);
};

// 处理升级
const handleUpgrade = () => {
    console.log(`升级到 ${upgradeOption.value} 会员，需补差价 ${upgradeCost.value} 积分`);
};
</script>

<style>
.perk-card {
    margin-top: 12px;
}

.perk-btn {
    width: 100%;
}

.perk-desc {
    font-size: 14px;
}
</style>