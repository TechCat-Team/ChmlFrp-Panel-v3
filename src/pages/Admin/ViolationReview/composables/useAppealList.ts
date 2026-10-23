/**
 * 申诉处理 - 列表 / 详情 / 审核 composable
 *
 * 与违规列表共用同一份筛选条件（关键字、时间范围），数据来自服务端分页接口。
 */
import { prepareIdempotentRequest, completeIdempotentRequest } from '@/utils/idempotentRequest';
import { h, reactive, ref, watch } from 'vue';
import { NButton, NDropdown, NIcon, NTag, useMessage, type DataTableColumns } from 'naive-ui';
import { BanOutline, CheckmarkCircle, CloseCircle, EllipsisVertical, EyeOutline } from '@vicons/ionicons5';
import {
    getViolationAppealDetail,
    getViolationAppeals,
    reviewViolationAppeal,
    type AppealReviewAction,
    type ViolationAppealDetail,
    type ViolationAppealRecord,
} from '@/api/v2/admin/violation';
import {
    formatViolationTime,
    getAppealStatusLabel,
    getAppealStatusTagType,
    getTypeLabel,
    getTypeTagType,
} from '../constants';
import type { ViolationFilters, TableSorterState } from './useViolationList';

const REVIEW_ACTION_LABEL: Record<AppealReviewAction, string> = {
    approve: '通过申诉',
    reject: '驳回申诉',
};

export function useAppealList(filters: ViolationFilters, onViewBanRecord?: (row: ViolationAppealRecord) => void) {
    const message = useMessage();

    const list = ref<ViolationAppealRecord[]>([]);
    const loading = ref(false);
    const sorter = reactive({
        sortBy: 'appealed_at',
        sortOrder: 'desc' as 'asc' | 'desc',
    });
    const pagination = reactive({
        page: 1,
        pageSize: 10,
        itemCount: 0,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
    });

    const showDetailModal = ref(false);
    const current = ref<ViolationAppealDetail | null>(null);
    const detailLoading = ref(false);
    const reviewing = ref(false);

    const load = async () => {
        loading.value = true;
        try {
            const response = await getViolationAppeals({
                keyword: filters.keyword,
                startTime: filters.timeRange?.[0] ?? null,
                endTime: filters.timeRange?.[1] ?? null,
                sortBy: sorter.sortBy,
                sortOrder: sorter.sortOrder,
                page: pagination.page,
                size: pagination.pageSize,
            });
            list.value = response.data?.appeals ?? [];
            pagination.itemCount = response.data?.total ?? 0;
        } catch (error: any) {
            list.value = [];
            pagination.itemCount = 0;
            message.error(error?.message || '加载申诉列表失败');
        } finally {
            loading.value = false;
        }
    };

    const changePage = (page: number) => {
        pagination.page = page;
        void load();
    };

    const changePageSize = (pageSize: number) => {
        pagination.pageSize = pageSize;
        pagination.page = 1;
        void load();
    };

    const reloadFromFirstPage = () => {
        pagination.page = 1;
        void load();
    };

    /** 表头排序：远程模式下由前端收集排序状态并回源查询 */
    const changeSorter = (state: TableSorterState) => {
        const current = Array.isArray(state) ? state[0] : state;
        if (!current?.order || current.columnKey === undefined) {
            sorter.sortBy = 'appealed_at';
            sorter.sortOrder = 'desc';
        } else {
            sorter.sortBy = String(current.columnKey);
            sorter.sortOrder = current.order === 'ascend' ? 'asc' : 'desc';
        }
        pagination.page = 1;
        void load();
    };

    const handleViewDetail = async (row: ViolationAppealRecord) => {
        showDetailModal.value = true;
        detailLoading.value = true;
        current.value = null;
        try {
            const response = await getViolationAppealDetail(row.id);
            current.value = response.data;
        } catch (error: any) {
            message.error(error?.message || '加载申诉详情失败');
            showDetailModal.value = false;
        } finally {
            detailLoading.value = false;
        }
    };

    /**
     * 审核申诉。从表格下拉触发时传入 row，从详情弹窗触发时使用当前详情。
     */
    const handleReview = async (action: AppealReviewAction, row?: ViolationAppealRecord) => {
        const target = row ?? current.value;
        if (!target || reviewing.value) {
            return;
        }
        reviewing.value = true;
        try {
            const key = `appeal-review:${target.id}`;
            const submission = prepareIdempotentRequest(key, JSON.stringify({ action }), () => ({ action }));
            const response = await reviewViolationAppeal(target.id, action, undefined, submission.request_id);
            completeIdempotentRequest(key);
            message.success(
                action === 'approve' && response.data?.unbanned
                    ? response.data.other_restrictions > 0
                        ? '本条封禁已解除，账号仍有其他有效限制'
                        : '本条封禁已解除'
                    : `已${REVIEW_ACTION_LABEL[action]}`
            );
            showDetailModal.value = false;
            void load();
        } catch (error: any) {
            message.error(error?.message || '审核失败，请稍后重试');
        } finally {
            reviewing.value = false;
        }
    };

    // 与违规列表共用筛选条件，下拉与时间范围变化立即重新查询
    watch(() => filters.timeRange, reloadFromFirstPage);

    // 关键字输入做防抖，避免每敲一个字都发请求
    let keywordTimer: ReturnType<typeof setTimeout> | undefined;
    watch(
        () => filters.keyword,
        () => {
            if (keywordTimer) {
                clearTimeout(keywordTimer);
            }
            keywordTimer = setTimeout(reloadFromFirstPage, 400);
        }
    );

    const columns: DataTableColumns<ViolationAppealRecord> = [
        {
            title: 'ID',
            key: 'id',
            width: 70,
            sorter: true,
        },
        {
            title: '关联用户',
            key: 'username',
            width: 130,
            sorter: true,
            ellipsis: { tooltip: true },
            render: (row) => (row.user_id ? `#${row.user_id} · ${row.username}` : '未关联'),
        },
        {
            title: '违规类型',
            key: 'type',
            width: 110,
            align: 'center',
            render: (row) => {
                const type = row.type;
                if (!type) {
                    return '-';
                }
                return h(
                    NTag,
                    { type: getTypeTagType(type), size: 'small', round: true },
                    { default: () => getTypeLabel(type) }
                );
            },
        },
        {
            title: '违规隧道',
            key: 'tunnel_name',
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
            key: 'reason',
            width: 240,
            ellipsis: { tooltip: true },
        },
        {
            title: '申诉时间',
            key: 'appealed_at',
            width: 170,
            sorter: true,
            ellipsis: { tooltip: true },
            render: (row) => formatViolationTime(row.appealed_at),
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            align: 'center',
            sorter: true,
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
                        props: { onClick: () => void handleViewDetail(row) },
                    },
                    {
                        type: 'divider' as const,
                        key: 'd1',
                    },
                    {
                        label: '转入关联封禁案件',
                        key: 'ban-record',
                        icon: () => h(NIcon, { component: BanOutline, style: 'color:#d03050' }),
                        disabled: !row.ban_record_id,
                        props: { onClick: () => onViewBanRecord?.(row) },
                    },
                    {
                        type: 'divider' as const,
                        key: 'd2',
                    },
                    {
                        label: '通过申诉',
                        key: 'approve',
                        icon: () => h(NIcon, { component: CheckmarkCircle, style: 'color:#18a058' }),
                        disabled: row.status !== 'pending',
                        props: { onClick: () => void handleReview('approve', row) },
                    },
                    {
                        label: '驳回申诉',
                        key: 'reject',
                        icon: () => h(NIcon, { component: CloseCircle, style: 'color:#d03050' }),
                        disabled: row.status !== 'pending',
                        props: { onClick: () => void handleReview('reject', row) },
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
        pagination,
        showDetailModal,
        current,
        detailLoading,
        reviewing,
        load,
        changePage,
        changePageSize,
        changeSorter,
        handleViewDetail,
        handleReview,
    };
}
