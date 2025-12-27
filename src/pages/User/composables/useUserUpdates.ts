import { ref, reactive } from 'vue';
import { FormInst } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';

/**
 * 用户信息更新 composable
 */
export function useUserUpdates() {
    const router = useRouter();
    const message = useMessage();
    const userStore = useUserStore();

    const loadingUpdateImg = ref(false);
    const loadingUpdateUserName = ref(false);
    const loadingUpdateQQ = ref(false);
    const loadingUpdatePassword = ref(false);
    const loadingResetEmail = ref(false);

    const userNameFormRef = ref<FormInst | null>(null);
    const qqFormRef = ref<FormInst | null>(null);
    const userImageFormRef = ref<FormInst | null>(null);

    const userNameModel = reactive({ newUserName: '' });
    const qqModel = reactive({ newQQ: '' });
    const userImageModel = reactive({ newUserImage: '' });
    const resetPasswordValue = reactive({
        original_password: '',
        new_password: '',
        reentered_new_password: '',
    });

    const resetUserImg = async () => {
        try {
            await userImageFormRef.value?.validate();
        } catch (e) {
            message.warning('请输入图片链接');
            return;
        }
        loadingUpdateImg.value = true;
        try {
            const response = await api.v2.user.updateUserImage(userImageModel.newUserImage);
            message.success(response.msg);
            userStore.setUser({ userimg: userImageModel.newUserImage });
            return true;
        } catch (error) {
            message.error('修改头像失败: ' + (error as Error).message);
            return false;
        } finally {
            loadingUpdateImg.value = false;
        }
    };

    const resetUserName = async () => {
        try {
            await userNameFormRef.value?.validate();
        } catch (e: any) {
            const msg = e?.newUserName?.[0]?.message || '用户名校验未通过';
            message.warning(msg);
            return false;
        }
        loadingUpdateUserName.value = true;
        try {
            const response = await api.v2.user.updateUserName(userNameModel.newUserName);
            message.success(response.msg);
            userStore.setUser({ username: userNameModel.newUserName });
            return true;
        } catch (error) {
            message.error('修改用户名失败: ' + (error as Error).message);
            return false;
        } finally {
            loadingUpdateUserName.value = false;
        }
    };

    const resetQQ = async () => {
        try {
            await qqFormRef.value?.validate();
        } catch (errors) {
            message.warning('QQ号不能为空');
            return false;
        }
        loadingUpdateQQ.value = true;
        try {
            const response = await api.v2.user.updateQQ(qqModel.newQQ);
            message.success(response.msg);
            userStore.setUser({ qq: qqModel.newQQ });
            return true;
        } catch (error) {
            message.error('修改QQ失败: ' + (error as Error).message);
            return false;
        } finally {
            loadingUpdateQQ.value = false;
        }
    };

    const resetPassword = async () => {
        loadingUpdatePassword.value = true;
        try {
            const response = await api.v2.user.resetPassword(
                resetPasswordValue.original_password,
                resetPasswordValue.new_password
            );

            message.success(response.msg);
            userStore.clearUser();
            router.push('/sign');
        } catch (error) {
            message.error('修改密码失败: ' + (error as Error).message);
        } finally {
            loadingUpdatePassword.value = false;
        }
    };

    const resetEmail = async (newEmail: string, oldCode: string, newCode: string) => {
        loadingResetEmail.value = true;
        try {
            const response = await api.v2.user.resetEmail(newEmail, oldCode, newCode);

            message.success(response.msg);
            userStore.clearUser();
            router.push('/sign');
        } catch (error) {
            message.error('修改邮箱失败: ' + (error as Error).message);
        } finally {
            loadingResetEmail.value = false;
        }
    };

    return {
        loadingUpdateImg,
        loadingUpdateUserName,
        loadingUpdateQQ,
        loadingUpdatePassword,
        loadingResetEmail,
        userNameFormRef,
        qqFormRef,
        userImageFormRef,
        userNameModel,
        qqModel,
        userImageModel,
        resetPasswordValue,
        resetUserImg,
        resetUserName,
        resetQQ,
        resetPassword,
        resetEmail,
    };
}
