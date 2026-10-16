import { prepareIdempotentRequest, completeIdempotentRequest } from '@/utils/idempotentRequest';
import axiosInstance, { BaseResponse } from '../axios/axiosInstance';

export type ViolationType = 'porn' | 'site' | 'other';

/** 申诉状态，none 表示尚未提交过申诉 */
export type AppealStatus = 'none' | 'pending' | 'approved' | 'rejected';

/** 当前用户的封禁记录，附带最近一次申诉的状态 */
export interface MyBanRecord {
    id: number;
    violation_id: number | null;
    type: ViolationType;
    tunnel_name: string;
    url: string;
    node_name: string;
    reason: string;
    banned_at: string | null;
    unbanned_at: string | null;
    appeal_id: number | null;
    appeal_status: AppealStatus;
    appealed_at: string | null;
    appeal_review_remark: string | null;
    /** 服务端判定当前是否允许提交申诉 */
    can_appeal: boolean;
    scope?: 'user' | 'tunnel';
    expires_at?: number | null;
    active?: boolean;
}

export interface MyBanRecordsResponse extends BaseResponse {
    data: {
        ban_records: MyBanRecord[];
    };
}

/**
 * 获取当前用户的封禁记录
 */
export const getMyBanRecords = async (): Promise<MyBanRecordsResponse> => {
    return axiosInstance.get('/violation/ban-records');
};

export interface SubmitAppealPayload {
    banRecordId: number;
    reason: string;
    contact: string;
}

export interface SubmitAppealResponse extends BaseResponse {
    data: {
        id: number;
        ban_record_id: number;
        status: AppealStatus;
        appealed_at: string | null;
        image_count: number;
    };
}

/**
 * 提交封禁申诉。佐证图片为可选，随 meta 一并 multipart 上传。
 */
export const submitViolationAppeal = async (
    payload: SubmitAppealPayload,
    images: File[] = []
): Promise<SubmitAppealResponse> => {
    const hashes = await Promise.all(
        images.map(async (file) => {
            const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
            return {
                name: file.name,
                type: file.type,
                sha256: Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join(''),
            };
        })
    );
    const key = `appeal:${payload.banRecordId}`;
    const meta = prepareIdempotentRequest(key, JSON.stringify({ payload, images: hashes }), () => ({
        ban_record_id: payload.banRecordId,
        reason: payload.reason,
        contact: payload.contact,
    }));
    const formData = new FormData();
    formData.append('meta', JSON.stringify(meta));
    images.forEach((file) => formData.append('files', file));

    const response: SubmitAppealResponse = await axiosInstance.post('/violation/appeals', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    completeIdempotentRequest(key);
    return response;
};
