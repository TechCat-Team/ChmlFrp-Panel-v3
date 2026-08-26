/**
 * 违规复审 - 列表 / 筛选 / 统计 composable
 */
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';
import type { PaginationProps } from 'naive-ui';
import { MOCK_VIOLATIONS, STAT_CARD_META } from '../constants';
import type { Violation, ViolationFilters, ViolationStatsItem } from '../types';

export function useViolationList() {
    const violations = ref<Violation[]>(MOCK_VIOLATIONS);

    const filters = reactive<ViolationFilters>({
        keyword: '',
        type: null,
        status: null,
        timeRange: null,
    });

    const filteredData = computed(() =>
        violations.value.filter((item) => {
            if (filters.type && item.type !== filters.type) return false;
            if (filters.status && item.status !== filters.status) return false;
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
        })
    );

    const stats = computed<ViolationStatsItem[]>(() =>
        STAT_CARD_META.map((meta) => ({
            key: meta.key,
            label: meta.label,
            className: meta.className,
            iconBg: meta.iconBg,
            icon: meta.icon,
            value: violations.value.filter(meta.match).length,
        }))
    );

    const pagination = reactive<PaginationProps>({
        page: 1,
        pageSize: 10,
        showSizePicker: true,
        pageSizes: [10, 20, 50],
    });

    const handleReset = () => {
        filters.keyword = '';
        filters.type = null;
        filters.status = null;
        filters.timeRange = null;
    };

    return {
        violations,
        filters,
        filteredData,
        stats,
        pagination,
        handleReset,
    };
}
