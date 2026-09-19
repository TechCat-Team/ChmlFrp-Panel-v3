/**
 * 违规审查 - 列表 / 筛选 / 分页 composable
 *
 * 待审查、违规封禁、放行记录三个表格各自维护分页状态，共用同一份筛选条件，
 * 数据均来自服务端分页接口。
 */
import { reactive, ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { getViolations, type ViolationRecord, type ViolationStatus, type ViolationType } from '@/api/v2/admin/violation';

export interface ViolationFilters {
    keyword: string;
    type: ViolationType | null;
    timeRange: [number, number] | null;
}

type ViolationSection = ReturnType<typeof createSection>;

function createSection(status: ViolationStatus, filters: ViolationFilters) {
    const message = useMessage();
    const list = ref<ViolationRecord[]>([]);
    const loading = ref(false);
    const pagination = reactive({
        page: 1,
        pageSize: 10,
        itemCount: 0,
        pageSizes: [10, 20, 50],
        showSizePicker: true,
    });

    const load = async () => {
        loading.value = true;
        try {
            const response = await getViolations({
                status,
                type: filters.type,
                keyword: filters.keyword,
                startTime: filters.timeRange?.[0] ?? null,
                endTime: filters.timeRange?.[1] ?? null,
                page: pagination.page,
                size: pagination.pageSize,
            });
            list.value = response.data?.violations ?? [];
            pagination.itemCount = response.data?.total ?? 0;
        } catch (error: any) {
            list.value = [];
            pagination.itemCount = 0;
            message.error(error?.message || '加载违规记录失败');
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

    return { list, loading, pagination, load, changePage, changePageSize };
}

export function useViolationList() {
    const filters = reactive<ViolationFilters>({
        keyword: '',
        type: null,
        timeRange: null,
    });

    const pending = createSection('pending', filters);
    const banned = createSection('banned', filters);
    const passed = createSection('passed', filters);

    const sections: ViolationSection[] = [pending, banned, passed];

    const loadAll = () => {
        sections.forEach((section) => void section.load());
    };

    const reloadFromFirstPage = () => {
        sections.forEach((section) => {
            section.pagination.page = 1;
        });
        loadAll();
    };

    // 下拉与时间范围变化立即重新查询
    watch(() => filters.type, reloadFromFirstPage);
    watch(() => filters.timeRange, reloadFromFirstPage);

    // 关键字输入做防抖，避免每敲一个字都发请求
    let keywordTimer: ReturnType<typeof setTimeout> | undefined;
    const clearKeywordTimer = () => {
        if (keywordTimer) {
            clearTimeout(keywordTimer);
            keywordTimer = undefined;
        }
    };
    watch(
        () => filters.keyword,
        () => {
            clearKeywordTimer();
            keywordTimer = setTimeout(reloadFromFirstPage, 400);
        }
    );

    const handleReset = () => {
        clearKeywordTimer();
        filters.keyword = '';
        filters.type = null;
        filters.timeRange = null;
    };

    return {
        filters,
        pendingList: pending.list,
        bannedList: banned.list,
        passedList: passed.list,
        pendingLoading: pending.loading,
        bannedLoading: banned.loading,
        passedLoading: passed.loading,
        pendingPagination: pending.pagination,
        bannedPagination: banned.pagination,
        passedPagination: passed.pagination,
        handlePendingPage: pending.changePage,
        handleBannedPage: banned.changePage,
        handlePassedPage: passed.changePage,
        handlePendingPageSize: pending.changePageSize,
        handleBannedPageSize: banned.changePageSize,
        handlePassedPageSize: passed.changePageSize,
        handleReset,
        loadAll,
        reloadFromFirstPage,
    };
}
