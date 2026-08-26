/**
 * 违规复审 - 表格列定义 composable
 */
import { h } from 'vue';
import { NButton, NIcon, NTag, NDropdown, type DataTableColumns } from 'naive-ui';
import { BanOutline, CheckmarkCircle, EllipsisVertical, EyeOutline } from '@vicons/ionicons5';
import {
    formatViolationTime,
    getStatusLabel,
    getStatusTagType,
    getTypeLabel,
    getTypeTagType,
} from '../constants';
import type { Violation } from '../types';

interface TableHandlers {
    onView: (row: Violation) => void;
    onReview: (action: string) => void;
}

export function useViolationTable({ onView, onReview }: TableHandlers): DataTableColumns<Violation> {
    return [
        {
            title: 'ID',
            key: 'id',
            width: 70,
            sorter: 'default',
        },
        {
            title: '违规类型',
            key: 'type',
            width: 110,
            align: 'center',
            render(row) {
                return h(
                    NTag,
                    { type: getTypeTagType(row.type), size: 'small', round: true },
                    { default: () => getTypeLabel(row.type) }
                );
            },
        },
        {
            title: '违规内容',
            key: 'title',
            width: 200,
            sorter: 'default',
            ellipsis: { tooltip: true },
        },
        {
            title: '关联目标',
            key: 'target',
            minWidth: 240,
            render(row) {
                return h('span', { class: 'mono-text' }, row.target);
            },
        },
        {
            title: '关联用户',
            key: 'user',
            width: 130,
            render(row) {
                return h('span', { style: 'white-space: nowrap;' }, row.user.username);
            },
        },
        {
            title: '发现时间',
            key: 'reportedAt',
            width: 170,
            render(row) {
                return formatViolationTime(row.reportedAt);
            },
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            align: 'center',
            render(row) {
                return h(
                    NTag,
                    { type: getStatusTagType(row.status), size: 'small', round: true },
                    { default: () => getStatusLabel(row.status) }
                );
            },
        },
        {
            title: '操作',
            key: 'actions',
            width: 70,
            align: 'center',
            fixed: 'right',
            render(row) {
                const options = [
                    {
                        label: '查看复审',
                        key: 'detail',
                        icon: () => h(NIcon, { component: EyeOutline }),
                        props: { onClick: () => onView(row) },
                    },
                    {
                        type: 'divider' as const,
                        key: 'd1',
                    },
                    {
                        label: '通过',
                        key: 'pass',
                        icon: () => h(NIcon, { component: CheckmarkCircle, style: 'color:#18a058' }),
                        props: { onClick: () => onReview('通过') },
                    },
                    {
                        label: '封禁处理',
                        key: 'ban',
                        icon: () => h(NIcon, { component: BanOutline, style: 'color:#d03050' }),
                        props: { onClick: () => onReview('封禁处理') },
                    },
                ];
                return h(
                    NDropdown,
                    {
                        trigger: 'click',
                        options,
                        placement: 'bottom-end',
                        showArrow: true,
                    },
                    {
                        default: () =>
                            h(
                                NButton,
                                { size: 'small', quaternary: true, circle: true },
                                { icon: () => h(NIcon, { component: EllipsisVertical, size: 18 }) }
                            ),
                    }
                );
            },
        },
    ];
}
