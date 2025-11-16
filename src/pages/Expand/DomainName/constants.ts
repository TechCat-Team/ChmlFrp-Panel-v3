/**
 * 域名管理页面常量定义
 */
import type { TTLValue, RecordTypeOption } from './types';

// 记录类型选项
export const RECORD_TYPE_OPTIONS: RecordTypeOption[] = ['A', 'AAAA', 'CNAME', 'SRV'].map((v) => ({
    label: v,
    value: v,
}));

// 快速解析记录类型选项
export const FAST_RECORD_TYPE_OPTIONS: RecordTypeOption[] = ['CNAME', 'Java版MC'].map((v) => ({
    label: v,
    value: v,
}));

// TTL 选项
export const TTL_OPTIONS: Array<{ label: TTLValue; value: TTLValue }> = [
    '1分钟',
    '2分钟',
    '5分钟',
    '10分钟',
    '15分钟',
    '30分钟',
    '1小时',
    '2小时',
    '5小时',
    '12小时',
    '1天',
].map((v) => ({
    label: v as TTLValue,
    value: v as TTLValue,
}));

// 默认 TTL 值
export const DEFAULT_TTL: TTLValue = '10分钟';

// 默认记录类型
export const DEFAULT_RECORD_TYPE = 'A';

// 默认快速解析记录类型
export const DEFAULT_FAST_RECORD_TYPE = 'CNAME';

// SRV 特殊记录消息映射
export const SPECIAL_RECORD_MESSAGES: Record<string, string> = {
    '_minecraft._tcp.': 'MCJava版服务器',
    '_xmpp-server._tcp.': 'XMPP (即时通讯) 服务',
    '_ark._udp.': 'ARK: Survival Evolved (方舟:生存进化) 服务',
    '_sip._tcp.': 'VoIP (SIP) 服务',
    '_ldap._tcp.': 'LDAP 目录服务',
    '_http._tcp.': 'HTTP 服务',
    '_caldav._tcp.': 'CalDAV 服务',
    '_imap._tcp.': 'IMAP 邮件服务',
    '_ftp._tcp.': 'FTP 服务',
    '_smtp._tcp.': 'SMTP 邮件服务',
    '_pop3._tcp.': 'POP3 邮件服务',
    '_nntp._tcp.': 'NNTP 新闻组服务',
    '_rsync._tcp.': 'rsync 文件同步服务',
    '_cstrike._tcp.': 'Counter-Strike 游戏服务器',
};

// 目标占位符映射
export const TARGET_PLACEHOLDER_MAP: Record<string, string> = {
    A: '请输入IPv4地址',
    AAAA: '请输入IPv6地址',
    CNAME: '请输入域名',
    SRV: '请输入服务目标',
};

// 默认目标占位符
export const DEFAULT_TARGET_PLACEHOLDER = '这这，这不对吧，有这个选项吗？';

// 表单验证规则
export const FORM_RULES = {
    selectedDomain: { required: true, message: '请选择域名' },
    selectedRecordType: { required: true, message: '请选择记录类型' },
    recordValue: { required: true, message: '请输入记录', trigger: 'blur' },
    TTLValue: { required: true, message: '请选择TTL' },
    target: { required: true, message: '请输入目标' },
} as const;

export const FAST_FORM_RULES = {
    selectedDomain: [{ required: true, message: '请选择域名' }],
    selectedRecordType: [{ required: true, message: '请选择记录类型' }],
    recordValue: [{ required: true, message: '请输入记录' }],
    selectedTunnel: [{ required: true, message: '请选择隧道' }],
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
    CREATE_DOMAIN: '免费域名创建成功',
    UPDATE_DOMAIN: '免费域名修改成功！',
    DELETE_DOMAIN: (record: string, domain: string) => `删除域名: ${record}.${domain}，成功！`,
} as const;

// 提示消息
export const INFO_MESSAGES = {
    DNS_PROPAGATION:
        '域名解析创建成功，但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效。简而言之，您创建的免费域名需要等待一段时间后才能正常使用。',
    DNS_PROPAGATION_SHORT:
        '域名解析创建成功，但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效',
    DNS_PROPAGATION_UPDATE:
        '域名解析修改成功！但是域名解析通常不会立即生效，一般在48小时内彻底生效，部分DNS会在几分钟内生效',
    CNAME_WARNING:
        '免费域名无备案，如需在境内节点提供HTTP/HTTPS/其它法定范围内的公开服务，请使用您自行备案过的域名，免费域名无效',
} as const;

// 备注文本
export const REMARKS = {
    CUSTOM: '自定义地址',
    CUSTOM_RESOLUTION: '自定义解析',
    FAST_RESOLUTION: (type: string, tunnelInfo: string) => `解析 ${type} 到 ${tunnelInfo}`,
} as const;

// Java版MC SRV记录配置
export const MINECRAFT_SRV_CONFIG = {
    PREFIX: '_minecraft._tcp.',
    TARGET_FORMAT: (dorp: string, ip: string) => `5 0 ${dorp} ${ip}`,
} as const;

