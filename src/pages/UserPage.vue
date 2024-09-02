<template>
    <n-back-top :right="100" />
    <n-flex vertical>
        <n-grid cols="1 s:5" responsive="screen" :x-gap="15" :y-gap="20">
            <n-gi :span="3">
                <n-card title="消息">
                    <n-alert v-if="userInfo?.usergroup === '封禁'" title="您的账户已被封禁" type="error"
                        style="margin-bottom: 10px">
                        理由：于2077年黑入荒板塔，袭击了一名网络安全人员。如有异议可前往QQ交流群申述
                    </n-alert>
                    <n-alert v-if="userInfo?.realname === '未实名'" title="未实名通知" type="warning"
                        style="margin-bottom: 10px">
                        您尚未实名，请前往右侧实名认证填写处进行实名，每位用户提供3次免费实名，次数耗尽后请联系QQ242247494进行重置。我们允许未成年实名，但请不要使用非本人身份证实名。
                    </n-alert>
                    <n-alert v-if="isTermExpiringSoon" title="您的会员即将到期" type="info" style="margin-bottom: 10px">
                        您的ChmlFrp{{ userInfo?.usergroup }}将于 {{ userInfo?.term }} 到期，剩余 {{ remainingDays }} 天，请及时续费。
                    </n-alert>
                    <n-alert title="节点离线通知" type="warning">
                        您使用的火星CN2、月球直连节点已离线。请及时处理
                    </n-alert>
                </n-card>
                <n-card title="账户设置" style="margin-top: 15px">
                    <template #header-extra>
                        <n-skeleton v-if="loadingQianDao" :width="56" round :sharp="false" size="medium" />
                        <div v-else>
                            <n-button v-if="!is_signed_in_today" round :loading="loadingQianDaoButton" type="primary"
                                quaternary @click="onSignButtonClick">
                                {{ QianDaoTest }}
                            </n-button>
                            <n-tooltip v-else>
                                <template #trigger>
                                    <n-button type="primary" round quaternary disabled tag="div">
                                        签到
                                    </n-button>
                                </template>
                                您今天已经签到过啦
                            </n-tooltip>
                        </div>
                        <n-popover trigger="hover" style="border-radius: 8px;">
                            <template #trigger>
                                <n-skeleton v-if="loadingQianDao" :width="92" round :sharp="false" size="medium" />
                                <n-button v-else quaternary round>签到信息</n-button>
                            </template>
                            <n-thing title="统计信息" content-style="margin-top: 10px;">
                                上次签到时间：{{ last_sign_in_time }}<br>
                                累计签到积分：{{ total_points }}<br>
                                累计签到次数：{{ total_sign_ins }}<br>
                                今日签到人数：{{ count_of_matching_records }}
                            </n-thing>
                        </n-popover>
                    </template>
                    <n-grid cols="1 l:2" responsive="screen" :x-gap="5" :y-gap="5">
                        <n-gi v-for="(setting, index) in settingCard" :key="index">
                            <n-card hoverable size="small" :bordered="false" @click="setting.click">
                                <n-space justify="space-between" align="center">
                                    <div style="display: flex; align-items: center;">
                                        <n-icon size="28" :component="setting.icon" />
                                        <div style="margin-left: 15px;">
                                            <p style="margin: 0; font-size: 15px">{{ setting.title }}</p>
                                            <p style="margin: 0; font-size: 12px">{{ setting.subtitle }}</p>
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
                            <n-avatar :size="72" round :src='userInfo?.userimg' />
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
                        <n-tag round v-if="showNewContent" @click="copyAndToggleContent" :bordered="false"
                            type="primary" style="margin-top: 15px;">
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
                    <n-input round v-model:value="newUserName" />
                </n-form-item-row>
            </n-form>
            <n-button round type="primary" @click="resetUserName" :loading="loadingUpdateUserName" block secondary strong>
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
                    <n-input round v-model:value="newUserImg" />
                    <n-button round type="primary" block :loading="loadingUpdateImg" @click="resetUserImg(newUserImg)" secondary strong style="margin-top: 16px">
                        提交
                    </n-button>
                </n-tab-pane>
                <n-tab-pane name="QQ" tab="根据QQ">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        这里可以根据您绑定的QQ号自动获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48"
                            :src="QQImg" />
                        <n-p>{{ userInfo?.qq }}</n-p>
                    </n-flex>
                    <n-button round type="primary" block :loading="loadingUpdateImg" @click="resetUserImg(QQImg)" secondary strong style="margin-top: 16px">
                        提交
                    </n-button>
                </n-tab-pane>
                <n-tab-pane name="Cravatar" tab="Cravatar">
                    <n-alert title="提示" type="info" style="margin-bottom: 16px">
                        根据您的邮箱绑定的Cravatar获取头像
                    </n-alert>
                    <n-flex justify="space-between">
                        <n-avatar round :size="48" :src="CravatarImg" />
                        <n-p>{{ userInfo?.email }}</n-p>
                    </n-flex>
                    <n-button round type="primary" block :loading="loadingUpdateImg" @click="resetUserImg(CravatarImg)" secondary strong style="margin-top: 16px">
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
                    <n-input round maxlength="20" v-model:value="newQQ" show-count clearable />
                </n-form-item-row>
            </n-form>
            <n-button round type="primary" :loading="loadingUpdateQQ" @click="resetQQ" block secondary strong>
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
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import CryptoJS from 'crypto-js';
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
const router = useRouter();

const loadingQianDao = ref(true); // 签到骨架屏加载状态

const loadingQianDaoButton = ref(false) // 签到按钮加载状态
const loadingUpdateImg = ref(false) // 用户名确定按钮加载状态
const loadingUpdateUserName = ref(false) // 用户名确定按钮加载状态
const loadingUpdateQQ = ref(false) // QQ确定按钮加载状态

const QianDaoTest = ref('签到') // 签到按钮默认文字
const newUserImg = ref('') // 新头像链接
const newUserName = ref(`${userInfo?.username}`) // 新用户名
const newQQ = ref(`${userInfo?.qq}`) // 新QQ号

const QQImg = `https://q.qlogo.cn/headimg_dl?dst_uin=${userInfo?.qq}&spec=640&img_type=jpg` // 根据QQ获取头像
const emailHash = CryptoJS.MD5(userInfo?.email).toString(); // md5加密邮箱
const CravatarImg = ` https://cravatar.cn/avatar/${emailHash}` // 根据Creavata获取头像

const changeTheUsernameModal = ref(false) // 更改 用户名 模态框状态
const modifyAvatarModal = ref(false) // 更改 头像 模态框状态
const changePasswordModal = ref(false) // 更改 密码 模态框状态
const changeTheMailboxModal = ref(false) // 更改 邮箱 模态框状态
const changeQQModal = ref(false) // 更改 QQ 模态框状态

onMounted(() => {
    qiandaoinfo(); //加载签到信息
});

const remainingDays = computed(() => {
    if (!userInfo?.term) return 0;

    const termDate = new Date(userInfo.term);
    const today = new Date();

    const diffTime = termDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
});

const isTermExpiringSoon = computed(() => {
    return remainingDays.value < 7 && remainingDays.value >= 0;
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

const onSignButtonClick = () => {
    loadingQianDaoButton.value = true
    QianDaoTest.value = '初始化验证[1/3]'
    window.initGeetest4(
        {
            product: 'bind',
            captchaId: '3891b578aa85e4866c5f8205b02b165a',
            width: '100%',
        },
        (captchaObj: CaptchaObj) => {
            captchaObj.showCaptcha();
            captchaObj.onNextReady(function () {
                QianDaoTest.value = '验证码验证[2/3]'
            });
            captchaObj.onClose(function () {
                message.warning('签到验证关闭，此次签到未成功')
                loadingQianDaoButton.value = false
                QianDaoTest.value = '签到'
            });
            captchaObj.onSuccess(() => {
                const result = captchaObj.getValidate();
                if (result) {
                    console.log('Geetest 验证成功:', result);
                    // 调用签到API
                    signIn(result);
                }
            });
        }
    );
};

const signIn = (geetestResult: GeetestResult) => {
    QianDaoTest.value = '调用签到API[3/3]'
    fetch('https://cf-v2.uapis.cn/qiandao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: userInfo?.usertoken,
            captcha_output: geetestResult.captcha_output,
            lot_number: geetestResult.lot_number,
            pass_token: geetestResult.pass_token,
            gen_time: geetestResult.gen_time,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.state === 'success') {
                loadingQianDaoButton.value = false;
                dialog.success({
                    title: '签到成功',
                    content: data.msg,
                    positiveText: '哇'
                });
            } else {
                loadingQianDaoButton.value = false;
                QianDaoTest.value = '签到';
                message.error(data.msg)
            }
        });
    // 3 秒后恢复按钮状态
    setTimeout(() => {
        loadingQianDaoButton.value = false;
        QianDaoTest.value = '签到';
        qiandaoinfo();
    }, 3000);
};

const resetUserImg = async (userimg: string) => {
    loadingUpdateImg.value = true
    try {
        const response = await axios.get(`https://cf-v2.uapis.cn/update_userimg?token=${userInfo?.usertoken}&new_userimg=${userimg}`);
        if (response.data.code === 200) {
            message.success(response.data.msg)
            modifyAvatarModal.value = false
        } else {
            message.error(response.data.msg)
        }
    } catch (error) {
        console.error('修改头像API调用失败', error);
        message.error('修改头像API调用失败' + error)
    }
    loadingUpdateImg.value = false
};

const resetTokenAPI = async () => {
    try {
        const response = await axios.get(`https://cf-v2.uapis.cn/retoken?token=${userInfo?.usertoken}`);
        if (response.data.code === 200) {
            message.success('TOKEN已重置，请重新登录')
            userStore.clearUser();
            router.push('/sign');
        } else {
            message.error(response.data.msg)
        }
    } catch (error) {
        console.error('重置TokenAPI调用失败', error);
        message.error('重置TokenAPI调用失败' + error)
    }
};

const resetQQ = async () => {
    loadingUpdateQQ.value = true
    try {
        const response = await axios.get(`https://cf-v2.uapis.cn/update_qq?token=${userInfo?.usertoken}&new_userimg=${newQQ.value}`);
        if (response.data.code === 200) {
            message.success(response.data.msg)
            changeQQModal.value = false
        } else {
            message.error(response.data.msg)
        }
    } catch (error) {
        console.error('修改头像API调用失败', error);
        message.error('修改头像API调用失败' + error)
    }
    loadingUpdateQQ.value = false
};

const resetUserName = async () => {
    loadingUpdateUserName.value = true
    try {
        const response = await axios.get(`https://cf-v2.uapis.cn/update_username?token=${userInfo?.usertoken}&new_username=${newUserName.value}`);
        if (response.data.code === 200) {
            message.success(response.data.msg)
            changeTheUsernameModal.value = false
        } else {
            message.error(response.data.msg)
        }
    } catch (error) {
        console.error('修改头像API调用失败', error);
        message.error('修改头像API调用失败' + error)
    }
    loadingUpdateUserName.value = false
};

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
            resetTokenAPI();
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

// 显示token
const showNewContent = ref(false);

const toggleContent = () => {
    showNewContent.value = !showNewContent.value;
};

const copyAndToggleContent = () => {
    const token = userInfo?.usertoken;
    if (token) {
        navigator.clipboard.writeText(token).then(() => {
            message.success('Token已复制到剪切板')
        }).catch(err => {
            console.error('Token复制失败：', err);
            message.error('Token复制失败：', err)
        });
    }
    toggleContent();
};

const openChangeTheUsernameModal = () => {
    changeTheUsernameModal.value = true
}

const openModifyAvatarModal = () => {
    modifyAvatarModal.value = true
}

const openChangePasswordModal = () => {
    changePasswordModal.value = true
}

const openChangeTheMailboxModal = () => {
    changeTheMailboxModal.value = true
}

const openChangeQQModal = () => {
    changeQQModal.value = true
}

const settingCard = ref([
    {
        title: '重置token',
        subtitle: '此操作不可逆，重置后所有客户端均需重新登录',
        icon: KeyOutline,
        click: resetToken,
    },
    {
        title: '修改用户名',
        subtitle: '点击这里可以修改您的用户名',
        icon: PersonOutline,
        click: openChangeTheUsernameModal
    },
    {
        title: '更改头像',
        subtitle: '不支持上传图片文件，请将图片上传到图床后再填写链接',
        icon: ImageOutline,
        click: openModifyAvatarModal
    },
    {
        title: '修改密码',
        subtitle: '点击这里可以修改您的登录密码',
        icon: LockClosedOutline,
        click: openChangePasswordModal
    },
    {
        title: '更改邮箱',
        subtitle: '此操作风险较大，请谨慎操作',
        icon: MailOutline,
        click: openChangeTheMailboxModal,
    },
    {
        title: '更改QQ号',
        subtitle: '不正确的QQ号可能会影响到后续功能',
        icon: ChatboxEllipsesOutline,
        click: openChangeQQModal,
    }
])
</script>