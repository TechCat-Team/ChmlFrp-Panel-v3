/**
 * 违规复审页面常量、映射与模拟数据
 */
import type { Component } from 'vue';
import {
    CheckmarkDoneOutline,
    ImageOutline,
    LinkOutline,
    TimeOutline,
} from '@vicons/ionicons5';
import dayjs from 'dayjs';
import type { Violation, ViolationStatus, ViolationType } from './types';

// 类型 / 状态标签映射
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

export const getTypeLabel = (type: ViolationType) => VIOLATION_TYPE_LABEL[type];

export const getStatusLabel = (status: ViolationStatus) => VIOLATION_STATUS_LABEL[status];

// 筛选下拉选项
export const TYPE_OPTIONS: Array<{ label: string; value: ViolationType }> = [
    { label: '色情图片', value: 'porn' },
    { label: '违规站点', value: 'site' },
    { label: '其他违规', value: 'other' },
];

export const STATUS_OPTIONS: Array<{ label: string; value: ViolationStatus }> = [
    { label: '待复审', value: 'pending' },
    { label: '已放行', value: 'passed' },
    { label: '已封禁', value: 'banned' },
    { label: '已驳回', value: 'rejected' },
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
export const formatViolationTime = (time: string) =>
    time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';

// 统计卡片元数据
export interface StatCardMeta {
    key: string;
    label: string;
    className: string;
    iconBg: string;
    icon: Component;
    match: (item: Violation) => boolean;
}

export const STAT_CARD_META: StatCardMeta[] = [
    {
        key: 'pending',
        label: '待复审',
        className: 'stat-pending',
        iconBg: 'rgba(240, 160, 32, 0.16)',
        icon: TimeOutline,
        match: (item) => item.status === 'pending',
    },
    {
        key: 'porn',
        label: '色情图片',
        className: 'stat-porn',
        iconBg: 'rgba(208, 48, 80, 0.14)',
        icon: ImageOutline,
        match: (item) => item.type === 'porn',
    },
    {
        key: 'site',
        label: '违规站点',
        className: 'stat-site',
        iconBg: 'rgba(32, 128, 240, 0.14)',
        icon: LinkOutline,
        match: (item) => item.type === 'site',
    },
    {
        key: 'processed',
        label: '已处理',
        className: 'stat-processed',
        iconBg: 'rgba(24, 160, 88, 0.14)',
        icon: CheckmarkDoneOutline,
        match: (item) => item.status !== 'pending',
    },
];

// 证据图片资源（占位生成图，仅用于 UI 展示）
const IMG_BASE = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=';
const evidenceImage = (prompt: string) => `${IMG_BASE}${encodeURIComponent(prompt)}`;

// 模拟数据（仅 UI 展示，未接入后端）
export const MOCK_VIOLATIONS: Violation[] = [
    {
        id: 10086,
        type: 'porn',
        title: '非法内容图片 - 相册分享',
        target: 'https://cdn.chmlfrp.net/u/10023/album/img_0881.jpg',
        user: { id: 10023, username: '夏日限定' },
        reporter: '用户举报',
        reportedAt: '2026-08-21 15:42:08',
        description:
            '该用户在隧道中搭建了图片分享站点，经系统扫描发现存在明显色情图片内容，已触发自动拦截，等待管理员人工复审确认。',
        status: 'pending',
        attachments: 5,
        evidences: [
            evidenceImage('a website screenshot showing an image gallery page grid'),
            evidenceImage('a blurred photograph upload interface in a user content panel'),
        ],
    },
    {
        id: 10087,
        type: 'site',
        title: '违规站点 - 博彩网站',
        target: 'https://bet88.example.com',
        user: { id: 10035, username: '海边的卡夫卡' },
        reporter: '平台扫描',
        reportedAt: '2026-08-20 09:12:51',
        description:
            '检测到该域名通过隧道对外开放，内容为非法博彩/赌博站点，包含大量诱导投注内容，违反平台内容管理规定。',
        status: 'pending',
        attachments: 3,
        evidences: [
            evidenceImage('a gambling website homepage desktop view'),
            evidenceImage('a web analytics dashboard for a site with a high traffic chart'),
        ],
    },
    {
        id: 10088,
        type: 'site',
        title: '违规站点 - 钓鱼仿冒',
        target: 'https://chmlfrp-login.com',
        user: { id: 10264, username: 'Kami' },
        reporter: '用户举报',
        reportedAt: '2026-08-18 22:30:00',
        description: '仿冒 ChmlFrp 官方登录页面，涉嫌收集用户账号密码，存在严重安全隐患，建议立即封禁。',
        status: 'pending',
        attachments: 2,
        evidences: [evidenceImage('a replica login page screenshot with input fields')],
    },
    {
        id: 10089,
        type: 'porn',
        title: '违规内容 - 视频流',
        target: 'https://live.chmlfrp.net/s/room_7788',
        user: { id: 10107, username: '深巷' },
        reporter: '系统扫描',
        reportedAt: '2026-08-15 11:20:34',
        description: '直播隧道被检测到传播违规低俗视频内容，已自动切断流量，等待人工审核。',
        status: 'banned',
        attachments: 6,
        evidences: [evidenceImage('a streaming video player interface dark theme')],
    },
    {
        id: 10090,
        type: 'other',
        title: '滥用资源 - 违规爬虫',
        target: 'https://crawl.chmlfrp.net/api',
        user: { id: 10015, username: 'DataBot' },
        reporter: '平台监测',
        reportedAt: '2026-08-12 08:45:12',
        description: '该隧道被用于大规模数据抓取，高频请求影响节点稳定性，违反公平使用原则。',
        status: 'passed',
        attachments: 1,
        evidences: [evidenceImage('a server monitoring dashboard with high request rate charts')],
    },
    {
        id: 10091,
        type: 'site',
        title: '违规站点 - 盗版资源',
        target: 'https://movie-dl.example.net',
        user: { id: 10309, username: '一只咸鱼' },
        reporter: '用户举报',
        reportedAt: '2026-08-08 18:02:55',
        description: '该站点提供大量未经授权影视资源下载，侵犯版权，多次警告后仍未整改。',
        status: 'rejected',
        attachments: 4,
        evidences: [evidenceImage('a movie download website homepage')],
    },
];
