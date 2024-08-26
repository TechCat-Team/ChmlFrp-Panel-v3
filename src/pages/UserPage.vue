<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card title="消息">
                    <n-alert v-if="userInfo?.usergroup === '封禁'" title="您的账户已被封禁" type="error">
                        理由：于2077年黑入荒板塔，袭击了一名网络安全人员。如有异议可前往QQ交流群申述
                    </n-alert>
                    <n-alert title="您的会员即将到期" type="info" style="margin-top: 10px">
                        您的ChmlFrp超级会员将于{{ userInfo?.term }}到期，请及时续费。
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
                        <n-popover trigger="hover" style="border-radius: 8px;">
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
                            <n-card hoverable size="small" :bordered="false" @click="resetToken">
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
                            <n-card hoverable size="small" :bordered="false" @click="changeTheUsernameModal = true">
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
                            <n-card hoverable size="small" :bordered="false" @click="modifyAvatarModal = true">
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
                            <n-card hoverable size="small" :bordered="false" @click="changePasswordModal = true">
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
                            <n-card hoverable size="small" :bordered="false" @click="changeTheMailboxModal = true">
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
                            <n-card hoverable size="small" :bordered="false" @click="changeQQModal = true">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="ChatboxEllipsesOutline" />
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
                <n-card title="实名认证" style="margin-bottom: 15px" v-if="userInfo?.realname === '未实名'">
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
                            <n-input placeholder="XXXX-XXXX-XXXX-XXXX" v-model:value="exchangeCodeModel.exchangeCode"
                                round />
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
                                :src='userInfo?.userimg' />
                            <div style="text-align: center;">
                                <h3 style="margin: 0;">Hi，{{ userInfo?.username }}
                                    <span style="color: gray; font-size: 14px;">#{{ userInfo?.id }}</span>
                                </h3>
                                <p style="margin: 0; margin-top: 4px;">{{ userInfo?.email }}</p>
                            </div>
                        </div>
                    </n-space>
                    <n-card :style="cardStyle" style="margin-top: 15px; text-align: center;">
                        <n-descriptions label-placement="top" :column="screenWidth >= 600 ? 3 : 2" label-align="center"
                            size="large">
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
                            {{ userInfo?.usertoken }}
                        </n-tag>
                    </div>
                </n-card>
            </n-gi>
        </n-grid>
    </n-flex>
    <n-modal v-model:show="changeTheUsernameModal">
        <n-card style="width: 400px">
            <n-form>
                <n-form-item-row label="更改后的用户名">
                    <n-input round />
                </n-form-item-row>
            </n-form>
            <n-button round type="primary" block secondary strong>
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="modifyAvatarModal">
        <n-card style="width: 400px">
            <n-tabs class="card-tabs" default-value="Link" size="large" animated pane-wrapper-style="margin: 0 -4px"
                pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;">
                <n-tab-pane name="Link" tab="图片链接">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        图片链接仅支持直链，且无反盗链的链接
                    </n-alert>
                    <n-input round />
                    <n-button round type="primary" block secondary strong style="margin-top: 16px">
                        提交
                    </n-button>
                </n-tab-pane>
                <n-tab-pane name="QQ" tab="根据QQ">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        这里可以根据您绑定的QQ号自动获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48"
                            src="https://q.qlogo.cn/headimg_dl?dst_uin=242247494&spec=640&img_type=jpg" />
                        <n-p>242247494</n-p>
                    </n-flex>
                    <n-button round type="primary" block secondary strong style="margin-top: 16px">
                        提交
                    </n-button>
                </n-tab-pane>
                <n-tab-pane name="Cravatar" tab="Cravatar">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        根据您的邮箱绑定的Cravatar获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48" src="https://cravatar.cn/avatar/2c36ed2f12241a2a22a2d55af893ffb2" />
                        <n-p>chaoji@chcat.cn</n-p>
                    </n-flex>
                    <n-button round type="primary" block secondary strong style="margin-top: 16px">
                        提交
                    </n-button>
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </n-modal>
    <n-modal v-model:show="changePasswordModal">
        <n-card style="width: 400px">
            <n-form>
                <n-form-item-row label="原密码">
                    <n-input round type="password" show-password-on="mousedown" />
                </n-form-item-row>
                <n-form-item-row label="新密码">
                    <n-input round type="password" maxlength="64" show-password-on="mousedown" />
                </n-form-item-row>
                <n-form-item-row label="重复新密码">
                    <n-input round type="password" maxlength="64" show-count clearable />
                </n-form-item-row>
            </n-form>
            <n-button round type="primary" block secondary strong>
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="changeTheMailboxModal">
        <n-card style="width: 400px">
            <n-form>
                <n-form-item-row label="旧邮箱验证码">
                    <n-grid cols="6" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="4">
                            <n-input round maxlength="8" />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button round style="width: 100%;">发送验证码</n-button>
                                </template>
                                <n-card size="small">
                                </n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
                <n-form-item-row label="新邮箱">
                    <n-input round maxlength="32" show-count clearable />
                </n-form-item-row>
                <n-form-item-row label="新邮箱验证码">
                    <n-grid cols="6" :x-gap="12" item-responsive responsive="screen">
                        <n-grid-item span="4">
                            <n-input round maxlength="8" />
                        </n-grid-item>
                        <n-grid-item span="2">
                            <n-popover trigger="hover" raw :show-arrow="false">
                                <template #trigger>
                                    <n-button round style="width: 100%;">发送验证码</n-button>
                                </template>
                                <n-card size="small">
                                </n-card>
                            </n-popover>
                        </n-grid-item>
                    </n-grid>
                </n-form-item-row>
            </n-form>
            <n-button round type="primary" block secondary strong>
                确定
            </n-button>
        </n-card>
    </n-modal>
    <n-modal v-model:show="changeQQModal">
        <n-card style="width: 400px">
            <n-form>
                <n-form-item-row label="新QQ号">
                    <n-input round maxlength="24" show-count clearable />
                </n-form-item-row>
            </n-form>
            <n-button round type="primary" block secondary strong>
                确定
            </n-button>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { KeyOutline, PersonOutline, ImageOutline, MailOutline, LockClosedOutline, ChatboxEllipsesOutline } from '@vicons/ionicons5'
import { ref, computed } from 'vue';
import { FormInst, FormRules } from 'naive-ui';
import { useStyleStore } from '@/stores/style';
import { useScreenStore } from '@/stores/useScreen';
import { storeToRefs } from 'pinia';
import axios from 'axios';
// 获取登录信息
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const userInfo = userStore.userInfo;

const screenStore = useScreenStore();
const { screenWidth } = storeToRefs(screenStore);

const styleStore = useStyleStore();
const cardStyle = computed(() => styleStore.getCardStyle());
const dialog = useDialog()
const message = useMessage()

const loadingQianDao = ref(true);

// 更改 用户名 模态框状态
const changeTheUsernameModal = ref(false)

// 更改 头像 模态框状态
const modifyAvatarModal = ref(false)

// 更改 密码 模态框状态
const changePasswordModal = ref(false)

// 更改 邮箱 模态框状态
const changeTheMailboxModal = ref(false)

// 更改 QQ 模态框状态
const changeQQModal = ref(false)

onMounted(() => {
    qiandaoinfo(); //加载签到信息
});

const last_sign_in_time = ref('');
const total_points = ref(0);
const total_sign_ins = ref(0);
const count_of_matching_records = ref(0);
const is_signed_in_today = ref(false);
const qiandaoinfo = async () => {
    loadingQianDao.value = true
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
        console.error('签到信息API调用失败', error);
    }
    loadingQianDao.value = false
}

// 实名认证表单
interface RealNameModelType {
    name: string | null;
    idCard: string | null;
}

// 重置TOKEN提示框
const resetToken = () => {
    dialog.warning({
        title: '警告',
        content: '重置TOKEN后旧的配置文件均无法使用，这代表着您的所有隧道需要重新获取配置文件再启动、且所有保存登录的设备均需重新登录。',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            message.success('TOKEN已重置，请重新登录')
        },
    })
}

const realNameFormRef = ref<FormInst | null>(null);
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