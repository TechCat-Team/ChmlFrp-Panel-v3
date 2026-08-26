/**
 * 违规审查页面类型定义
 */

export type ViolationType = 'porn' | 'site' | 'other';

export type ViolationStatus = 'pending' | 'passed' | 'banned' | 'rejected';

export interface ViolationUser {
    id: number;
    username: string;
}

export interface Violation {
    id: number;
    type: ViolationType;
    title: string;
    target: string;
    user: ViolationUser;
    reporter: string;
    reportedAt: string;
    description: string;
    status: ViolationStatus;
    attachments: number;
    evidences: string[];
}

export interface ViolationFilters {
    keyword: string;
    type: ViolationType | null;
    timeRange: [number, number] | null;
}


