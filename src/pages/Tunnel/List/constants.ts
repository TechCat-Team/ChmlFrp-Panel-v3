/**
 * 隧道列表页面常量定义
 */

export const TUNNEL_TYPES = ['TCP', 'UDP', 'HTTP', 'HTTPS'] as const;

export const DOMAIN_TYPES = ['自定义', '免费域名'] as const;

export const FILTER_WEB_OPTIONS = ['all', 'yes', 'no'] as const;
export const FILTER_REGION_OPTIONS = ['all', 'china', 'overseas'] as const;

export const DEFAULT_LOCAL_IP = '127.0.0.1';
export const DEFAULT_TUNNEL_TYPE = 'TCP';
export const DEFAULT_NPORT = '0';
export const DEFAULT_DORP = '25565';
export const DEFAULT_TUNNEL_NAME_LENGTH = 8;

export const RANDOM_PORT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const STATUS_MAP = {
    online: {
        true: { type: 'success', label: '在线', description: '隧道正常运行中' },
        false: { type: 'warning', label: '离线', description: '隧道已停止运行' },
    },
    offline: { type: 'error', label: '维护', description: '节点维护中' },
} as const;

export const TUNNEL_TYPE_ICONS = {
    TCP: 'CodeSlashOutline',
    UDP: 'CodeSlashOutline',
    HTTP: 'GlobeOutline',
    HTTPS: 'LockClosedOutline',
} as const;

export const INITIAL_SCROLL_COUNT = 16;
export const SCROLL_INCREMENT = 1;

export const FORCE_CHECK_INTERVAL = 10000; // 10秒

export const CHINA_SPECIAL_REGIONS = ['香港', '澳门', '台湾'];

export const FREE_USER_GROUP = '免费用户';

