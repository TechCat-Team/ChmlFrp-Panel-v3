/**
 * 违规审查 - 表格列定义 composable
 */
import { h } from 'vue';
import { NButton, NIcon, NTag, NDropdown, type DataTableColumns } from 'naive-ui';
import { BanOutline, CheckmarkCircle, EllipsisVertical, EyeOutline } from '@vicons/ionicons5';
import type { ViolationRecord, ViolationReviewAction } from '@/api/v2/admin/violation';
import {
    formatViolationTime,
    getStatusLabel,
    getStatusTagType,
    getTypeLabel,
    getTypeTagType,
} from '../constants';

interface TableHandlers {
    onView: (row: ViolationRecord) => void;
    onReview: (action: ViolationReviewAction, row: ViolationRecord) => void;
}

export function useViolationTable({ onView, onReview }: TableHandlers): DataTableColumns<ViolationRecord> {
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
                return h('span', { class: 'violation-mono' }, row.target || '-');
            },
        },
        {
            title: '关联用户',
            key: 'username',
            width: 130,
            render(row) {
                return h('span', { style: 'white-space: nowrap;' }, row.username || '-');
            },
        },
        {
            title: '违规节点',
            key: 'node_name',
            width: 130,
            render(row) {
                return h('span', { class: 'violation-mono' }, row.node_name || '-');
            },
        },
        {
            title: '发现时间',
            key: 'reported_at',
            width: 170,
            render(row) {
                return formatViolationTime(row.reported_at);
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
                        label: '查看详情',
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
                        props: { onClick: () => onReview('pass', row) },
                    },
                    {
                        label: '封禁处理',
                        key: 'ban',
                        icon: () => h(NIcon, { component: BanOutline, style: 'color:#d03050' }),
                        props: { onClick: () => onReview('ban', row) },
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
