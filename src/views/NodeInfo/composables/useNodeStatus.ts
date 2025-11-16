import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { Status } from '../types';
import { STATUS_SMOOTH_MAX_ZERO_COUNT } from '../constants';

export function useNodeStatus(statusList: Ref<Status[] | undefined> | ComputedRef<Status[] | undefined>) {
    const latestStatus = ref<Status | null>(null);

    const isAllZero = (status: Status): boolean => {
        return (
            status.cpu_usage === 0 &&
            status.memory_used === 0 &&
            status.active_conn === 0 &&
            status.passive_conn === 0 &&
            status.cur_conns === 0 &&
            status.client_counts === 0 &&
            status.proxy_tcp === 0 &&
            status.proxy_udp === 0 &&
            status.proxy_http === 0 &&
            status.proxy_https === 0 &&
            status.upload_bandwidth_usage_percent === 0 &&
            status.download_bandwidth_usage_percent === 0 &&
            status.sent_packets === 0 &&
            status.recv_packets === 0
        );
    };

    const smoothStatusList = (list: Status[], maxZeroCount = STATUS_SMOOTH_MAX_ZERO_COUNT): Status[] => {
        const result = list.slice();
        let i = 1;
        while (i < result.length - 1) {
            if (isAllZero(result[i])) {
                let start = i;
                let end = i;
                while (end < result.length - 1 && isAllZero(result[end])) {
                    end++;
                    if (end - start + 1 > maxZeroCount) break;
                }
                if (start > 0 && end < result.length - 1 && !isAllZero(result[start - 1]) && !isAllZero(result[end])) {
                    const prev = result[start - 1];
                    const next = result[end];
                    for (let j = start; j < end; j++) {
                        result[j] = {
                            ...result[j],
                            cpu_usage: (prev.cpu_usage + next.cpu_usage) / 2,
                            memory_used: (prev.memory_used + next.memory_used) / 2,
                            active_conn: Math.round((prev.active_conn + next.active_conn) / 2),
                            passive_conn: Math.round((prev.passive_conn + next.passive_conn) / 2),
                            cur_conns: Math.round((prev.cur_conns + next.cur_conns) / 2),
                            client_counts: Math.round((prev.client_counts + next.client_counts) / 2),
                            proxy_tcp: Math.round((prev.proxy_tcp + next.proxy_tcp) / 2),
                            proxy_udp: Math.round((prev.proxy_udp + next.proxy_udp) / 2),
                            proxy_http: Math.round((prev.proxy_http + next.proxy_http) / 2),
                            proxy_https: Math.round((prev.proxy_https + next.proxy_https) / 2),
                            upload_bandwidth_usage_percent:
                                (prev.upload_bandwidth_usage_percent + next.upload_bandwidth_usage_percent) / 2,
                            download_bandwidth_usage_percent:
                                (prev.download_bandwidth_usage_percent + next.download_bandwidth_usage_percent) / 2,
                            sent_packets: Math.round((prev.sent_packets + next.sent_packets) / 2),
                            recv_packets: Math.round((prev.recv_packets + next.recv_packets) / 2),
                        };
                    }
                    i = end;
                } else {
                    i = end;
                }
            } else {
                i++;
            }
        }
        return result;
    };

    const sortedStatusList = computed(() => {
        const list = statusList.value;
        if (!list || list.length === 0) return [];
        const sorted = list.slice().sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        return smoothStatusList(sorted);
    });

    const updateLatestStatus = () => {
        latestStatus.value = sortedStatusList.value[0] || null;
    };

    return {
        latestStatus,
        sortedStatusList,
        updateLatestStatus,
    };
}

