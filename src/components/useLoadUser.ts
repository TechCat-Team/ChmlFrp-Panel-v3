import { useUserStore } from '@/stores/user';

import api from '@/api';

export async function useLoadUserInfo() {
    const userStore = useUserStore();
    const userInfo = userStore.userInfo;
    const token = userInfo?.usertoken;

    if (!token) return;

    try {
        const res = await api.v2.user.getUserInfo();
        userStore.setUser(res.data);
    } catch (err) {
        console.error('加载用户信息失败: ', err);
    }
}
