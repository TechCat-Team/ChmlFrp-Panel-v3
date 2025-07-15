import axios from 'axios';

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

// 创建 Axios 实例
const axiosInstance = axios.create({
    baseURL: 'https://cf-v2.uapis.cn',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(new ApiError('network', '向API发送请求失败', error));
    }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => {
        const data = response.data;

        // 判断业务状态
        if (data.state !== 'success') {
            throw new ApiError('response', data.msg || '后端返回了未知错误', data);
        }

        return data; // 返回成功的数据
    },
    (error) => {
        if (!error.response) {
            // 网络错误
            return Promise.reject(new ApiError('network', '连接到API网络失败，请稍候再试', error));
        }

        // 其他未知错误
        return Promise.reject(new ApiError('unknown', error.message || '未知错误', error.response));
    }
);

export default axiosInstance;
