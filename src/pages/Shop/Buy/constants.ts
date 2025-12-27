/**
 * 购买页面常量定义
 */
import type { MembershipCost, MembershipType } from './types';

// 购买须知
export const PURCHASE_NOTICE =
    '购买后积分无法退还。多次购买同一套餐则增加对应会员时长，如果要升级会员请选择升级会员。如果无法支付或支付后未到账，请联系客服QQ：242247494开通临时支付渠道或进行补发。';

// 客服联系方式
export const TECHNICAL_SUPPORT_TIP = '任何与ChmlFrp映射相关的问题，都可以联系技术QQ：242247494申请手把手教学！';

// 支付配置
export const PAYMENT_CONFIG = {
    /** 1元 = 1000积分 */
    POINTS_PER_YUAN: 1000,
    /** 最低充值金额（元） */
    MIN_TOP_UP_AMOUNT: 3,
} as const;

// 终身会员标识日期
export const LIFETIME_TERM_DATE = '9999-09-09' as const;

// 会员类型列表（按等级排序）
export const MEMBERSHIP_TYPES: MembershipType[] = ['普通会员', '高级会员', '超级会员'];

// 基础月费（积分）
export const BASE_MONTHLY_COST: MembershipCost = {
    普通会员: 8000,
    高级会员: 12000,
    超级会员: 18000,
};

// 终身会员价格（元）
export const LIFETIME_MEMBER_PRICE: MembershipCost = {
    普通会员: 80,
    高级会员: 120,
    超级会员: 160,
};

// 会员特性配置
export const FREE_USER_FEATURES = {
    nodeAccess: '节点权限：普通节点',
    domesticSpeed: '国内节点限速：8m',
    overseasSpeed: '国外节点限速：32m',
    tunnelCount: '隧道数量：4条',
    trafficLimit: '流量限制：无限制',
    subdomainCount: '二级域名数量：2条',
    sslCertificate: '免费SSL证书：2个',
    support: '官方技术支持：不支持',
} as const;

export const NORMAL_MEMBER_FEATURES = {
    nodeAccess: '节点权限：普通/会员节点',
    domesticSpeed: '国内节点限速：16m',
    overseasSpeed: '国外节点限速：64m',
    tunnelCount: '隧道数量：8条',
    trafficLimit: '流量限制：无限制',
    subdomainCount: '二级域名数量：4条',
    sslCertificate: '免费SSL证书：4个',
    support: '官方技术支持：不支持',
} as const;

export const ADVANCED_MEMBER_FEATURES = {
    nodeAccess: '节点权限：普通/会员节点',
    domesticSpeed: '国内节点限速：24m',
    overseasSpeed: '国外节点限速：96m',
    tunnelCount: '隧道数量：12条',
    trafficLimit: '流量限制：无限制',
    subdomainCount: '二级域名数量：8条',
    sslCertificate: '免费SSL证书：8个',
    support: '官方技术支持：每月1次',
    supportTooltip: TECHNICAL_SUPPORT_TIP,
} as const;

export const SUPER_MEMBER_FEATURES = {
    nodeAccess: '节点权限：普通/会员节点',
    domesticSpeed: '国内节点限速：32m',
    overseasSpeed: '国外节点限速：128m',
    tunnelCount: '隧道数量：16条',
    trafficLimit: '流量限制：无限制',
    subdomainCount: '二级域名数量：16条',
    sslCertificate: '免费SSL证书：16个',
    support: '官方技术支持：每月2次',
    supportTooltip: TECHNICAL_SUPPORT_TIP,
} as const;

// 会员特性配置映射
export const MEMBERSHIP_FEATURES = {
    免费用户: FREE_USER_FEATURES,
    普通会员: NORMAL_MEMBER_FEATURES,
    高级会员: ADVANCED_MEMBER_FEATURES,
    超级会员: SUPER_MEMBER_FEATURES,
} as const;

// 会员价格文本
export const MEMBERSHIP_PRICE_TEXT = {
    免费用户: '0积分/月',
    普通会员: '8000积分/月',
    高级会员: '12000积分/月',
    超级会员: '18000积分/月',
} as const;

// 按钮文本
export const BUTTON_TEXT = {
    REGISTER_FREE: '注册即得',
    PURCHASE_NOW: '立即购买',
} as const;
