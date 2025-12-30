import axiosInstance from '../axios/axiosInstance';
import axios from 'axios';
import { BaseResponse } from '../axios/axiosInstance';
import { useUserStore } from '@/stores/user';

// SSL证书提供商类型
export type SSLProvider = 'letsencrypt' | 'zerossl' | 'google';

// 挑战类型
export type ChallengeType = 'http01' | 'dns01';

// 证书状态
export type CertificateStatus = 'pending' | 'processing' | 'issued' | 'failed' | 'expired' | 'revoked';

// 申请证书请求参数
export interface RequestCertificateParams {
    provider: SSLProvider;
    domains: string[] | string; // 可以是数组或逗号分隔的字符串
    challengeType?: ChallengeType; // 可选，默认为http01
}

// HTTP-01挑战响应数据
export interface Http01ChallengeData {
    id: number;
    provider: SSLProvider;
    domains: string;
    status: CertificateStatus;
    challengeType: 'http01';
    challengeToken: string;
    challengeKeyAuthorization: string;
    createdAt: string;
}

// DNS-01挑战响应数据
export interface Dns01ChallengeData {
    id: number;
    provider: SSLProvider;
    domains: string;
    status: CertificateStatus;
    challengeType: 'dns01';
    challengeToken: string;
    challengeKeyAuthorization: string;
    dnsRecordName: string;
    dnsRecordValue: string;
    instructions: string;
    createdAt: string;
}

// 申请证书响应
export interface RequestCertificateResponse extends BaseResponse {
    data: Http01ChallengeData | Dns01ChallengeData;
}

// 验证证书请求参数
export interface VerifyCertificateParams {
    // 无参数，token 通过 Bearer header 传递
}

// 验证证书响应数据
export interface VerifyCertificateData {
    id: number;
    provider: SSLProvider;
    domains: string;
    status: CertificateStatus;
    issuedAt?: string;
    expiresAt?: string;
}

// 验证证书响应
export interface VerifyCertificateResponse extends BaseResponse {
    data: VerifyCertificateData;
}

// 证书列表项
export interface CertificateListItem {
    id: number;
    provider: SSLProvider;
    domains: string;
    status: CertificateStatus;
    issuedAt?: string;
    expiresAt?: string;
    createdAt: string;
}

// 证书列表响应
export interface CertificateListResponse extends BaseResponse {
    data: {
        certificates: CertificateListItem[];
        total: number;
    };
}

// 证书详情（已签发）
export interface IssuedCertificateDetail {
    id: number;
    provider: SSLProvider;
    domains: string;
    status: 'issued';
    certificate: string;
    privateKey: string;
    chain: string;
    issuedAt: string;
    expiresAt: string;
}

// 证书详情（待验证）
export interface PendingCertificateDetail {
    id: number;
    provider: SSLProvider;
    domains: string;
    status: 'pending';
    challengeToken?: string;
    challengeKeyAuthorization?: string;
    challengeType?: ChallengeType;
    dnsRecordName?: string;
    dnsRecordValue?: string;
    instructions?: string;
}

// 证书详情响应
export interface CertificateDetailResponse extends BaseResponse {
    data: IssuedCertificateDetail | PendingCertificateDetail;
}

// 删除证书请求参数（已废弃，token 通过 Bearer header 传递）
export interface DeleteCertificateParams {
    // 无参数，token 通过 Bearer header 传递
}

/**
 * 申请SSL证书
 * @param params 申请证书参数
 * @returns 申请证书响应
 */
export const requestCertificate = async (params: RequestCertificateParams): Promise<RequestCertificateResponse> => {
    return axiosInstance.post('/ssl/request', params);
};

/**
 * 验证并签发证书
 * @param id 证书ID
 * @returns 验证证书响应
 */
export const verifyCertificate = async (id: number): Promise<VerifyCertificateResponse> => {
    return axiosInstance.post(`/ssl/verify/${id}`, {});
};

/**
 * 查询证书列表
 * @param status 证书状态筛选（可选）
 * @returns 证书列表响应
 */
export const getCertificateList = async (status?: CertificateStatus): Promise<CertificateListResponse> => {
    const params: Record<string, string> = {};
    if (status) {
        params.status = status;
    }
    return axiosInstance.get('/ssl/list', { params });
};

/**
 * 获取证书详情
 * @param id 证书ID
 * @returns 证书详情响应
 */
export const getCertificateDetail = async (id: number): Promise<CertificateDetailResponse> => {
    return axiosInstance.get(`/ssl/detail/${id}`);
};

/**
 * 下载证书
 * @param id 证书ID
 * @param type 下载类型（可选，默认为full）
 * @returns 证书文件内容
 */
export const downloadCertificate = async (
    id: number,
    type: 'certificate' | 'privatekey' | 'chain' | 'full' = 'full'
): Promise<string> => {
    // 对于文本响应，使用原生axios以避免响应拦截器的JSON解析
    // 需要手动添加 Authorization header
    const userStore = useUserStore();
    const token = userStore.userInfo?.usertoken;
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${axiosInstance.defaults.baseURL}/ssl/download/${id}`, {
        params: { type },
        headers,
        responseType: 'text',
    });
    return response.data;
};

/**
 * 删除证书
 * @param id 证书ID
 * @returns 删除证书响应
 */
export const deleteCertificate = async (id: number): Promise<BaseResponse> => {
    return axiosInstance.delete(`/ssl/delete/${id}`);
};
