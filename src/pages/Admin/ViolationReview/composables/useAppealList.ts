/**
 * 申诉处理 - 列表 / 详情 / 审核 composable
 *
 * 当前为本地 mock 数据，待后端申诉接口就绪后替换为服务端分页数据。
 */
import { h, ref } from 'vue';
import { NButton, NDropdown, NIcon, NTag, useMessage, type DataTableColumns } from 'naive-ui';
import { CheckmarkCircle, CloseCircle, EllipsisVertical, EyeOutline } from '@vicons/ionicons5';
import {
    formatViolationTime,
    getAppealStatusLabel,
    getAppealStatusTagType,
    getTypeLabel,
    getTypeTagType,
    type AppealRecord,
    type AppealReviewResult,
} from '../constants';

// TODO: 待接入申诉列表接口后替换为服务端数据
const MOCK_APPEALS: AppealRecord[] = [
    {
        id: 3001,
        violationId: 1024,
        userId: 1001,
        username: 'alice',
        type: 'porn',
        tunnelName: 'web-tunnel',
        url: 'https://web-01.example.com/img',
        nodeName: '香港-01',
        banReason: '隧道指向的站点存在色情内容，违反服务条款第 3.2 条',
        appealReason: '该域名下的违规内容已全部清理，当前站点为个人博客，申请解除封禁，可随时复查。',
        contact: 'QQ 123456789',
        images: ['整改截图-1.png', '整改截图-2.png'],
        appealedAt: '2026-09-13 10:20:00',
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        reviewRemark: '',
    },
    {
        id: 3002,
        violationId: 902,
        userId: 1002,
        username: 'bob',
        type: 'other',
        tunnelName: 'api-test',
        url: 'https://api.example.com/v1/report',
        nodeName: '北京-02',
        banReason: '长时间大带宽占用，影响节点其他用户使用',
        appealReason: '该隧道仅用于接口联调，已把并发压测脚本下线，后续会限制请求频率。',
        contact: 'bob@example.com',
        images: [],
        appealedAt: '2026-09-14 16:42:31',
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        reviewRemark: '',
    },
    {
        id: 3003,
        violationId: 987,
        userId: 1003,
        username: 'carol',
        type: 'site',
        tunnelName: 'mc-server',
        url: 'https://mc.example.com:25565',
        nodeName: '上海-03',
        banReason: '隧道被用于搭建未备案的违规站点',
        appealReason: '域名已完成备案，备案号可在工信部系统查询，附件为备案截图。',
        contact: 'QQ 987654321',
        images: ['备案截图.png'],
        appealedAt: '2026-09-02 09:15:08',
        status: 'approved',
        reviewedBy: 'admin',
        reviewedAt: '2026-09-03 11:02:45',
        reviewRemark: '备案信息核验无误，已解除封禁。',
    },
    {
        id: 3004,
        violationId: 880,
        userId: 1004,
        username: 'dave',
        type: 'porn',
        tunnelName: 'media-server',
        url: 'https://media.example.com/hls',
        nodeName: '广州-01',
        banReason: '隧道转发内容涉及传播淫秽色情信息',
        appealReason: '内容为正常的影视资源，不存在违规情况。',
        contact: 'dave@example.com',
        images: [],
        appealedAt: '2026-08-20 20:31:57',
        status: 'rejected',
        reviewedBy: 'admin',
        reviewedAt: '2026-08-21 10:12:03',
        reviewRemark: '复议证据截图仍存在违规内容，维持原判。',
    },
];

export function useAppealList() {
    const message = useMessage();

    const list = ref<AppealRecord[]>(MOCK_APPEALS.map((item) => ({ ...item })));
    const loading = ref(false);
    const showDetailModal = ref(false);
    const current = ref<AppealRecord | null>(null);
    const reviewing = ref(false);

    const handleViewDetail = (row: AppealRecord) => {
        current.value = row;
        showDetailModal.value = true;
    };

    /**
     * 审核申诉。当前仅本地回写状态，待后端接口就绪后改为调用接口并刷新列表。
     */
    const handleReview = (result: AppealReviewResult, row?: AppealRecord | null) => {
        const target = row ?? current.value;
        if (!target || reviewing.value) {
            return;
        }
        if (target.status !== 'pending') {
            message.warning('该申诉已处理，无需重复操作');
            return;
        }

        reviewing.value = true;
        target.status = result;
        target.reviewedBy = 'admin';
        target.reviewedAt = formatViolationTime(new Date().toISOString());
        message.warning('申诉审核接口尚未接入，本次仅演示交互流程');
        reviewing.value = false;
        showDetailModal.value = false;
    };

    const columns: DataTableColumns<AppealRecord> = [
        {
            title: 'ID',
            key: 'id',
            width: 70,
            sorter: 'default',
        },
        {
            title: '关联用户',
            key: 'username',
            width: 130,
            ellipsis: { tooltip: true },
            render: (row) => (row.userId ? `#${row.userId} · ${row.username}` : '未关联'),
        },
        {
            title: '违规类型',
            key: 'type',
            width: 110,
            align: 'center',
            render: (row) =>
                h(
                    NTag,
                    { type: getTypeTagType(row.type), size: 'small', round: true },
                    { default: () => getTypeLabel(row.type) }
                ),
        },
        {
            title: '违规隧道',
            key: 'tunnelName',
            width: 150,
            ellipsis: { tooltip: true },
        },
        {
            title: '违规URL',
            key: 'url',
            width: 220,
            ellipsis: { tooltip: true },
        },
        {
            title: '申诉理由',
            key: 'appealReason',
            width: 240,
            ellipsis: { tooltip: true },
        },
        {
            title: '申诉时间',
            key: 'appealedAt',
            width: 170,
            ellipsis: { tooltip: true },
            render: (row) => formatViolationTime(row.appealedAt),
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            align: 'center',
            render: (row) =>
                h(
                    NTag,
                    { type: getAppealStatusTagType(row.status), size: 'small', round: true },
                    { default: () => getAppealStatusLabel(row.status) }
                ),
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
                        props: { onClick: () => handleViewDetail(row) },
                    },
                    {
                        type: 'divider' as const,
                        key: 'd1',
                    },
                    {
                        label: '申诉通过',
                        key: 'approve',
                        icon: () => h(NIcon, { component: CheckmarkCircle, style: 'color:#18a058' }),
                        props: { onClick: () => handleReview('approved', row) },
                    },
                    {
                        label: '驳回申诉',
                        key: 'reject',
                        icon: () => h(NIcon, { component: CloseCircle, style: 'color:#d03050' }),
                        props: { onClick: () => handleReview('rejected', row) },
                    },
                ];
                return h(
                    NDropdown,
                    { trigger: 'click', options, placement: 'bottom-end', showArrow: true },
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

    return {
        list,
        loading,
        columns,
        showDetailModal,
        current,
        reviewing,
        handleViewDetail,
        handleReview,
    };
}
