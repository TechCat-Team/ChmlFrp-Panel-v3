import { defineStore } from 'pinia';
import { ref } from 'vue';

interface UserInfo {
    id: number;
    username: string;
    userimg: string;
    qq: string;
    email: string;
    usertoken: string;
    usergroup: string;
    bandwidth: number;
    tunnel: number;
    realname: string;
    integral: number;
    term: string;
    regtime: string;
    tunnelCount: number;
    total_download: number;
    total_upload: number;
    totalCurConns: number;
}

export const useUserStore = defineStore('user', () => {
    const userInfo = ref<UserInfo | null>(null);

    const setUser = (info: Partial<UserInfo> | UserInfo, duration = 'permanent') => {
        if (!userInfo.value && !('id' in info)) {
            throw new Error('初次设置用户信息必须提供完整数据！');
        }

        const newUserInfo = userInfo.value ? { ...userInfo.value, ...info } : (info as UserInfo);

        const expiry = duration === '1d' ? new Date().getTime() + 86400000 : null;
        const dataToStore = JSON.stringify({ ...newUserInfo, expiry });

        localStorage.setItem('userInfo', dataToStore);
        if (duration === '1d') {
            sessionStorage.setItem('userInfo', dataToStore);
        }

        if (userInfo.value) {
            Object.assign(userInfo.value, newUserInfo);
        } else {
            userInfo.value = newUserInfo;
        }
    };

    const loadUser = () => {
        const savedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
        if (savedUserInfo) {
            const parsedInfo = JSON.parse(savedUserInfo);
            if (parsedInfo.expiry && new Date().getTime() > parsedInfo.expiry) {
                clearUser();
            } else {
                if (userInfo.value) {
                    Object.assign(userInfo.value, parsedInfo);
                } else {
                    userInfo.value = parsedInfo;
                }
            }
        }
    };

    const clearUser = () => {
        userInfo.value = null;
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
    };

    return {
        userInfo,
        setUser,
        loadUser,
        clearUser,
    };
});
