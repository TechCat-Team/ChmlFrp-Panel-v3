/**
 * 违规审查 - 列表 / 筛选 / 统计 composable
 */
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';
import type { PaginationProps } from 'naive-ui';
import { MOCK_VIOLATIONS } from '../constants';
import type { Violation, ViolationFilters } from '../types';

/**
 * 根据状态拆分待审查 / 已封禁 / 已放行三个列表，
 * 三者共用同一份 keyword / type / timeRange 筛选条件。
 */
export function useViolationList() {
    const violations = ref<Violation[]>(MOCK_VIOLATIONS);

    const filters = reactive<ViolationFilters>({
        keyword: '',
        type: null,
        timeRange: null,
    });

    const matchCommon = (item: Violation) => {
        if (filters.type && item.type !== filters.type) return false;
        if (filters.timeRange) {
            const t = dayjs(item.reportedAt).valueOf();
            if (t < filters.timeRange[0] || t > filters.timeRange[1]) return false;
        }
        const kw = filters.keyword.trim().toLowerCase();
        if (kw) {
            const hit =
                item.title.toLowerCase().includes(kw) ||
                item.user.username.toLowerCase().includes(kw) ||
                item.target.toLowerCase().includes(kw);
            if (!hit) return false;
        }
        return true;
    };

    const createList = (status: Violation['status']) =>
        computed(() => violations.value.filter((item) => item.status === status && matchCommon(item)));

    const pendingList = createList('pending');
    const bannedList = createList('banned');
    const passedList = createList('passed');

    const createPagination = () =>
        reactive<PaginationProps>({
            page: 1,
            pageSize: 10,
            showSizePicker: true,
            pageSizes: [10, 20, 50],
        });

    const pendingPagination = createPagination();
    const bannedPagination = createPagination();
    const passedPagination = createPagination();

    const handleReset = () => {
        filters.keyword = '';
        filters.type = null;
        filters.timeRange = null;
    };

    return {
        violations,
        filters,
        pendingList,
        bannedList,
        passedList,
        pendingPagination,
        bannedPagination,
        passedPagination,
        handleReset,
    };
}
