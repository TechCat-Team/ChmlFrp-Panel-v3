/**
 * 首页类型定义
 */

export interface FriendLink {
    name: string;
    url: string;
    description: string | null;
}

export interface ApiDataItem {
    time: string;
    traffic_in: number | string;
    traffic_out: number | string;
}

export interface ApiData {
    status: string;
    data: ApiDataItem[];
}

export interface SignInInfo {
    last_sign_in_time: string;
    total_points: number;
    total_sign_ins: number;
    count_of_matching_records: number;
    is_signed_in_today: boolean;
}

export interface PanelInfo {
    tunnel_amount: string;
    node_amount: string;
    user_amount: string;
    friend_links: FriendLink[];
}
