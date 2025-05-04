import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

interface TunnelListResponse extends BaseResponse {
    data: Array<{
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
        nodestate: string;
        ip: string;
    }> | null;
}

/**
 * 获取隧道列表
 * @param {string} token 用户的身份令牌
 * @returns {Promise<TunnelListResponse>} 返回包含隧道列表的响应数据
 */
export const getTunnelList = (token: string): Promise<TunnelListResponse> => {
    return axiosInstance.get('/tunnel', {
        params: { token },
    });
};

interface CreateTunnelResponse extends BaseResponse {
    data: {
        id: number | null;
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
        uptime: string | null;
        client_version: string;
        today_traffic_in: number;
        today_traffic_out: number;
        cur_conns: number;
        nodestate: string | null;
        ip: string | null;
    };
}

/**
 * 创建隧道
 * @param {Object} params 包含隧道创建所需的参数
 * @param {string} params.token 用户的身份令牌
 * @param {string} params.tunnelname 隧道名称
 * @param {string} params.node 节点名称
 * @param {string} params.porttype 端口类型（如 TCP/UDP）
 * @param {number} params.localport 本地端口号
 * @param {boolean} params.encryption 是否启用数据加密
 * @param {boolean} params.compression 是否启用数据压缩
 * @param {string} [params.localip] 本地 IP 地址（可选）
 * @param {number} [params.remoteport] 远程端口号（可选）
 * @param {string} [params.banddomain] 绑定的域名（可选）
 * @param {string} [params.extraparams] 额外参数（可选）
 * @returns {Promise<CreateTunnelResponse>} 返回创建隧道的响应数据
 */
export const createTunnel = (params: {
    token: string;
    tunnelname: string;
    node: string;
    porttype: string;
    localport: number;
    encryption: boolean;
    compression: boolean;
    localip?: string;
    remoteport?: number;
    banddomain?: string;
    extraparams?: string;
}): Promise<CreateTunnelResponse> => {
    return axiosInstance.post('/create_tunnel', params);
};

/**
 * 删除隧道
 * @param {string} token 用户的身份令牌
 * @param {number} tunnelid 要删除的隧道 ID
 * @returns {Promise<BaseResponse>} 返回删除隧道的响应数据
 * @deprecated 此函数当前不可用，可能会在未来的版本中恢复
 */
export const deleteTunnel = (
    token: string,
    tunnelid: number
): Promise<BaseResponse> => {
    return axiosInstance.post('/delete_tunnel', { token, tunnelid });
};

/**
 * 修改隧道
 * @param {Object} params 包含隧道修改所需的数据
 * @param {number} params.tunnelid 隧道 ID
 * @param {string} params.token 用户的身份令牌
 * @param {string} [params.tunnelname] 隧道名称（可选）
 * @param {string} [params.node] 节点名称（可选）
 * @param {string} [params.localip] 本地 IP 地址（可选）
 * @param {string} [params.porttype] 端口类型（可选）
 * @param {number} [params.localport] 本地端口号（可选）
 * @param {number} [params.remoteport] 远程端口号（可选）
 * @param {string} [params.banddomain] 绑定的域名（可选）
 * @param {boolean} [params.encryption] 是否启用数据加密（可选）
 * @param {boolean} [params.compression] 是否启用数据压缩（可选）
 * @param {string} [params.extraparams] 额外参数（可选）
 * @returns {Promise<BaseResponse>} 返回修改隧道的响应数据
 */
export const updateTunnel = (params: {
    tunnelid: number;
    token: string;
    tunnelname?: string;
    node?: string;
    localip?: string;
    porttype?: string;
    localport?: number;
    remoteport?: number;
    banddomain?: string;
    encryption?: boolean;
    compression?: boolean;
    extraparams?: string;
}): Promise<BaseResponse> => {
    return axiosInstance.post('/update_tunnel', params);
};

interface GetTunnelConfigResponse extends BaseResponse {
    data: string;
}

/**
 * 获取隧道配置文件
 * @param {string} token 用户的身份令牌
 * @param {string} node 节点名称
 * @param {string} [tunnel_names] 隧道名称，多个名称用逗号分隔（可选）
 * @returns {Promise<GetTunnelConfigResponse>} 返回隧道配置文件的响应数据
 */
export const getTunnelConfig = (
    token: string,
    node: string,
    tunnel_names?: string
): Promise<GetTunnelConfigResponse> => {
    return axiosInstance.get('/tunnel_config', {
        params: { token, node, tunnel_names },
    });
};
