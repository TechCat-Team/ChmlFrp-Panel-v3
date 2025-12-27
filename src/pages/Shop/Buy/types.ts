/**
 * 购买页面类型定义
 */

export type MembershipType = '免费用户' | '普通会员' | '高级会员' | '超级会员';

export type DurationType = '1' | '3' | '6' | '12';

export interface MembershipCost {
    普通会员: number;
    高级会员: number;
    超级会员: number;
}

export interface MembershipFeatures {
    nodeAccess: string;
    domesticSpeed: string;
    overseasSpeed: string;
    tunnelCount: string;
    trafficLimit: string;
    subdomainCount: string;
    sslCertificate: string;
    support: string;
}

export interface MembershipConfig {
    type: MembershipType;
    price: number;
    features: MembershipFeatures;
}
