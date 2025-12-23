export const CHART_IDS = [
    'frp-chart',
    'cpu-chart',
    'network-chart',
    'memory-chart',
    'proxy-chart',
    'cur-conns-chart',
    'client-counts-chart',
    'packets-chart',
    'conn-chart',
] as const;

export const DEFAULT_MARKERS = [
    { position: [102.22092, 31.90059], title: '我的位置' },
    { position: [116.407428, 39.91923], title: '节点位置' },
] as const;

export const STATUS_SMOOTH_MAX_ZERO_COUNT = 10;

export const SECONDS_PER_DAY = 86400;

export const BYTES_TO_GB_DIVISOR = 1024 ** 3;

export const PACKETS_DIVISOR = 100000000;

export const CHART_HEIGHT = '400px';

export const MAP_HEIGHT = '500px';

export const CARD_MIN_HEIGHT = '198px';

export const MAP_CARD_HEIGHT = '556px';

export const IP_API_URL = 'https://uapis.cn/api/v1/network/myip';

export const IP_API_TIMEOUT = 5000;
