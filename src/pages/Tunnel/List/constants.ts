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

export const ACCESS_RULE_MODE_OPTIONS = [
    { label: '关闭', value: 'none' },
    { label: '白名单', value: 'whitelist' },
    { label: '黑名单', value: 'blacklist' },
] as const;

const ISO_3166_ALPHA_2_CODES = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
    'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
    'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
    'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
    'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
    'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
    'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
    'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
    'JE', 'JM', 'JO', 'JP',
    'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
    'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
    'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
    'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
    'OM',
    'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
    'QA',
    'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
    'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
    'UA', 'UG', 'UM', 'US', 'UY', 'UZ',
    'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
    'WF', 'WS',
    'YE', 'YT',
    'ZA', 'ZM', 'ZW',
] as const;

const regionNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' });

export const REGION_OPTIONS = ISO_3166_ALPHA_2_CODES.map((value) => ({
    label: `${regionNames.of(value) || value} (${value})`,
    value,
}));
