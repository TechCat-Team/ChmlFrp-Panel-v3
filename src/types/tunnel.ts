/**
 * 隧道相关类型定义
 */

export interface TunnelStatus {
    type: string;
    label: string;
    description: string;
}

export interface TunnelCard {
    id: number;
    name: string;
    localip: string;
    type: string;
    nport: number;
    node: string;
    state: string;
    uptime: string;
    today_traffic_in: number;
    today_traffic_out: number;
    cur_conns: number;
    ip: string;
    nodestate: string;
    status?: TunnelStatus;
    tags?: string[];
    dorp: string;
    ap: string;
    encryption: string;
    compression: string;
}

export interface NodeCard {
    id: number;
    name: string;
    nodegroup: string;
    web: string;
    china: string;
    fangyu: string;
    udp: string;
    area: string;
    notes: string;
}

export interface NodeInfo {
    id: number;
    area: string;
    realIp: string;
    udp: boolean;
    notes: string;
    ip: string;
    coordinates: string;
    fangyu: boolean;
    rport: string;
    nodegroup: string;
    china: string;
    web: string;
    ipv6: string;
    toowhite: boolean;
    name: string;
    state: string;
    bandwidth_usage_percent: number;
}

export interface TunnelFormData {
    name: string;
    localip: string;
    node: string;
    type: string;
    nport: string;
    domainNameLabel: string;
    dorp: number | string;
    choose: string;
    encryption: boolean;
    compression: boolean;
    ap: string;
    domain: string;
    recordValue: string;
    remarks: string;
    tunnelid: number;
    chooseOld: string;
    recordValueOld: string;
    nodeOld: string;
    nameOld: string;
}

export interface NodeFilters {
    udp: boolean;
    noPermission: boolean;
    web: 'all' | 'yes' | 'no';
    region: 'all' | 'china' | 'overseas';
}

export interface Domain {
    id: number;
    domain: string;
    remarks: string | null;
    icpFiling: boolean;
}

export interface MapMarker {
    position: [number, number];
    title: string;
}

