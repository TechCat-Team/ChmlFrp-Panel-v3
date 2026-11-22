import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
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

const clientConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
};

const axiosInstance = axios.create(clientConfig);
const authClient = axios.create(clientConfig);
export const paymentClient = axios.create(clientConfig);

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

const isInvalidLoginState = (data: any, isPayment: boolean) => {
    if (isPayment) {
        return data?.success === false && data?.message === '无效的登录状态';
    }
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
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    handleInvalidToken();
                    throw new ApiError('response', '登录状态已失效，请重新登录');
                }
                throw new ApiError('network', '暂时无法刷新登录状态，请稍后重试');
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const ensureAccessToken = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    const accessToken = getAccessToken();
    if (accessToken && !isAccessTokenExpired()) {
        return accessToken;
    }

    if (getRefreshToken()) {
        return refreshAccessToken();
    }

    return accessToken;
};

const retryWithRefresh = async (client: AxiosInstance, config?: RetryableRequestConfig) => {
    if (!config || config.skipAuthRefresh || config._retry) {
        return null;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
        return null;
    }

    config._retry = true;
    applyAuthorizationHeader(config, refreshedToken);
    return client(config);
};

const installInterceptors = (client: AxiosInstance, isPayment = false) => {
    client.interceptors.request.use(
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

    client.interceptors.response.use(
        async (response) => {
            const data = response.data;

            if (isInvalidLoginState(data, isPayment)) {
                const retriedResponse = await retryWithRefresh(client, response.config);
                if (retriedResponse) {
                    return retriedResponse;
                }
                handleInvalidToken();
            }

            if (isPayment) {
                return response;
            }

            if (data.state !== 'success') {
                throw new ApiError('response', data.msg || '后端返回了未知错误', data);
            }

            return data;
        },
        async (error) => {
            if (error instanceof ApiError) {
                throw error;
            }

            if (!error.response) {
                throw new ApiError('network', '连接到API网络失败，请稍候再试', error);
            }

            if (isInvalidLoginState(error.response.data, isPayment) || error.response.status === 401) {
                const retriedResponse = await retryWithRefresh(client, error.config);
                if (retriedResponse) {
                    return retriedResponse;
                }
                handleInvalidToken();
            }

            if (isPayment) {
                throw error;
            }

            throw new ApiError('unknown', error.message || '未知错误', error.response);
        }
    );
};

installInterceptors(axiosInstance);
installInterceptors(paymentClient, true);

export default axiosInstance;
