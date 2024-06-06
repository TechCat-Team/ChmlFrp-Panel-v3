<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card title="消息">
                    <n-alert title="您的账户已被封禁" type="error">
                        理由：于2077年黑入荒板塔，袭击了一名网络安全人员。如有异议可前往QQ交流群申述
                    </n-alert>
                    <n-alert title="您的会员即将到期" type="info" style="margin-top: 10px">
                        您的ChmlFrp超级会员将于2024年6月1日到期，请及时续费。
                    </n-alert>
                    <n-alert title="节点离线通知" type="warning" style="margin-top: 10px">
                        您使用的火星CN2、月球直连节点已离线。请及时处理
                    </n-alert>
                </n-card>
                <n-card title="账户设置" style="margin-top: 15px">
                    <template #header-extra>
                        <n-button quaternary type="primary" round>
                            签到
                        </n-button>
                        <n-popover trigger="hover">
                            <template #trigger>
                                <n-button quaternary round>签到信息</n-button>
                            </template>
                            <n-thing title="统计信息" content-style="margin-top: 10px;">
                                上次签到时间：2024-05-24<br>
                                累计签到积分：20842<br>
                                累计签到次数：121<br>
                                今日签到人数：2
                            </n-thing>
                        </n-popover>
                    </template>
                    <n-grid cols="1 l:2" responsive="screen" :x-gap="5" :y-gap="5">
                        <n-gi>
                            <n-card hoverable size="small" :bordered="false">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="KeyOutline" />
                                        <div style="margin-left: 15px;">
                                            <p style="margin: 0; font-size: 15px">重置Token</p>
                                            <p style="margin: 0; font-size: 12px">此操作不可逆，重置后所有客户端均需重新登录</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                        <n-gi>
                            <n-card hoverable size="small" :bordered="false">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="PersonOutline" />
                                        <div style="margin-left: 15px">
                                            <p style="margin: 0; font-size: 15px">修改用户名</p>
                                            <p style="margin: 0; font-size: 12px">点击这里可以修改您的用户名</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                        <n-gi>
                            <n-card hoverable size="small" :bordered="false">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="ImageOutline" />
                                        <div style="margin-left: 15px">
                                            <p style="margin: 0; font-size: 15px">更改头像</p>
                                            <p style="margin: 0; font-size: 12px">不支持上传图片文件，请将图片上传到图床后再填写链接</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                        <n-gi>
                            <n-card hoverable size="small" :bordered="false">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="LockClosedOutline" />
                                        <div style="margin-left: 15px">
                                            <p style="margin: 0; font-size: 15px">修改密码</p>
                                            <p style="margin: 0; font-size: 12px">点击这里可以修改您的登录密码</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                        <n-gi>
                            <n-card hoverable size="small" :bordered="false">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="MailOutline" />
                                        <div style="margin-left: 15px">
                                            <p style="margin: 0; font-size: 15px">更改邮箱</p>
                                            <p style="margin: 0; font-size: 12px">此操作风险较大，请谨慎操作</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                        <n-gi>
                            <n-card hoverable size="small" :bordered="false">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28">
                                            <svg height="28" viewBox="0 0 32 32" width="32"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <g fill="none" fill-rule="evenodd">
                                                    <path d="m0 0h32v32h-32z" />
                                                    <path
                                                        d="m15.9998867 0-.3175962.00373031c-6.8340705.16105657-10.59798873 5.52198001-10.62328209 13.09956699l.00099159.2727027-.86256398 2.1053645c-.34339269.8459887-.59479858 1.4918602-.8236549 2.1249911-.16246446.4494579-.31092035.8862129-.4515632 1.3302912-1.41043336 4.4529342-1.46997142 7.7313526 1.14979123 8.0424546l.19586827.0182568c.69853306.0462522 1.18775172-.1357889 1.69345756-.5695745l.04666502-.0427837.10703497.1859114.16295747.2641667.09000756.1369219-.10203891.0725127c-1.18457469.8599516-1.78515849 2.0422997-.8749963 3.5478041.72014893 1.1919865 1.68579016 1.3851809 4.67654251 1.4059241h1.2781117l.7210113-.0101194c1.4578857-.0287327 2.9764342-.1065736 3.9343697-.2001215l.2555297.0243167c1.1291243.09698 2.8606159.1735357 4.3993902.1859242h1.2781118c2.9907546-.0207471 3.95642-.2139816 4.6768437-1.4064227l.0983227-.1723424c.764361-1.4241985.1648309-2.548721-.9747412-3.3755348l-.1034569-.072941.0912293-.1362605.1629318-.2641511.1068389-.1855884.0466679.0427821c.5516504.4732059 1.0836451.6468525 1.8890001.5513616 2.6200145-.3116105 2.5604594-3.5895097 1.1502083-8.0424822-.136678-.4315245-.2810058-.8567817-.4385987-1.2939849l-.1781698-.4846461c-.0923296-.2464665-.1903348-.5013359-.2976536-.7744519l-.3954267-.9868956-.8290275-2.020683.0009399-.279262c-.038761-7.60576089-3.8169423-12.93053326-10.6187985-13.09291824zm.0001023 2c6.339972.00032813 9.0947051 5.25726658 8.9334981 11.7557738l.8516442 2.0748544c.5606846 1.3708665.9939584 2.4718584 1.3860782 3.7098724 1.2134003 3.8314013.8203049 5.4169539.5209683 5.4525554-.6424867.0761796-2.5006035-2.8842697-2.5006035-2.8842697 0 1.7141775-.8994592 3.9510027-2.8457046 5.5664147l.3377045.1073023c1.0249215.341207 2.6653848 1.0302704 2.2154641 1.7750936-.4078113.675007-6.9962271.4309917-8.8982689.2207732l-.4753503.0452169c-2.33636.195172-8.04423656.3608021-8.42291849-.2659901-.50418989-.8339832 1.61195836-1.5976385 2.55205373-1.8820678-1.94652419-1.615412-2.84615056-3.852456-2.84615056-5.5667428l-.32111727.4924567c-.56063792.838483-1.70355568 2.4482423-2.17943051 2.391813-.29933663-.0355468-.69254342-1.6211541.52102408-5.4525554l.21887662-.6654718c.52220361-1.5311231 1.13363576-2.9515889 2.01884579-5.1193097-.17029299-6.39290578 2.5220086-11.75539097 8.93338651-11.7557191z"
                                                        fill="#000" fill-rule="nonzero" />
                                                </g>
                                            </svg>
                                        </n-icon>
                                        <div style="margin-left: 15px">
                                            <p style="margin: 0; font-size: 15px">更改QQ号</p>
                                            <p style="margin: 0; font-size: 12px">不正确的QQ号可能会影响到后续功能</p>
                                        </div>
                                    </div>
                                </n-space>
                            </n-card>
                        </n-gi>
                    </n-grid>
                </n-card>
            </n-gi>
            <n-gi :span="2">
                <n-card title="实名认证" style="margin-bottom: 15px">
                    <n-form ref="realNameFormRef" :model="realNameModel" :rules="realNameRules" label-placement="left"
                        label-width="auto">
                        <n-form-item path="name" label="姓名" :show-require-mark="true">
                            <n-input v-model:value="realNameModel.name" round />
                        </n-form-item>
                        <n-form-item path="idCard" label="身份证" :show-require-mark="true">
                            <n-input v-model:value="realNameModel.idCard" round />
                        </n-form-item>
                        <n-row :gutter="[0, 24]">
                            <n-col :span="24">
                                <div style="display: flex; justify-content: flex-end">
                                    <n-button :disabled="realNameModel.name === null || realNameModel.idCard === null"
                                        round type="primary" @click="realNameHandleValidateButtonClick">
                                        验证
                                    </n-button>
                                </div>
                            </n-col>
                        </n-row>
                    </n-form>
                </n-card>
                <n-card title="使用兑换码">
                    <n-form ref="exchangeCodeFormRef" :model="exchangeCodeModel" :rules="exchangeCodeRules"
                        label-placement="left" label-width="auto">
                        <n-form-item path="exchangeCode" label="兑换码" :show-require-mark="true">
                            <n-input v-model:value="exchangeCodeModel.exchangeCode" round />
                        </n-form-item>
                        <n-row :gutter="[0, 24]">
                            <n-col :span="24">
                                <div style="display: flex; justify-content: flex-end">
                                    <n-button :disabled="exchangeCodeModel.exchangeCode === null" round type="primary"
                                        @click="exchangeCodeHandleValidateButtonClick">
                                        验证
                                    </n-button>
                                </div>
                            </n-col>
                        </n-row>
                    </n-form>
                </n-card>
                <n-card style="display: flex; justify-content: center; margin-top: 15px ">
                    <n-space justify="center">
                        <div
                            style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <n-avatar :size="72" round
                                src="https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg" />
                            <div style="text-align: center;">
                                <h3 style="margin: 0;">Hi，chaoji
                                    <span style="color: gray; font-size: 14px;">#1</span>
                                </h3>
                                <p style="margin: 0; margin-top: 4px;">chaoji@chcat.cn</p>
                            </div>
                        </div>
                    </n-space>
                    <n-card :style="cardStyle" style="margin-top: 15px; text-align: center;">
                        <n-descriptions label-placement="top" :column="3" label-align="center" size="large">
                            <n-descriptions-item label="注册时间">
                                2077-5-30
                            </n-descriptions-item>
                            <n-descriptions-item label="QQ">
                                242247494
                            </n-descriptions-item>
                            <n-descriptions-item label="权限组">
                                超级会员
                            </n-descriptions-item>
                            <n-descriptions-item label="到期时间">
                                9999-9-9
                            </n-descriptions-item>
                            <n-descriptions-item label="实名状态">
                                已实名
                            </n-descriptions-item>
                            <n-descriptions-item label="剩余积分">
                                241248
                            </n-descriptions-item>
                            <n-descriptions-item label="隧道限制">
                                4 / 16
                            </n-descriptions-item>
                            <n-descriptions-item label="带宽限制">
                                国内32m | 国外128m
                            </n-descriptions-item>
                        </n-descriptions>
                    </n-card>
                    <div style="display: flex; justify-content: center;">
                        <n-tag v-if="!showNewContent" round :bordered="false" type="primary" style="margin-top: 15px;"
                            @click="toggleContent">
                            点击显示Token
                            <template #icon>
                                <n-icon :component="KeyOutline" />
                            </template>
                        </n-tag>
                        <n-tag round v-if="showNewContent" @click="toggleContent" :bordered="false" type="primary"
                            style="margin-top: 15px;">
                            ChmlFrpTokenPreview
                        </n-tag>
                    </div>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
</template>

<script setup lang="ts">
import { KeyOutline, PersonOutline, ImageOutline, MailOutline, LockClosedOutline } from '@vicons/ionicons5'
import { ref, computed } from 'vue';
import { NTag, NIcon, FormInst, useMessage, FormRules } from 'naive-ui';
import { useStyleStore } from '@/stores/style';

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());

// 实名认证表单
interface RealNameModelType {
    name: string | null;
    idCard: string | null;
}

const realNameFormRef = ref<FormInst | null>(null);
const message = useMessage();
const realNameModel = ref<RealNameModelType>({
    name: null,
    idCard: null,
});

const realNameRules: FormRules = {
    name: [
        {
            required: true,
            message: '请输入真实姓名',
        },
    ],
    idCard: [
        {
            required: true,
            message: '请输入身份证号',
        },
    ],
};

const realNameHandleValidateButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    realNameFormRef.value?.validate((errors) => {
        if (!errors) {
            message.success('实名认证成功');
        } else {
            console.error(errors);
            message.error('实名认证失败');
        }
    });
};

// 兑换码表单
interface ExchangeCodeType {
    exchangeCode: string | null;
}

const exchangeCodeFormRef = ref<FormInst | null>(null);
const exchangeCodeModel = ref<ExchangeCodeType>({
    exchangeCode: null,
});

const exchangeCodeRules: FormRules = {
    exchangeCode: [
        {
            required: true,
            message: '请输入兑换码',
        },
    ],
};

const exchangeCodeHandleValidateButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    exchangeCodeFormRef.value?.validate((errors) => {
        if (!errors) {
            message.success('兑换成功，内容：超级会员1月');
        } else {
            console.error(errors);
            message.error('兑换失败');
        }
    });
};

// 显示Token
const showNewContent = ref(false);

const toggleContent = () => {
    showNewContent.value = !showNewContent.value;
};
</script>