/**
 * 违规复审页面类型定义
 */
import type { Component } from 'vue';

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
    status: ViolationStatus | null;
    timeRange: [number, number] | null;
}

export interface ViolationStatsItem {
    key: string;
    label: string;
    value: number;
    className: string;
    iconBg: string;
    icon: Component;
}
