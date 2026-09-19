import axios from 'axios';
import axiosInstance, { BaseResponse } from '../axios/axiosInstance';
import { getAuthorizationHeaders } from '@/utils/authToken';

export type ViolationType = 'porn' | 'site' | 'other';

export type ViolationStatus = 'pending' | 'passed' | 'banned' | 'rejected';

/** 审核动作，与后端 /admin/violations/{id}/review 的 action 取值一一对应 */
export type ViolationReviewAction = 'pass' | 'ban' | 'reject';

/** 违规记录（列表项，不含违规描述） */
export interface ViolationRecord {
    id: number;
    type: ViolationType;
    title: string;
    target: string;
    user_id: number | null;
    username: string;
    tunnel_name: string;
    node_name: string;
    reporter: string;
    status: ViolationStatus;
    evidence_count: number;
    reviewed_by: number | null;
    reviewed_by_name: string | null;
    reviewed_at: string | null;
    review_remark: string | null;
    reported_at: string;
}

/** 证据附件元数据，图片本体需要单独拉取并解密 */
export interface ViolationEvidenceMeta {
    id: number;
    content_type: string;
    size_bytes: number;
    sha256: string;
    crypto_alg: string;
    sort_order: number;
}

/** 违规记录详情 */
export interface ViolationDetail extends ViolationRecord {
    description: string;
    evidences: ViolationEvidenceMeta[];
}

export interface ViolationListParams {
    status: ViolationStatus;
    type?: ViolationType | null;
    keyword?: string;
    startTime?: number | null;
    endTime?: number | null;
    page?: number;
    size?: number;
}

export interface ViolationListResponse extends BaseResponse {
    data: {
        violations: ViolationRecord[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

export interface ViolationDetailResponse extends BaseResponse {
    data: ViolationDetail;
}

export interface ViolationReviewResponse extends BaseResponse {
    data: {
        id: number;
        status: ViolationStatus;
    };
}

/**
 * 按状态分页查询违规记录（管理员）
 */
export const getViolations = async (params: ViolationListParams): Promise<ViolationListResponse> => {
    const { status, type, keyword, startTime, endTime, page = 1, size = 10 } = params;
    return axiosInstance.get('/admin/violations', {
        params: {
            status,
            type: type || undefined,
            keyword: keyword?.trim() || undefined,
            start_time: startTime || undefined,
            end_time: endTime || undefined,
            page,
            size,
        },
    });
};

/**
 * 获取违规记录详情（管理员）
 */
export const getViolationDetail = async (id: number): Promise<ViolationDetailResponse> => {
    return axiosInstance.get(`/admin/violations/${id}`);
};

/**
 * 审核违规记录（管理员）
 */
export const reviewViolation = async (
    id: number,
    action: ViolationReviewAction,
    remark?: string
): Promise<ViolationReviewResponse> => {
    return axiosInstance.post(`/admin/violations/${id}/review`, { action, remark });
};

/**
 * 拉取证据图片的密文。
 * 该接口返回的是二进制密文而非统一 JSON 结构，因此绕过响应拦截器，直接携带管理员 token 请求。
 */
export const fetchViolationEvidenceCiphertext = async (evidenceId: number): Promise<ArrayBuffer> => {
    const response = await axios.get(`${axiosInstance.defaults.baseURL}/admin/violations/evidence/${evidenceId}`, {
        headers: getAuthorizationHeaders(),
        responseType: 'arraybuffer',
    });
    return response.data as ArrayBuffer;
};
