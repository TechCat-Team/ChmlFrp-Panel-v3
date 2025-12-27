import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

interface UsersListData {
    users: Array<{
        id: number;
        username: string;
        email: string;
        qq: string;
        usergroup: string;
        realname: string;
        integral: number;
        bandwidth: number;
        tunnel: number;
        userimg: string;
        term: string;
    }>;
    total: number;
}

export interface UsersListResponse extends BaseResponse {
    data: UsersListData;
}

// ---------------- Nodes (Admin) ----------------
interface NodesListData {
    nodes: Array<Record<string, unknown>>;
}

export interface NodesListResponse extends BaseResponse {
    data: NodesListData;
}

/** 获取节点列表（管理员） */
export const getNodes = async (): Promise<NodesListResponse> => {
    return axiosInstance.get('/admin/nodes');
};

/** 创建节点（管理员） */
export const createNode = async (payload: Record<string, unknown>): Promise<BaseResponse> => {
    return axiosInstance.post('/admin/nodes', payload);
};

/** 更新节点（管理员） */
export const updateNode = async (
    nodeId: number,
    payload: Record<string, unknown>
): Promise<BaseResponse> => {
    return axiosInstance.put(`/admin/nodes/${nodeId}`, payload);
};

/** 删除节点（管理员） */
export const deleteNode = async (nodeId: number): Promise<BaseResponse> => {
    return axiosInstance.delete(`/admin/nodes/${nodeId}`);
};

/**
 * 获取用户列表（管理员）
 */
export const getUsers = async (page: number, size: number): Promise<UsersListResponse> => {
    return axiosInstance.get('/admin/users', {
        params: { page, size },
    });
};

/**
 * 搜索用户（管理员）
 */
export const searchUsers = async (
    type: 'username' | 'email' | 'id',
    value: string,
    page: number,
    size: number
): Promise<UsersListResponse> => {
    return axiosInstance.get('/admin/search/users', {
        params: { type, value, page, size },
    });
};

/**
 * 更新用户（管理员）
 */
export const updateUser = async (
    userId: number,
    payload: Record<string, unknown>
): Promise<BaseResponse> => {
    return axiosInstance.put(`/admin/users/${userId}`, payload);
};

// ---------------- Tunnels (Admin) ----------------
interface TunnelsListData {
    tunnels: Array<{
        id: number;
        name: string;
        localip: string;
        type: string;
        nport: number;
        dorp: string;
        node: string;
        state: string;
        userid: number;
        encryption: string;
        compression: string;
        ap: string;
        uptime: string;
        client_version: string;
        today_traffic_in: number;
        today_traffic_out: number;
        cur_conns: number;
    }>;
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface TunnelsListResponse extends BaseResponse {
    data: TunnelsListData;
}

export interface TunnelDetailResponse extends BaseResponse {
    data: {
        id: number;
        name: string;
        localip: string;
        type: string;
        nport: number;
        dorp: string;
        node: string;
        state: string;
        userid: number;
        encryption: string;
        compression: string;
        ap: string;
        uptime: string;
        client_version: string;
        today_traffic_in: number;
        today_traffic_out: number;
        cur_conns: number;
    };
}

export interface TunnelSearchResponse extends BaseResponse {
    data: TunnelsListData & {
        searchType: string;
        searchValue: string;
    };
}

/**
 * 获取隧道列表（管理员）
 */
export const getTunnels = async (page: number, size: number): Promise<TunnelsListResponse> => {
    return axiosInstance.get('/admin/tunnels', {
        params: { page, size },
    });
};

/**
 * 搜索隧道（管理员）
 */
export const searchTunnels = async (
    type: 'user_id' | 'name' | 'tunnel_id' | 'dorp',
    value: string,
    page: number,
    size: number
): Promise<TunnelSearchResponse> => {
    return axiosInstance.get('/admin/tunnels/search', {
        params: { type, value, page, size },
    });
};

/**
 * 获取隧道详情（管理员）
 */
export const getTunnelById = async (tunnelId: number): Promise<TunnelDetailResponse> => {
    return axiosInstance.get(`/admin/tunnels/${tunnelId}`);
};

/**
 * 管理员强制下线隧道
 */
export const offlineTunnel = async (
    identifier: string,
    identifierType: 'id' | 'name' = 'name'
): Promise<BaseResponse> => {
    return axiosInstance.post('/admin/tunnels/offline', null, {
        params: {
            identifier,
            type: identifierType,
        },
    });
};

// ---------------- Gift Cards (Admin) ----------------

/**
 * 礼品卡信息接口
 */
export interface GiftCard {
    id: number;
    cardCode: string;
    cardName: string;
    rewardType: '会员' | '积分';
    memberType: string | null;
    memberDays: number | null;
    points: number | null;
    totalUsageLimit: number;
    usedCount: number;
    perUserLimit: number;
    validFrom: string | null;
    validUntil: string | null;
    isActive: boolean;
    createTime: string;
    updateTime: string;
}

/**
 * 礼品卡使用记录接口
 */
export interface GiftCardUsageRecord {
    id: number;
    cardId: number;
    userId: number;
    usageTime: string;
    rewardType: '会员' | '积分';
    memberType: string | null;
    memberDays: number | null;
    points: number | null;
}

/**
 * 创建礼品卡请求参数
 */
export interface CreateGiftCardRequest {
    card_code: string;
    card_name?: string;
    reward_type: '会员' | '积分';
    member_type?: '普通会员' | '高级会员' | '超级会员';
    member_days?: number;
    points?: number;
    total_usage_limit?: number;
    per_user_limit?: number;
    valid_from?: string;
    valid_until?: string;
    is_active?: boolean;
}

/**
 * 创建礼品卡响应
 */
export interface CreateGiftCardResponse extends BaseResponse {
    data: {
        id: number;
        card_code: string;
    };
}

/**
 * 礼品卡列表数据
 */
interface GiftCardsListData {
    gift_cards: GiftCard[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

/**
 * 礼品卡列表响应
 */
export interface GiftCardsListResponse extends BaseResponse {
    data: GiftCardsListData;
}

/**
 * 礼品卡详情响应
 */
export interface GiftCardDetailResponse extends BaseResponse {
    data: GiftCard;
}

/**
 * 礼品卡使用记录响应（按卡查询）
 */
export interface GiftCardUsageByCardResponse extends BaseResponse {
    data: {
        card_code: string;
        card_name: string;
        total_usage_limit: number;
        used_count: number;
        usage_records: GiftCardUsageRecord[];
    };
}

/**
 * 礼品卡使用记录响应（按用户查询）
 */
export interface GiftCardUsageByUserResponse extends BaseResponse {
    data: {
        user_id: number;
        username: string;
        total_count: number;
        usage_records: GiftCardUsageRecord[];
    };
}

/**
 * 切换礼品卡状态响应
 */
export interface ToggleGiftCardStatusResponse extends BaseResponse {
    data: {
        card_code: string;
        is_active: boolean;
    };
}

/**
 * 创建礼品卡（管理员）
 */
export const createGiftCard = async (request: CreateGiftCardRequest): Promise<CreateGiftCardResponse> => {
    return axiosInstance.post('/admin/giftcard/create', request);
};

/**
 * 删除礼品卡（管理员）
 */
export const deleteGiftCard = async (card_code: string): Promise<BaseResponse> => {
    return axiosInstance.delete('/admin/giftcard/delete', {
        params: { card_code },
    });
};

/**
 * 启用/禁用礼品卡（管理员）
 */
export const toggleGiftCardStatus = async (
    card_code: string,
    is_active: boolean
): Promise<ToggleGiftCardStatusResponse> => {
    return axiosInstance.put('/admin/giftcard/toggle-status', {
        card_code,
        is_active,
    });
};

/**
 * 查询礼品卡列表（管理员）
 */
export const getGiftCards = async (
    page: number = 1,
    size: number = 20,
    keyword?: string
): Promise<GiftCardsListResponse> => {
    return axiosInstance.get('/admin/giftcard/list', {
        params: { page, size, keyword },
    });
};

/**
 * 查询礼品卡详情（管理员）
 */
export const getGiftCardDetail = async (card_code: string): Promise<GiftCardDetailResponse> => {
    return axiosInstance.get('/admin/giftcard/detail', {
        params: { card_code },
    });
};

/**
 * 查询某个礼品卡的所有使用记录（管理员）
 */
export const getGiftCardUsageByCard = async (
    card_code: string
): Promise<GiftCardUsageByCardResponse> => {
    return axiosInstance.get('/admin/giftcard/usage/by-card', {
        params: { card_code },
    });
};

/**
 * 查询某个用户的领取记录（管理员）
 */
export const getGiftCardUsageByUser = async (
    user_id: number
): Promise<GiftCardUsageByUserResponse> => {
    return axiosInstance.get('/admin/giftcard/usage/by-user', {
        params: { user_id },
    });
};
