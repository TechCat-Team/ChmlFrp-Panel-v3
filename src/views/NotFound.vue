<template>
    <n-layout style="height: 100vh">
        <n-layout-content>
            <n-space vertical size="large" align="center" justify="center" class="not-found-page">
                <n-result status="404" title="404" description="对不起，您访问的页面不存在">
                    <template #footer>
                        <n-button type="primary" @click="goHome">返回主页</n-button>
                    </template>
                </n-result>
            </n-space>
        </n-layout-content>
    </n-layout>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'NotFound',
    setup() {
        const router = useRouter();

        const goHome = () => {
            router.push('/');
        };

        return {
            goHome,
        };
    },
});
</script>

<style scoped>
.not-found-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.n-result__title {
    font-size: 4rem;
    color: #333;
}

.n-result__description {
    font-size: 1.25rem;
    color: #666;
}
</style>
