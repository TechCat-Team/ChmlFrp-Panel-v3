/**
 * 域名管理页面类型定义
 */

export interface FreeDomain {
    id: number;
    userid: number;
    domain: string;
    record: string;
    type: string;
    target: string;
    remarks?: string;
    ttl: string;
}

export interface Domain {
    id: number;
    domain: string;
    remarks: string | null;
    icpFiling: boolean;
}

export interface DomainFormModel {
    selectedDomain: string;
    selectedRecordType: string;
    recordValue: string;
    TTLValue: TTLValue;
    target: string;
}

export interface FastDomainFormModel {
    selectedDomain: string;
    selectedRecordType: 'CNAME' | 'Java版MC';
    selectedTunnel: string | null;
    recordValue: string;
}

export type TTLValue =
    | '1分钟'
    | '2分钟'
    | '5分钟'
    | '10分钟'
    | '15分钟'
    | '30分钟'
    | '1小时'
    | '2小时'
    | '5小时'
    | '12小时'
    | '1天';

export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'SRV';

export interface SelectedTunnelInfo {
    label: string;
    ip: string;
    dorp: string;
}

export interface TunnelOption {
    name: string;
    node: string;
    ip: string;
    dorp: string;
    label: string;
    value: string;
}

export interface DomainOption {
    label: string;
    value: string;
}

export interface TTLOption {
    label: TTLValue;
    value: TTLValue;
}

export interface RecordTypeOption {
    label: string;
    value: string;
}
