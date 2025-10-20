/**
 * 隧道类型选项
 */
export const TUNNEL_TYPE_OPTIONS = ['TCP', 'UDP', 'HTTP', 'HTTPS'].map((v) => ({
    label: v,
    value: v,
}));

/**
 * TCP/UDP 类型选项（用于编辑时限制）
 */
export const TUNNEL_TYPE_TCP_UDP = [
    { label: 'TCP', value: 'TCP' },
    { label: 'UDP', value: 'UDP' },
    { label: 'HTTP', value: 'HTTP', disabled: true },
    { label: 'HTTPS', value: 'HTTPS', disabled: true },
];

/**
 * HTTP/HTTPS 类型选项（用于编辑时限制）
 */
export const TUNNEL_TYPE_HTTP_HTTPS = [
    { label: 'TCP', value: 'TCP', disabled: true },
    { label: 'UDP', value: 'UDP', disabled: true },
    { label: 'HTTP', value: 'HTTP' },
    { label: 'HTTPS', value: 'HTTPS' },
];

/**
 * 域名类型选项
 */
export const DOMAIN_TYPE_OPTIONS = ['自定义', '免费域名'].map((v) => ({
    label: v,
    value: v,
}));

/**
 * 默认表单数据
 */
export const DEFAULT_FORM_DATA = {
    name: '',
    localip: '127.0.0.1',
    node: '',
    type: 'TCP',
    nport: '0',
    domainNameLabel: '',
    dorp: 25565,
    choose: '',
    encryption: false,
    compression: false,
    ap: '',
    domain: '',
    recordValue: '',
    remarks: '',
    tunnelid: 0,
    chooseOld: '',
    recordValueOld: '',
    nodeOld: '',
    nameOld: '',
};

/**
 * 默认节点过滤器
 */
export const DEFAULT_NODE_FILTERS = {
    udp: false,
    noPermission: true,
    web: 'all',
    region: 'all',
};

