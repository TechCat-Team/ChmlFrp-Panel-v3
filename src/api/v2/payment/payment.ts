import axios from 'axios';
import axiosInstance from '../axios/axiosInstance';
const PAYMENT_BASE_URL = axiosInstance.defaults.baseURL + '/api/payment';

/**
 * 支付类型
 */
export type PaymentType = 'wxpay' | 'alipay';

/**
 * 订单状态
 */
export type TradeStatus = 'pending' | 'success' | 'closed' | 'refund';

/**
 * 创建支付订单请求参数
 */
export interface CreatePaymentRequest {
    name: string;
    money: number;
    usertoken: string;
    /** 支付类型，wxpay（微信支付，默认）或 alipay（支付宝支付） */
    type?: PaymentType;
}

/**
 * 创建支付订单响应
 */
export interface CreatePaymentResponse {
    /** 是否成功 */
    success: boolean;
    /** 返回消息 */
    message: string;
    /** 商户订单号 */
    outTradeNo?: string;
    /** 支付类型 */
    type?: PaymentType;
    /** 订单金额 */
    money?: number;
    /** 微信支付二维码URL（微信支付时返回） */
    codeUrl?: string;
    /** 支付宝支付表单（支付宝支付时返回） */
    payForm?: string;
}

/**
 * 查询订单状态请求参数
 */
export interface QueryPaymentRequest {
    /** 商户订单号 */
    outTradeNo: string;
}

/**
 * 查询订单状态响应
 */
export interface QueryPaymentResponse {
    /** 是否成功 */
    success: boolean;
    /** 返回消息（失败时） */
    message?: string;
    /** 商户订单号 */
    outTradeNo?: string;
    /** 订单状态 */
    tradeStatus?: TradeStatus;
    /** 订单金额 */
    money?: number;
    /** 商品名称 */
    name?: string;
    /** 创建时间 */
    createTime?: string;
    /** 支付时间 */
    payTime?: string;
}

/**
 * 创建支付订单
 * @param request - 创建支付订单请求参数
 * @returns 创建支付订单响应
 */
export const createPayment = async (request: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append('name', request.name);
        formData.append('money', request.money.toString());
        formData.append('usertoken', request.usertoken);
        if (request.type) {
            formData.append('type', request.type);
        }

        const response = await axios.post<CreatePaymentResponse>(`${PAYMENT_BASE_URL}/create`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    } catch (error: any) {
        // 处理错误响应
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error('创建支付订单失败：' + (error.message || '未知错误'));
    }
};

/**
 * 查询订单状态
 * @param request - 查询订单状态请求参数
 * @returns 查询订单状态响应
 */
export const queryPayment = async (request: QueryPaymentRequest): Promise<QueryPaymentResponse> => {
    try {
        const response = await axios.get<QueryPaymentResponse>(`${PAYMENT_BASE_URL}/query`, {
            params: {
                outTradeNo: request.outTradeNo,
            },
        });

        return response.data;
    } catch (error: any) {
        // 处理错误响应
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error('查询订单状态失败：' + (error.message || '未知错误'));
    }
};
