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

/** 申诉处理状态 */
export type AppealStatus = 'pending' | 'approved' | 'rejected';

/** 审核动作，与后端 /admin/violation-appeals/{id}/review 的 action 取值一一对应 */
export type AppealReviewAction = 'approve' | 'reject';

/** 申诉列表项，附带关联封禁记录的信息 */
export interface ViolationAppealRecord {
    id: number;
    ban_record_id: number;
    user_id: number | null;
    username: string;
    type: ViolationType | null;
    tunnel_name: string | null;
    url: string | null;
    node_name: string | null;
    ban_reason: string | null;
    banned_at: string | null;
    unbanned_at: string | null;
    reason: string;
    contact: string;
    image_count: number;
    appealed_at: string;
    status: AppealStatus;
    reviewed_by: number | null;
    reviewed_by_name: string | null;
    reviewed_at: string | null;
    review_remark: string | null;
}

/** 佐证图片元数据，图片本体需单独拉取 */
export interface ViolationAppealImageMeta {
    id: number;
    file_name: string;
    content_type: string;
    size_bytes: number;
    sort_order: number;
}

export interface ViolationAppealDetail extends ViolationAppealRecord {
    images: ViolationAppealImageMeta[];
}

export interface ViolationAppealListParams {
    status?: AppealStatus | null;
    keyword?: string;
    startTime?: number | null;
    endTime?: number | null;
    page?: number;
    size?: number;
}

export interface ViolationAppealListResponse extends BaseResponse {
    data: {
        appeals: ViolationAppealRecord[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
    };
}

export interface ViolationAppealDetailResponse extends BaseResponse {
    data: ViolationAppealDetail;
}

export interface AppealReviewResponse extends BaseResponse {
    data: {
        id: number;
        status: AppealStatus;
        unbanned: boolean;
    };
}

/**
 * 分页查询封禁申诉（管理员）
 */
export const getViolationAppeals = async (params: ViolationAppealListParams = {}): Promise<ViolationAppealListResponse> => {
    const { status, keyword, startTime, endTime, page = 1, size = 10 } = params;
    return axiosInstance.get('/admin/violation-appeals', {
        params: {
            status: status || undefined,
            keyword: keyword?.trim() || undefined,
            start_time: startTime || undefined,
            end_time: endTime || undefined,
            page,
            size,
        },
    });
};

/**
 * 获取申诉详情（管理员），含关联封禁记录与佐证图片元数据
 */
export const getViolationAppealDetail = async (id: number): Promise<ViolationAppealDetailResponse> => {
    return axiosInstance.get(`/admin/violation-appeals/${id}`);
};

/**
 * 审核申诉（管理员）。approve 会联动解封并恢复账号权益。
 */
export const reviewViolationAppeal = async (
    id: number,
    action: AppealReviewAction,
    remark?: string
): Promise<AppealReviewResponse> => {
    return axiosInstance.post(`/admin/violation-appeals/${id}/review`, { action, remark });
};

/**
 * 拉取申诉佐证图片。图片为明文存放，直接按 blob 返回后转为本地预览地址。
 */
export const fetchViolationAppealImage = async (imageId: number): Promise<Blob> => {
    const response = await axios.get(`${axiosInstance.defaults.baseURL}/admin/violation-appeals/images/${imageId}`, {
        headers: getAuthorizationHeaders(),
        responseType: 'blob',
    });
    return response.data as Blob;
};
