<template>
    <n-card>
        <n-skeleton v-if="loading" text :style="{ width: '100%', marginTop: '16px' }" :height="MAP_HEIGHT" />
        <MapComponent v-else style="margin-top: 16px" :width="'100%'" :height="MAP_HEIGHT" :markers="markers" />
    </n-card>
</template>

<script lang="ts" setup>
import type { Marker } from '../types';
import { MAP_HEIGHT } from '../constants';

interface Props {
    loading: boolean;
    markers: Marker[];
}

defineProps<Props>();
</script>
