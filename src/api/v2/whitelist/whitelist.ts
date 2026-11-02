import axiosInstance, { type BaseResponse } from '../axios/axiosInstance';

export type WhitelistStatus = 'verifying' | 'approved' | 'rejected' | 'error' | 'removed' | 'revoked';
export interface WhitelistRecord {
    id: number;
    user_id: number;
    username?: string;
    domain: string;
    status: WhitelistStatus;
    source: string;
    licence: string;
    company: string;
    nature: string;
    checked_date: string;
    task_no: string;
    message: string;
    remarks: string;
    created_at: string;
    approved_at: string | null;
    verified_at: string | null;
    updated_at: string;
    free_delete_at: string | null;
    delete_fee: number;
}
export interface WhitelistLog {
    id: number;
    actor_id: number;
    actor_name?: string;
    action: string;
    detail: string;
    created_at: string;
}
export interface WhitelistPolicy {
    dailyLimit: number;
    domainLimit: number;
    deleteFee: number;
    freeDeleteMonths: number;
    timezone: string;
    verificationConfigured: boolean;
    suffixSource: string;
    suffixSnapshotDate: string;
    supportedTlds: string[];
}
export interface WhitelistSummary {
    activeCount: number;
    usedToday: number;
    resetAt: string;
    balance: number;
    policy: WhitelistPolicy;
}
export interface WhitelistDetail {
    record: WhitelistRecord;
    logs: WhitelistLog[];
}
export interface WhitelistPage {
    items: WhitelistRecord[];
    total: number;
    page: number;
    size: number;
}
export interface QuotaDetail {
    summary: WhitelistSummary;
    logs: WhitelistLog[];
}
interface Response<T> extends BaseResponse {
    data: T;
}
const root = (admin = false) => (admin ? '/admin/domain-whitelist' : '/domain-whitelist');
export const summary = (): Promise<Response<WhitelistSummary>> => axiosInstance.get(`${root()}/summary`);
export const policy = (): Promise<Response<WhitelistPolicy>> => axiosInstance.get(`${root(true)}/policy`);
export const preview = (domain: string): Promise<Response<{ domain: string }>> =>
    axiosInstance.get(`${root()}/preview`, { params: { domain } });
export const list = (
    admin: boolean,
    params: { keyword?: string; status?: string; userId?: number; page: number; size: number }
): Promise<Response<WhitelistPage>> => axiosInstance.get(root(admin), { params });
export const listAll = (): Promise<Response<WhitelistRecord[]>> => axiosInstance.get(`${root()}/all`);
export const detail = (id: number, admin = false): Promise<Response<WhitelistDetail>> =>
    axiosInstance.get(`${root(admin)}/${id}`);
export const submit = (
    body: { domain: string; remarks: string; userId?: number },
    admin = false
): Promise<Response<WhitelistDetail>> => axiosInstance.post(root(admin), body);
export const remove = (id: number, acceptFee: boolean): Promise<Response<{ charged: number; balance: number }>> =>
    axiosInstance.post(`${root()}/${id}/delete`, { acceptFee });
export const manage = (id: number, action: string, reason: string): Promise<Response<WhitelistDetail>> =>
    axiosInstance.post(`${root(true)}/${id}`, { action, reason });
export const quota = (userId: number): Promise<Response<QuotaDetail>> =>
    axiosInstance.get(`${root(true)}/users/${userId}`);
export const resetQuota = (userId: number, reason: string): Promise<Response<QuotaDetail>> =>
    axiosInstance.post(`${root(true)}/users/${userId}/reset-quota`, { reason });

export const checkTunnel = (body: {
    node: string;
    porttype: string;
    domain: string;
}): Promise<Response<{ required: boolean; approved: boolean; domain: string }>> =>
    axiosInstance.post('/tunnel/check-domain-whitelist', body);
