import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

interface Node {
    id: number;
    name: string;
    area: string;
    nodegroup: 'user' | 'vip';
    china: 'yes' | 'no';
    web: 'yes' | 'no';
    udp: 'true' | 'false';
    fangyu: 'true' | 'false';
    notes: string;
}

interface NodeListResponse extends BaseResponse {
    data: Node[];
}

/**
 * 获取节点列表
 * @returns {Promise<NodeListResponse>} 节点列表数据
 */
export const getNodeList = async (): Promise<NodeListResponse> => {
    return axiosInstance.get('/node');
};

interface NodeInfoData {
    udp: 'true' | 'false';
    total_traffic_in: number;
    notes: string;
    cpu_info: string;
    fangyu: 'true' | 'false';
    rport: string;
    storage_total: number;
    nodegroup: 'user' | 'vip';
    apitoken: string;
    web: 'yes' | 'no';
    ipv6: string | null;
    toowhite: boolean;
    uptime_seconds: number;
    id: number;
    state: 'online' | 'offline';
    bandwidth_usage_percent: number;
    memory_total: number;
    nodetoken: string;
    load15: number;
    area: string;
    realIp: string;
    ip: string;
    num_cores: number;
    coordinates: string;
    load5: number;
    version: string;
    load1: number;
    china: 'yes' | 'no';
    port: number;
    total_traffic_out: number;
    name: string;
    adminPort: number;
    storage_used: number;
}

interface NodeInfoResponse extends BaseResponse {
    data: NodeInfoData;
}

/**
 * 获取节点详情
 * @returns {Promise<NodeInfoResponse>} 节点详情数据
 */
export const getNodeInfo = async (token: string, node: string): Promise<NodeInfoResponse> => {
    return axiosInstance.get('/nodeinfo', { params: { token, node } });
};

interface NodeStats {
    total_traffic_in: number; // 今日总下载流量
    total_traffic_out: number; // 今日总上传流量
    cur_counts: number; // 当前连接数
    node_name: string; // 节点名
    id: number; // 节点ID
    state: 'offline' | 'online'; // 状态
    bandwidth_usage_percent: number; // 带宽负载（百分比）
    cpu_usage: number; // CPU负载（百分比）
    nodegroup: 'user' | 'vip'; // 节点权限
    client_counts: number; // 节点在线客户端
    tunnel_counts: number; // 节点隧道数
}

interface NodeStatsResponse extends BaseResponse {
    data: NodeStats[];
}

/**
 * 获取节点状态
 * @returns {Promise<NodeStatsResponse>} 节点状态数据
 */
export const getNodeStats = async (): Promise<NodeStatsResponse> => {
    return axiosInstance.get('/node_stats');
};

interface NodeUptime {
    recorded_at: string; // 时间
    uptime: number; // 在线率，单位%，最大4位小数点
}

interface NodeUptimeData {
    node_name: string; // 节点名
    state: 'online' | 'offline'; // 节点状态
    id: number; // 节点ID
    group: 'user' | 'vip'; // 节点权限组
    history_uptime: NodeUptime[]; // uptime统计
}

interface NodeUptimeResponse extends BaseResponse {
    data: NodeUptimeData[];
}

/**
 * 获取节点在线率
 * @param {number} time 返回多少天的uptime数据，最大90天
 * @param {string} [node] 可选，返回对应节点的uptime数据
 * @returns {Promise<NodeUptimeResponse>} 节点在线率数据
 */
export const getNodeUptime = async (time: number, node?: string): Promise<NodeUptimeResponse> => {
    return axiosInstance.get('/node_uptime', { params: { time, node } });
};

interface NodeDetails {
    total_traffic_in: number; // 今日下载流量
    cpu_info: string; // CPU信息
    num_cores: number; // CPU核心数
    coordinates: string; // 经纬度
    storage_total: number; // 总储存
    load5: number; // load5
    version: string; // ChmlFrp版本
    load1: number; // load1
    total_traffic_out: number; // 今日总上传流量
    uptime_seconds: number; // 系统运行时间
    memory_total: number; // 总内存
    storage_used: number; // 已用储存
    load15: number; // load15
}

interface StatusListItem {
    proxy_https: number; // 映射的https端口数
    download_bandwidth_usage_percent: number; // 下载带宽负载（百分比）
    cur_conns: number; // 连接数
    sent_packets: number; // 发送的数据包数量
    memory_used: number; // 已用内存
    active_conn: number; // 活跃的连接数
    recv_packets: number; // 接收的数据包数
    proxy_tcp: number; // 映射的tcp端口数
    proxy_udp: number; // 映射的udp端口数
    proxy_http: number; // 映射的http端口数
    upload_bandwidth_usage_percent: number; // 上传带宽负载（百分比）
    cpu_usage: number; // CPU负载
    page_tables: number; // 页面表占用的内存大小
    passive_conn: number; // 被动连接数
    client_counts: number; // 映射客户端数
    timestamp: string; // 数据统计时间
}

interface NodeStatusInfoResponse extends BaseResponse {
    data: {
        node_details: NodeDetails;
        status_list: StatusListItem[];
        node_name: string;
    };
}

/**
 * 获取节点状态详情
 * @param {string} nodename 节点名称
 * @returns {Promise<NodeStatusInfoResponse>} 节点状态详情数据
 */
export const getNodeStatusInfo = async (nodename: string): Promise<NodeStatusInfoResponse> => {
    return axiosInstance.get('/node_status_info', { params: { nodename } });
};
