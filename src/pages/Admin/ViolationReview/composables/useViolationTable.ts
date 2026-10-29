/**
 * 违规审查 - 表格列定义 composable
 */
import { h } from 'vue';
import { NButton, NIcon, NTag, NDropdown, type DataTableColumns } from 'naive-ui';
import { BanOutline, CheckmarkCircle, EllipsisVertical, EyeOutline } from '@vicons/ionicons5';
import type { ViolationRecord, ViolationReviewAction } from '@/api/v2/admin/violation';
import { formatViolationTime, getStatusLabel, getStatusTagType, getTypeLabel, getTypeTagType } from '../constants';

interface TableHandlers {
    onView: (row: ViolationRecord) => void;
    onReview: (action: ViolationReviewAction, row: ViolationRecord) => void;
    onSearchUser?: (username: string) => void;
}

export function useViolationTable({
    onView,
    onReview,
    onSearchUser,
}: TableHandlers): DataTableColumns<ViolationRecord> {
    return [
        {
            title: 'ID',
            key: 'id',
            width: 70,
            sorter: true,
        },
        {
            title: '违规类型',
            key: 'type',
            width: 110,
            align: 'center',
            sorter: true,
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
            sorter: true,
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
            sorter: true,
            render(row) {
                if (!row.username) {
                    return h('span', { style: 'white-space: nowrap;' }, '-');
                }
                // 点击用户名按该用户搜索全部违纪记录，保持原有文字样式，仅增加可点击提示
                return h(
                    'span',
                    {
                        style: 'white-space: nowrap; cursor: pointer;',
                        title: '点击搜索该用户的全部违纪记录',
                        onClick: () => onSearchUser?.(row.username),
                    },
                    row.username
                );
            },
        },
        {
            title: '违规节点',
            key: 'node_name',
            width: 130,
            sorter: true,
            render(row) {
                return h('span', { class: 'violation-mono' }, row.node_name || '-');
            },
        },
        {
            title: '发现时间',
            key: 'reported_at',
            width: 170,
            sorter: true,
            render(row) {
                return formatViolationTime(row.reported_at);
            },
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            align: 'center',
            sorter: true,
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
                        label: '查看放行选项',
                        disabled: row.status !== 'pending',
                        key: 'pass',
                        icon: () => h(NIcon, { component: CheckmarkCircle, style: 'color:#18a058' }),
                        props: { onClick: () => onReview('pass', row) },
                    },
                    {
                        label: row.status === 'banned' ? '查看封禁与解除选项' : '查看封禁选项',
                        disabled: row.status !== 'pending' && row.status !== 'banned',
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
