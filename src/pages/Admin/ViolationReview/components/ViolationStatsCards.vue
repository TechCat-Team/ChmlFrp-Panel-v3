<template>
    <div class="stats-grid">
        <n-card
            v-for="stat in stats"
            :key="stat.key"
            :bordered="false"
            class="stat-card"
            :class="stat.className"
        >
            <div class="stat-content">
                <div class="stat-icon" :style="{ background: stat.iconBg }">
                    <n-icon :component="stat.icon" :size="24" />
                </div>
                <div class="stat-meta">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                </div>
            </div>
        </n-card>
    </div>
</template>

<script lang="ts" setup>
import type { ViolationStatsItem } from '../types';

defineProps<{
    stats: ViolationStatsItem[];
}>();
</script>

<style scoped lang="scss">
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.stat-card {
    border-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 14px;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--n-text-color-1);
}

.stat-meta {
    min-width: 0;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--n-text-color-1);
    display: block;
}

.stat-label {
    font-size: 13px;
    color: var(--n-text-color-3);
}

.stat-pending {
    .stat-icon {
        color: #f0a020;
    }
}

.stat-porn {
    .stat-icon {
        color: #d03050;
    }
}

.stat-site {
    .stat-icon {
        color: #2080f0;
    }
}

.stat-processed {
    .stat-icon {
        color: #18a058;
    }
}
</style>
