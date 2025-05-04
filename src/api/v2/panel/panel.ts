import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

interface FriendLink {
    name: string;
    description: string | null;
    url: string;
}

interface PanelInfoData {
    tunnel_amount: number;
    node_amount: number;
    user_amount: number;
    friend_links: FriendLink[] | null;
}

interface PanelInfoResponse extends BaseResponse {
    data: PanelInfoData;
}

/**
 * 获取面板信息
 * @returns {Promise<PanelInfoResponse>} 面板信息数据
 */
export const getPanelInfo = async (): Promise<PanelInfoResponse> => {
    return axiosInstance.get('/panelinfo');
};

interface Metrics {
    cpu: number; // cpu负载
    memory: number; // 内存压力
    steal: number; // 宿主机抢占资源
    ioLatency: number; // IO延迟
    threadContention: number; // 线程征用
}

interface ServerStatusResponse {
    metrics: Metrics;
    serverName: string; // 当前API站点
    load: number; // 总负载
}

/**
 * 获取API状态
 * @returns {Promise<ServerStatusResponse>} API状态数据
 */
export const getServerStatus = async (): Promise<ServerStatusResponse> => {
    return axiosInstance.get('/api/server-status');
};
