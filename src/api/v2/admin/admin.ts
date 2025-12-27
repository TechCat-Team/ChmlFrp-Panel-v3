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
    type: 'username' | 'email' | 'id' | 'token',
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

// ---------------- System Messages (Admin) ----------------

/**
 * 系统消息数据接口（详情）
 */
export interface SystemMessage {
    id: number;
    title: string;
    contentMd: string;
    priority: number;
    targetUsers: string[] | null;
    publishTime: string;
    createdAt: string;
}

/**
 * 系统消息列表项接口（列表API不包含contentMd）
 */
export interface SystemMessageListItem {
    id: number;
    title: string;
    priority: number;
    targetUsers: string[] | string | null; // 可能是数组或JSON字符串
    publishTime: string;
    createdAt: string;
}

/**
 * 创建系统消息请求参数
 */
export interface CreateSystemMessageRequest {
    title: string;
    contentMd: string;
    priority?: number;
    targetUsers?: string[] | null;
    publishTime?: string;
}

/**
 * 更新系统消息请求参数
 */
export interface UpdateSystemMessageRequest {
    id: number;
    title?: string;
    contentMd?: string;
    priority?: number;
    targetUsers?: string[] | null;
    publishTime?: string;
}

/**
 * 创建系统消息响应
 */
export interface CreateSystemMessageResponse extends BaseResponse {
    data: SystemMessage;
}

/**
 * 更新系统消息响应
 */
export interface UpdateSystemMessageResponse extends BaseResponse {
    data: SystemMessage;
}

/**
 * 创建系统消息（管理员）
 */
export const createSystemMessage = async (
    request: CreateSystemMessageRequest
): Promise<CreateSystemMessageResponse> => {
    return axiosInstance.post('/admin/message/create', {
        ...request,
    });
};

/**
 * 更新系统消息（管理员）
 */
export const updateSystemMessage = async (
    request: UpdateSystemMessageRequest
): Promise<UpdateSystemMessageResponse> => {
    return axiosInstance.post('/admin/message/update', {
        ...request,
    });
};

/**
 * 删除系统消息（管理员）
 */
export const deleteSystemMessage = async (id: number): Promise<BaseResponse> => {
    return axiosInstance.post('/admin/message/delete', {
        id,
    });
};

/**
 * 消息列表数据
 */
interface SystemMessagesListData {
    messages: SystemMessageListItem[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

/**
 * 消息列表响应
 */
export interface SystemMessagesListResponse extends BaseResponse {
    data: SystemMessagesListData;
}

/**
 * 获取消息列表参数
 */
export interface GetSystemMessagesListParams {
    page?: number;
    size?: number;
    type?: 'all' | 'title' | 'content' | 'id';
    value?: string;
}

/**
 * 消息详情响应
 */
export interface SystemMessageDetailResponse extends BaseResponse {
    data: SystemMessage;
}

/**
 * 获取所有消息列表（管理员）- 支持分页和检索
 */
export const getSystemMessagesList = async (
    params: GetSystemMessagesListParams = {}
): Promise<SystemMessagesListResponse> => {
    const { page = 1, size = 10, type = 'all', value } = params;

    const queryParams: Record<string, string | number> = {
        page,
        size,
        type,
    };

    if (value && type !== 'all') {
        queryParams.value = value;
    }

    return axiosInstance.get('/admin/message/list', {
        params: queryParams,
    });
};

/**
 * 获取消息详情（管理员）
 */
export const getSystemMessageDetail = async (id: number): Promise<SystemMessageDetailResponse> => {
    return axiosInstance.get(`/admin/message/detail/${id}`);
};
