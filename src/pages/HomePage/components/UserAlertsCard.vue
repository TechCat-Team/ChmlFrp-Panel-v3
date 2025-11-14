<template>
    <n-card>
        <n-alert
            v-if="userInfo?.usergroup === '封禁'"
            title="您的账户已被封禁"
            type="error"
            @click="goToUserPage"
            style="margin-bottom: 10px"
        >
            您的账号因为违规被封禁，具体原因可以点击此提示前往个人主页查看消息，如有异议可前往交流群申述。
        </n-alert>
        <n-alert
            v-if="userInfo?.realname === '未实名'"
            title="您尚未实名"
            style="margin-bottom: 10px"
            type="warning"
            @click="goToUserPage"
        >
            根据相关法律规定，不实名则无法使用ChmlFrp提供的服务，点击此提示可前往个人中心免费实名，我们允许未成年实名。
        </n-alert>
        <n-alert title="提示" type="info" style="margin-bottom: 10px">
            如果这里没有您想了解的，可以前往
            <n-button text tag="a" :href="docsUrl" target="_blank" type="primary">
                ChmlFrp文档
            </n-button>
            或ChmlFrp交流群询问。
        </n-alert>
        <n-flex style="margin-top: 20px">
            <n-button
                style="border-radius: 5px"
                tertiary
                type="primary"
                @click="() => goToQqGroup(qqGroupLink, qqGroupNumber)"
            >
                QQ三群
            </n-button>
            <n-button style="border-radius: 5px" tertiary type="primary" @click="showWxGroup = true">
                微信群
            </n-button>
        </n-flex>
    </n-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDialog } from 'naive-ui';
import { DOCS_URL, QQ_GROUP_LINK, QQ_GROUP_NUMBER } from '../constants';

interface Props {
    userInfo?: {
        usergroup?: string;
        realname?: string;
    };
}

defineProps<Props>();

const router = useRouter();
const dialog = useDialog();
const showWxGroup = ref(false);

const docsUrl = DOCS_URL;
const qqGroupLink = QQ_GROUP_LINK;
const qqGroupNumber = QQ_GROUP_NUMBER;

const goToUserPage = () => {
    router.push('/user');
};

const goToQqGroup = (link: string, qq: number) => {
    dialog.warning({
        title: '警告',
        content: `进群提问题之前，一定要携带完整的报错、截图。例如Frpc运行截图，配置文件、隧道截图。并且请给Token打码。如果无法跳转加入QQ群，请通过此群号进入：${qq}`,
        positiveText: '我知道了',
        negativeText: '取消',
        onPositiveClick: () => {
            window.open(link, '_blank');
        },
    });
};

defineExpose({
    showWxGroup,
});
</script>

