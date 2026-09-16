/**
 * 违规审查页面常量与展示映射
 */
import dayjs from 'dayjs';
import type { ViolationReviewAction, ViolationStatus, ViolationType } from '@/api/v2/admin/violation';

export const VIOLATION_TYPE_LABEL: Record<ViolationType, string> = {
    porn: '色情图片',
    site: '违规站点',
    other: '其他违规',
};

export const VIOLATION_STATUS_LABEL: Record<ViolationStatus, string> = {
    pending: '待复审',
    passed: '已放行',
    banned: '已封禁',
    rejected: '已驳回',
};

export const REVIEW_ACTION_LABEL: Record<ViolationReviewAction, string> = {
    pass: '放行',
    ban: '封禁',
    reject: '驳回',
};

export const getTypeLabel = (type: ViolationType) => VIOLATION_TYPE_LABEL[type] ?? type;

export const getStatusLabel = (status: ViolationStatus) => VIOLATION_STATUS_LABEL[status] ?? status;

// 筛选下拉选项
export const TYPE_OPTIONS: Array<{ label: string; value: ViolationType }> = [
    { label: '色情图片', value: 'porn' },
    { label: '违规站点', value: 'site' },
    { label: '其他违规', value: 'other' },
];

// 标签颜色映射
export const getTypeTagType = (type: ViolationType): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    if (type === 'porn') return 'error';
    if (type === 'site') return 'warning';
    return 'info';
};

export const getStatusTagType = (status: ViolationStatus): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    if (status === 'pending') return 'warning';
    if (status === 'passed') return 'success';
    if (status === 'banned') return 'error';
    return 'default';
};

// 时间格式化
export const formatViolationTime = (time: string | null | undefined) =>
    time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';

// 证据图片大小展示
export const formatEvidenceSize = (bytes: number | null | undefined) => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
