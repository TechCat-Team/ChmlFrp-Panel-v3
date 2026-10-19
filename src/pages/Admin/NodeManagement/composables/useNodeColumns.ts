/**
 * 节点管理 - 表格列配置
 */
import { h } from 'vue';
import { NButton, NDropdown, NEllipsis, NIcon, NSpace, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import {
    CheckmarkCircle,
    CloseCircle,
    CodeSlash,
    Create,
    Diamond,
    EllipsisVertical,
    OpenOutline,
    People,
    Shield,
    TrashOutline,
} from '@vicons/ionicons5';
import type { Node } from '../types';

export interface NodeColumnHandlers {
    onEdit: (node: Node) => void;
    onCode: (node: Node) => void;
    onPanel: (node: Node) => void;
    onDelete: (node: Node) => void;
}

export function useNodeColumns(handlers: NodeColumnHandlers) {
    const columns: DataTableColumns<Node> = [
        {
            title: 'ID',
            key: 'id',
            width: 70,
            sorter: 'default',
            align: 'center',
            render(row) {
                return h(
                    'span',
                    {
                        style: 'font-weight: 600; color: #18a058;',
                    },
                    row.id
                );
            },
        },
        {
            title: '节点名称',
            key: 'name',
            width: 150,
            sorter: 'default',
            render(row) {
                return h(
                    NEllipsis,
                    {},
                    {
                        default: () =>
                            h(
                                'span',
                                {
                                    style: 'font-weight: 500;',
                                },
                                row.name
                            ),
                    }
                );
            },
        },
        {
            title: '域名',
            key: 'ip',
            width: 160,
            ellipsis: {
                tooltip: true,
            },
            render(row) {
                return h(
                    'span',
                    {
                        style: 'font-family: monospace; font-size: 13px;',
                    },
                    row.ip
                );
            },
        },
        {
            title: '真实IP',
            key: 'realIp',
            width: 160,
            ellipsis: {
                tooltip: true,
            },
            render(row) {
                return h(
                    'span',
                    {
                        style: 'font-family: monospace; font-size: 13px; color: #666;',
                    },
                    row.realIp
                );
            },
        },
        {
            title: '状态',
            key: 'state',
            width: 90,
            align: 'center',
            render(row) {
                const statusMap: Record<string, { type: 'success' | 'error' | 'warning'; text: string; icon: any }> = {
                    online: { type: 'success', text: '在线', icon: CheckmarkCircle },
                    offline: { type: 'error', text: '离线', icon: CloseCircle },
                };
                const status = statusMap[row.state] || { type: 'error', text: '未知', icon: CloseCircle };
                return h(
                    NTag,
                    {
                        type: status.type,
                        size: 'small',
                        round: true,
                    },
                    {
                        default: () =>
                            h(
                                NSpace,
                                { size: 4, align: 'center' },
                                {
                                    default: () => [
                                        h(NIcon, { size: 14, component: status.icon }),
                                        h('span', status.text),
                                    ],
                                }
                            ),
                    }
                );
            },
        },
        {
            title: '区域',
            key: 'area',
            width: 120,
            ellipsis: {
                tooltip: true,
            },
            render(row) {
                return h(
                    NSpace,
                    { size: 4, align: 'center' },
                    {
                        default: () => [h('span', row.area)],
                    }
                );
            },
        },
        {
            title: '速度(m)',
            key: 'speed',
            width: 100,
            align: 'center',
            render(row) {
                return h(
                    NTag,
                    {
                        type: 'info',
                        size: 'small',
                        bordered: false,
                    },
                    {
                        default: () =>
                            h(
                                NSpace,
                                { size: 4, align: 'center' },
                                {
                                    default: () => [h('span', row.speed)],
                                }
                            ),
                    }
                );
            },
        },
        {
            title: '国内',
            key: 'china',
            width: 80,
            align: 'center',
            render(row) {
                const isChina = row.china === 'yes' || row.china === 'true';
                return h(
                    NTag,
                    {
                        type: isChina ? 'success' : 'default',
                        size: 'small',
                        round: true,
                        bordered: false,
                    },
                    {
                        default: () =>
                            h(NIcon, {
                                size: 16,
                                component: isChina ? CheckmarkCircle : CloseCircle,
                            }),
                    }
                );
            },
        },
        {
            title: 'Web',
            key: 'web',
            width: 80,
            align: 'center',
            render(row) {
                const hasWeb = row.web === 'yes' || row.web === 'true';
                return h(
                    NTag,
                    {
                        type: hasWeb ? 'success' : 'default',
                        size: 'small',
                        round: true,
                        bordered: false,
                    },
                    {
                        default: () =>
                            h(NIcon, {
                                size: 16,
                                component: hasWeb ? CheckmarkCircle : CloseCircle,
                            }),
                    }
                );
            },
        },
        {
            title: 'UDP',
            key: 'udp',
            width: 80,
            align: 'center',
            render(row) {
                const hasUdp = row.udp === 'true';
                return h(
                    NTag,
                    {
                        type: hasUdp ? 'success' : 'default',
                        size: 'small',
                        round: true,
                        bordered: false,
                    },
                    {
                        default: () =>
                            h(NIcon, {
                                size: 16,
                                component: hasUdp ? CheckmarkCircle : CloseCircle,
                            }),
                    }
                );
            },
        },
        {
            title: '权限',
            key: 'nodegroup',
            width: 90,
            align: 'center',
            render(row) {
                const isUser = row.nodegroup === 'user';
                return h(
                    NTag,
                    {
                        type: isUser ? 'primary' : 'warning',
                        size: 'small',
                        round: true,
                    },
                    {
                        default: () =>
                            h(
                                NSpace,
                                { size: 4, align: 'center' },
                                {
                                    default: () => [
                                        h(NIcon, { size: 14, component: isUser ? People : Diamond }),
                                        h('span', isUser ? '用户' : '会员'),
                                    ],
                                }
                            ),
                    }
                );
            },
        },
        {
            title: '防御',
            key: 'fangyu',
            width: 80,
            align: 'center',
            render(row) {
                const hasFangyu = row.fangyu === 'true';
                return h(
                    NTag,
                    {
                        type: hasFangyu ? 'success' : 'default',
                        size: 'small',
                        round: true,
                        bordered: false,
                    },
                    {
                        default: () =>
                            h(NIcon, {
                                size: 16,
                                component: hasFangyu ? Shield : CloseCircle,
                            }),
                    }
                );
            },
        },
        {
            title: '操作',
            key: 'actions',
            width: 80,
            align: 'center',
            fixed: 'right',
            render(row) {
                const options = [
                    {
                        label: '编辑',
                        key: 'edit',
                        icon: () => h(NIcon, { component: Create }),
                        props: {
                            onClick: () => handlers.onEdit(row),
                        },
                    },
                    {
                        label: '查看代码',
                        key: 'code',
                        icon: () => h(NIcon, { component: CodeSlash }),
                        props: {
                            onClick: () => handlers.onCode(row),
                        },
                    },
                    {
                        label: '访问面板',
                        key: 'panel',
                        icon: () => h(NIcon, { component: OpenOutline }),
                        props: {
                            onClick: () => handlers.onPanel(row),
                        },
                    },
                    {
                        type: 'divider',
                        key: 'd1',
                    },
                    {
                        label: '删除',
                        key: 'delete',
                        icon: () => h(NIcon, { component: TrashOutline, style: 'color: #d03050;' }),
                        props: {
                            onClick: () => handlers.onDelete(row),
                            style: 'color: #d03050;',
                        },
                    },
                ];

                return h(
                    NDropdown,
                    {
                        trigger: 'click',
                        options: options,
                        placement: 'bottom-end',
                        showArrow: true,
                    },
                    {
                        default: () =>
                            h(
                                NButton,
                                {
                                    size: 'small',
                                    quaternary: true,
                                    circle: true,
                                },
                                {
                                    icon: () =>
                                        h(NIcon, {
                                            component: EllipsisVertical,
                                            size: 18,
                                        }),
                                }
                            ),
                    }
                );
            },
        },
    ];

    return { columns };
}
