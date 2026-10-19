import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import router from '@/router';
import { useUserStore } from '@/stores/user';
import {
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    isAccessTokenExpired,
    setAuthTokens,
} from '@/utils/authToken';

// 通用响应接口
export interface BaseResponse {
    code: number; // 状态码
    state: string; // 状态
    msg: string; // 返回信息
}

// 自定义错误类型
export class ApiError extends Error {
    constructor(
        public type: 'response' | 'network' | 'unknown',
        public message: string,
        public details?: string | object
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
}

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

const authClient = axios.create({
    baseURL: axiosInstance.defaults.baseURL,
    timeout: axiosInstance.defaults.timeout,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise: Promise<string | null> | null = null;

const applyAuthorizationHeader = (config: RetryableRequestConfig, accessToken: string) => {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    config.headers = headers;
};

const handleInvalidToken = () => {
    const userStore = useUserStore();
    userStore.clearUser();
    clearAuthTokens();

    const redirectPath = '/sign';
    if (router.currentRoute.value.path !== redirectPath) {
        void router.replace({
            path: redirectPath,
            query: {
                redirect: router.currentRoute.value.fullPath,
            },
        });
    }
};

const isInvalidLoginState = (data: any) => {
    return data?.msg === '缺少登录态' || (data?.msg === '无效的登录状态' && data?.state === 'fail');
};

const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return null;
    }

    if (!refreshPromise) {
        refreshPromise = authClient
            .post('/sso/refresh', {
                refresh_token: refreshToken,
            })
            .then((response) => {
                const payload = response.data?.data;
                const accessToken = payload?.access_token;
                if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
                    throw new Error('missing_access_token');
                }
                setAuthTokens({
                    accessToken,
                    refreshToken: payload?.refresh_token ?? refreshToken,
                    expiresAt: payload?.expires_at,
                    expiresIn: payload?.expires_in,
                });
                return accessToken;
            })
            .catch(() => {
                handleInvalidToken();
                return null;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const ensureAccessToken = async () => {
    const accessToken = getAccessToken();
    if (accessToken && !isAccessTokenExpired()) {
        return accessToken;
    }

    if (getRefreshToken()) {
        return refreshAccessToken();
    }

    return accessToken;
};

const retryWithRefresh = async (config?: RetryableRequestConfig) => {
    if (!config || config.skipAuthRefresh || config._retry) {
        return null;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
        return null;
    }

    config._retry = true;
    applyAuthorizationHeader(config, refreshedToken);
    return axiosInstance(config);
};

axiosInstance.interceptors.request.use(
    async (config) => {
        const requestConfig = config as RetryableRequestConfig;
        if (requestConfig.skipAuthRefresh) {
            return requestConfig;
        }

        const accessToken = await ensureAccessToken();
        if (accessToken) {
            applyAuthorizationHeader(requestConfig, accessToken);
        }

        return requestConfig;
    },
    (error) => {
        return Promise.reject(new ApiError('network', '向API发送请求失败', error));
    }
);

axiosInstance.interceptors.response.use(
    async (response) => {
        const data = response.data;

        if (isInvalidLoginState(data)) {
            const retriedResponse = await retryWithRefresh(response.config as RetryableRequestConfig);
            if (retriedResponse) {
                return retriedResponse;
            }
            handleInvalidToken();
            throw new ApiError('response', data.msg, data);
        }

        if (data.state !== 'success') {
            throw new ApiError('response', data.msg || '后端返回了未知错误', data);
        }

        return data;
    },
    async (error) => {
        if (!error.response) {
            return Promise.reject(new ApiError('network', '连接到API网络失败，请稍候再试', error));
        }

        const originalConfig = error.config as RetryableRequestConfig | undefined;
        if (isInvalidLoginState(error.response.data) || error.response.status === 401) {
            const retriedResponse = await retryWithRefresh(originalConfig);
            if (retriedResponse) {
                return retriedResponse;
            }
            handleInvalidToken();
        }

        return Promise.reject(new ApiError('unknown', error.message || '未知错误', error.response));
    }
);

export default axiosInstance;
