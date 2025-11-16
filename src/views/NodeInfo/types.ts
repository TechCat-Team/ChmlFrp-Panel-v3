export interface NodeDetails {
    total_traffic_in: number;
    cpu_info: string;
    num_cores: number;
    coordinates: string;
    storage_total: number;
    load5: number;
    version: string;
    load1: number;
    total_traffic_out: number;
    uptime_seconds: number;
    memory_total: number;
    storage_used: number;
    load15: number;
}

export interface Status {
    proxy_https: number;
    download_bandwidth_usage_percent: number;
    cur_conns: number;
    sent_packets: number;
    memory_used: number;
    active_conn: number;
    recv_packets: number;
    proxy_tcp: number;
    proxy_udp: number;
    proxy_http: number;
    upload_bandwidth_usage_percent: number;
    cpu_usage: number;
    page_tables: number;
    passive_conn: number;
    timestamp: string;
    client_counts: number;
}

export interface ApiResponse {
    msg: string;
    code: number;
    data: {
        node_details: NodeDetails;
        status_list: Status[];
    };
}

export interface Marker {
    position: number[];
    title: string;
}

export interface TunnelTypeData {
    TCP: number;
    UDP: number;
    HTTP: number;
    HTTPS: number;
}

