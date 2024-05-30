<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="2">
                <n-card title="实名认证" style="margin-bottom: 15px">
                    <n-form ref="formRef" :model="realNameModel" :rules="realNameRules" label-placement="left"
                        label-width="auto">
                        <n-form-item path="name" label="姓名" show-require-mark="true">
                            <n-input v-model:value="realNameModel.name" @keydown.enter.prevent />
                        </n-form-item>
                        <n-form-item path="idcard" label="身份证" show-require-mark="true">
                            <n-input v-model:value="realNameModel.idCard" @keydown.enter.prevent />
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
                    <n-form ref="formRef" :model="realNameModel" :rules="exchangeCodeRules" label-placement="left"
                        label-width="auto">
                        <n-form-item path="exchangeCode" label="兑换码" show-require-mark="true">
                            <n-input v-model:value="exchangeCodeModel.exchangeCode" round @keydown.enter.prevent />
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
                        <n-descriptions label-placement="top" column="3" label-align="center" size="large">
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
                        <n-button quaternary type="primary">
                            签到
                        </n-button>
                        <n-button quaternary>
                            签到信息
                        </n-button>
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
                                            <p style="margin: 0; font-size: 12px">不支持上传图片文件，请将图片上传到后再填写链接</p>
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
                    </n-grid>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
</template>

<script setup lang="ts">
import { KeyOutline, PersonOutline, ImageOutline, MailOutline, LockClosedOutline } from '@vicons/ionicons5'
import { ref, computed } from 'vue';
import {
    NTag, NIcon, FormInst,
    useMessage,
    FormRules
} from 'naive-ui';
// 根据主题自适应样式背景颜色
import { useStyleStore } from '@/stores/style';

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());

// 实名认证表单
interface realNameModelType {
    name: string | null
    idCard: string | null
}

const realNameFormRef = ref<FormInst | null>(null)
const message = useMessage()
const realNameModel = ref<realNameModelType>({
    name: null,
    idCard: null,
})

const realNameRules: FormRules = {
    name: [
        {
            required: true,
            message: '请输入真实姓名'
        }
    ],
    idCard: [
        {
            required: true,
            message: '请输入身份证号'
        }
    ],
}

const realNameHandleValidateButtonClick = (e: MouseEvent) => {
    e.preventDefault()
    realNameFormRef.value?.validate((errors) => {
        if (!errors) {
            message.success('实名认证成功')
        } else {
            console.log(errors)
            message.error('实名认证失败')
        }
    })
}

// 兑换码表单
interface exchangeCodeType {
    exchangeCode: string | null
}

const exchangeCodeFormRef = ref<FormInst | null>(null)
const exchangeCodeModel = ref<exchangeCodeType>({
    exchangeCode: null,
})

const exchangeCodeRules: FormRules = {
    name: [
        {
            required: true,
            message: '请输入真实姓名'
        }
    ],
    idCard: [
        {
            required: true,
            message: '请输入身份证号'
        }
    ],
}

const exchangeCodeHandleValidateButtonClick = (e: MouseEvent) => {
    e.preventDefault()
    exchangeCodeFormRef.value?.validate((errors) => {
        if (!errors) {
            message.success('兑换成功，内容：超级会员1月')
        } else {
            console.log(errors)
            message.error('兑换失败')
        }
    })
}

// 显示Token
const showNewContent = ref(false);

const toggleContent = () => {
    showNewContent.value = !showNewContent.value;
};
</script>