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
export const getNodes = async (
    admin_token: string
): Promise<NodesListResponse> => {
    return axiosInstance.get('/admin/nodes', {
        params: { admin_token },
    });
};

/** 创建节点（管理员） */
export const createNode = async (
    admin_token: string,
    payload: Record<string, unknown>
): Promise<BaseResponse> => {
    return axiosInstance.post('/admin/nodes', payload, {
        params: { admin_token },
    });
};

/** 更新节点（管理员） */
export const updateNode = async (
    admin_token: string,
    nodeId: number,
    payload: Record<string, unknown>
): Promise<BaseResponse> => {
    return axiosInstance.put(`/admin/nodes/${nodeId}`, payload, {
        params: { admin_token },
    });
};

/** 删除节点（管理员） */
export const deleteNode = async (
    admin_token: string,
    nodeId: number
): Promise<BaseResponse> => {
    return axiosInstance.delete(`/admin/nodes/${nodeId}`, {
        params: { admin_token },
    });
};

/**
 * 获取用户列表（管理员）
 */
export const getUsers = async (
    admin_token: string,
    page: number,
    size: number
): Promise<UsersListResponse> => {
    return axiosInstance.get('/admin/users', {
        params: { admin_token, page, size },
    });
};

/**
 * 搜索用户（管理员）
 */
export const searchUsers = async (
    admin_token: string,
    type: 'username' | 'email' | 'id',
    value: string,
    page: number,
    size: number
): Promise<UsersListResponse> => {
    return axiosInstance.get('/admin/search/users', {
        params: { admin_token, type, value, page, size },
    });
};

/**
 * 更新用户（管理员）
 */
export const updateUser = async (
    admin_token: string,
    userId: number,
    payload: Record<string, unknown>
): Promise<BaseResponse> => {
    return axiosInstance.put(`/admin/users/${userId}`, payload, {
        params: { admin_token },
    });
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
export const getTunnels = async (
    admin_token: string,
    page: number,
    size: number
): Promise<TunnelsListResponse> => {
    return axiosInstance.get('/admin/tunnels', {
        params: { admin_token, page, size },
    });
};

/**
 * 搜索隧道（管理员）
 */
export const searchTunnels = async (
    admin_token: string,
    type: 'user_id' | 'name' | 'tunnel_id' | 'dorp',
    value: string,
    page: number,
    size: number
): Promise<TunnelSearchResponse> => {
    return axiosInstance.get('/admin/tunnels/search', {
        params: { admin_token, type, value, page, size },
    });
};

/**
 * 获取隧道详情（管理员）
 */
export const getTunnelById = async (
    admin_token: string,
    tunnelId: number
): Promise<TunnelDetailResponse> => {
    return axiosInstance.get(`/admin/tunnels/${tunnelId}`, {
        params: { admin_token },
    });
};

/**
 * 管理员强制下线隧道
 */
export const offlineTunnel = async (
    admin_token: string,
    identifier: string,
    identifierType: 'id' | 'name' = 'name'
): Promise<BaseResponse> => {
    return axiosInstance.post('/admin/tunnels/offline', null, {
        params: { 
            admin_token, 
            identifier, 
            type: identifierType 
        },
    });
};


