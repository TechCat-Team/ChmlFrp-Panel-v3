import { computed, type Ref, type ComputedRef } from 'vue';
import type { NodeDetails, Status } from '../types';
import { SECONDS_PER_DAY } from '../constants';

export function useNodeMetrics(
    nodeDetails: Ref<NodeDetails | undefined> | ComputedRef<NodeDetails | undefined>,
    latestStatus: Ref<Status | null> | ComputedRef<Status | null>
) {
    const storageUsedPercentage = computed(() => {
        const details = nodeDetails.value;
        const total = details?.storage_total || 0;
        const used = details?.storage_used || 0;
        return total > 0 ? (used / total) * 100 : 0;
    });

    const memoryUsedPercentage = computed(() => {
        const details = nodeDetails.value;
        const status = latestStatus.value;
        const total = details?.memory_total || 0;
        const used = status?.memory_used || 0;
        return total > 0 ? (used / total) * 100 : 0;
    });

    const uptimeDays = computed(() => {
        const details = nodeDetails.value;
        const uptimeSeconds = details?.uptime_seconds;
        return uptimeSeconds ? Math.ceil(uptimeSeconds / SECONDS_PER_DAY) : null;
    });

    return {
        storageUsedPercentage,
        memoryUsedPercentage,
        uptimeDays,
    };
}
