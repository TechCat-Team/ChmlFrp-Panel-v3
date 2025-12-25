import { computed } from 'vue';
import CryptoJS from 'crypto-js';

/**
 * 用户资料 composable
 */
export function useUserProfile(userInfo?: { qq?: string; email?: string }) {
    const QQImg = computed(() =>
        userInfo?.qq ? `https://q.qlogo.cn/headimg_dl?dst_uin=${userInfo.qq}&spec=640&img_type=jpg` : ''
    );

    const emailHash = computed(() => CryptoJS.MD5(userInfo?.email || 'chaoji@chcat.cn').toString());

    const CravatarImg = computed(() => `https://cravatar.cn/avatar/${emailHash.value}`);

    return {
        QQImg,
        CravatarImg,
    };
}
