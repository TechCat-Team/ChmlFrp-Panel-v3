/**
 * 用户页面常量定义
 */

export const COUNTDOWN_TIME = 60;
export const TERM_EXPIRING_DAYS = 7;

/** 封禁记录中的违规类型，取值与后端违规记录保持一致 */
export type BanViolationType = 'porn' | 'site' | 'other';

/** 封禁记录的申诉状态，目前仅前端本地维护 */
export type BanAppealStatus = 'none' | 'pending' | 'approved' | 'rejected';

/** 个人资料页展示的封禁记录 */
export interface BanRecord {
    id: number;
    /** 违规类型 */
    type: BanViolationType;
    /** 违规隧道名 */
    tunnelName: string;
    /** 违规URL */
    url: string;
    /** 上报节点 */
    nodeName: string;
    /** 封禁原因（管理员审核备注） */
    reason: string;
    /** 封禁时间 */
    bannedAt: string;
    /** 申诉状态 */
    appealStatus: BanAppealStatus;
}

export const BAN_TYPE_LABEL: Record<BanViolationType, string> = {
    porn: '色情图片',
    site: '违规站点',
    other: '其他违规',
};

export const BAN_TYPE_TAG: Record<BanViolationType, 'error' | 'warning' | 'info'> = {
    porn: 'error',
    site: 'warning',
    other: 'info',
};

export const BAN_APPEAL_STATUS_LABEL: Record<BanAppealStatus, string> = {
    none: '未申诉',
    pending: '审核中',
    approved: '已通过',
    rejected: '已驳回',
};

export const BAN_APPEAL_STATUS_TAG: Record<BanAppealStatus, 'default' | 'warning' | 'success' | 'error'> = {
    none: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};

/** 只有未申诉或申诉被驳回的记录允许再次提交申诉 */
export const canSubmitAppeal = (status: BanAppealStatus) => status === 'none' || status === 'rejected';

/** 申诉理由最大长度 */
export const BAN_APPEAL_REASON_MAX = 1000;

/** 申诉佐证图片数量上限 */
export const BAN_APPEAL_IMAGE_MAX = 5;
