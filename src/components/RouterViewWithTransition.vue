<template>
    <router-view />
</template>

<script setup lang="ts">
import { useProviderStore } from '@/stores/provider';

const provider = useProviderStore();

// 在 provider 内部初始化 loading bar
provider.setLoadingBar(useLoadingBar());
</script>
