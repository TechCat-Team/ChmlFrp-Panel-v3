import axios from 'axios';
import axiosInstance from '../axios/axiosInstance';
const GIFTCARD_BASE_URL = axiosInstance.defaults.baseURL + '/giftcard';

/**
 * 奖励类型
 */
export type RewardType = '会员' | '积分';

/**
 * 兑换礼品卡请求参数
 */
export interface RedeemGiftcardRequest {
    usertoken: string;
    giftcode: string;
}

/**
 * 兑换礼品卡响应（会员类型）
 */
export interface RedeemGiftcardMemberResponse {
    success: true;
    message: string;
    rewardType: '会员';
    cardName: string;
    memberType: string;
    memberDays: number;
    newTerm: string;
}

/**
 * 兑换礼品卡响应（积分类型）
 */
export interface RedeemGiftcardPointsResponse {
    success: true;
    message: string;
    rewardType: '积分';
    cardName: string;
    points: number;
    newIntegral: number;
}

/**
 * 兑换礼品卡响应（失败）
 */
export interface RedeemGiftcardErrorResponse {
    success: false;
    message: string;
    rate_limit_info?: {
        blocked: boolean;
        status: string;
        recent_attempts: number;
        total_attempts: number;
        consecutive_failures: number;
        remaining_ban_minutes?: number;
        ban_end_time?: string;
        tips: string;
    };
}

/**
 * 兑换礼品卡响应
 */
export type RedeemGiftcardResponse =
    | RedeemGiftcardMemberResponse
    | RedeemGiftcardPointsResponse
    | RedeemGiftcardErrorResponse;

/**
 * 礼品卡使用历史项（会员类型）
 */
export interface GiftcardHistoryMemberItem {
    id: number;
    cardId: number;
    userId: number;
    usageTime: string;
    rewardType: '会员';
    memberType: string;
    memberDays: number;
    points: null;
}

/**
 * 礼品卡使用历史项（积分类型）
 */
export interface GiftcardHistoryPointsItem {
    id: number;
    cardId: number;
    userId: number;
    usageTime: string;
    rewardType: '积分';
    memberType: null;
    memberDays: null;
    points: number;
}

/**
 * 礼品卡使用历史项
 */
export type GiftcardHistoryItem = GiftcardHistoryMemberItem | GiftcardHistoryPointsItem;

/**
 * 查询使用历史响应
 */
export interface GiftcardHistoryResponse {
    success: boolean;
    message?: string;
    data?: GiftcardHistoryItem[];
}

/**
 * 兑换礼品卡
 * @param request - 兑换礼品卡请求参数
 * @returns 兑换礼品卡响应
 */
export const redeemGiftcard = async (
    request: RedeemGiftcardRequest
): Promise<RedeemGiftcardResponse> => {
    try {
        const response = await axios.post<RedeemGiftcardResponse>(
            `${GIFTCARD_BASE_URL}/redeem`,
            {
                usertoken: request.usertoken,
                giftcode: request.giftcode,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        // 处理错误响应
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error('兑换礼品卡失败：' + (error.message || '未知错误'));
    }
};

/**
 * 查询礼品卡使用历史
 * @param usertoken - 用户令牌
 * @returns 使用历史响应
 */
export const getGiftcardHistory = async (usertoken: string): Promise<GiftcardHistoryResponse> => {
    try {
        const response = await axios.get<GiftcardHistoryResponse>(
            `${GIFTCARD_BASE_URL}/history`,
            {
                params: {
                    usertoken,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error: any) {
        // 处理错误响应
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error('查询礼品卡历史失败：' + (error.message || '未知错误'));
    }
};

