import axiosInstance from '../axios/axiosInstance';
import type { BaseResponse } from '../axios/axiosInstance';

/**
 * 积分流水项
 */
export interface IntegralLogItem {
    id: number;
    userId: number;
    /** 变动类型：收入 / 支出 */
    changeType: '收入' | '支出';
    /** 变动数量，始终为正数 */
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    /** 变动来源：充值、签到、礼品卡、套餐购买、套餐升级、证书删除、管理员调整 */
    source: string;
    description: string | null;
    relatedId: string | null;
    createTime: string;
}

/**
 * 积分流水查询参数
 */
export interface GetIntegralLogsParams {
    page?: number;
    size?: number;
    type?: '收入' | '支出';
    source?: string;
    start_time?: string;
    end_time?: string;
}

interface GetIntegralLogsResponse extends BaseResponse {
    data: {
        logs: IntegralLogItem[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

/**
 * 查询当前用户的积分流水
 */
export const getIntegralLogs = async (params: GetIntegralLogsParams): Promise<GetIntegralLogsResponse> => {
    return axiosInstance.get('/integral/logs', {
        params,
    });
};
