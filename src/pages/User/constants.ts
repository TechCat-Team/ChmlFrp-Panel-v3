/**
 * 用户页面常量定义
 */
import type { AppealStatus, ViolationType } from '@/api/v2/user/violation';

export const COUNTDOWN_TIME = 60;
export const TERM_EXPIRING_DAYS = 7;

/** 申诉理由最大长度，与后端 ViolationAppealController 的校验保持一致 */
export const BAN_APPEAL_REASON_MAX = 1000;

/** 申诉佐证图片数量上限，与后端保持一致 */
export const BAN_APPEAL_IMAGE_MAX = 5;

/** 申诉佐证图片单张大小上限（字节），与后端 violation.appeal.image.max-bytes 保持一致 */
export const BAN_APPEAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const BAN_TYPE_LABEL: Record<ViolationType, string> = {
    porn: '色情图片',
    site: '违规站点',
    other: '其他违规',
};

export const BAN_TYPE_TAG: Record<ViolationType, 'error' | 'warning' | 'info'> = {
    porn: 'error',
    site: 'warning',
    other: 'info',
};

export const BAN_APPEAL_STATUS_LABEL: Record<AppealStatus, string> = {
    none: '未申诉',
    pending: '审核中',
    approved: '已通过',
    rejected: '已驳回',
};

export const BAN_APPEAL_STATUS_TAG: Record<AppealStatus, 'default' | 'warning' | 'success' | 'error'> = {
    none: 'default',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};
