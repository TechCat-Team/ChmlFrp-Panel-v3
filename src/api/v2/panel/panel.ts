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

interface SystemData {
    windows: Array<{ route: string; architecture: string }>;
    linux: Array<{ route: string; architecture: string }>;
    freebsd: Array<{ route: string; architecture: string }>;
    darwin: Array<{ route: string; architecture: string }>;
}

interface DownloadInfoData {
    system: SystemData;
    update_time: string;
    link: string;
    version: string;
}

interface DownloadInfoResponse extends BaseResponse {
    data: DownloadInfoData;
}

/**
 * 获取下载信息
 * @param {string} [link]
 * @returns {Promise<DownloadInfoResponse>} 下载信息数据
 */
export const getDownloadInfo = async (link?: string): Promise<DownloadInfoResponse> => {
    return axiosInstance.get('/download_info', {
        params: link ? { link } : undefined,
    });
};

interface LauncherPlatform {
    signature: string;
    url: string;
}

interface LauncherUpdateData {
    pub_date: string;
    notes: string;
    version: string;
    platforms: Record<string, LauncherPlatform>;
}

/**
 * 获取图形客户端更新信息
 */
export const getLauncherUpdateInfo = async (): Promise<LauncherUpdateData> => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/launcher/update`);
    if (!res.ok) throw new Error('Failed to fetch launcher update info');
    return res.json();
};
