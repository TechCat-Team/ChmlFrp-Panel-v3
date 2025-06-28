<template>
    <div class="not-found-container">
        <div class="not-found-content">
            <div class="not-found-card">
                <h1 class="not-found-title">404</h1>
                <p class="not-found-subtitle">页面未找到</p>
                <p class="not-found-description">对不起，您访问的页面不存在。可能是URL输入错误，或页面已被移除。</p>
                <n-button type="primary" class="not-found-button" @click="goHome"> 返回主页 </n-button>
            </div>
            <div class="not-found-footer">
                <p>Copyright © 2021 - 2025 TechCat All rights reserved.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { NButton } from 'naive-ui';

export default defineComponent({
    name: 'NotFound',
    components: {
        NButton,
    },
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
/* 容器样式 */
.not-found-container {
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 内容区域 */
.not-found-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 800px;
    padding: 20px;
}

/* 卡片样式 */
.not-found-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 50px 60px;
    text-align: center;
    animation: cardFadeIn 1s ease-in-out;
}

/* 标题样式 */
.not-found-title {
    font-size: 8rem;
    font-weight: 700;
    color: #2f77f3;
    margin: 0;
    line-height: 1;
    animation: titleScale 0.8s ease-in-out;
}

/* 副标题样式 */
.not-found-subtitle {
    font-size: 2rem;
    color: #333;
    margin: 10px 0 20px;
    animation: textFadeIn 1s ease-in-out;
}

/* 描述文字样式 */
.not-found-description {
    font-size: 1.2rem;
    color: #666;
    margin: 0 0 30px;
    line-height: 1.6;
    animation: textFadeIn 1.2s ease-in-out;
}

/* 按钮样式 */
.not-found-button {
    font-size: 1.1rem;
    padding: 12px 30px;
    border-radius: 8px;
    transition: all 0.3s ease;
    animation: buttonFadeIn 1.4s ease-in-out;
}

.not-found-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 页脚样式 */
.not-found-footer {
    margin-top: 40px;
    color: #1c0e0e;
    font-size: 0.9rem;
    opacity: 0.8;
}

/* 动画效果 */
@keyframes cardFadeIn {
    0% {
        opacity: 0;
        transform: translateY(50px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes titleScale {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes textFadeIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes buttonFadeIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .not-found-card {
        padding: 30px 40px;
    }

    .not-found-title {
        font-size: 6rem;
    }

    .not-found-subtitle {
        font-size: 1.5rem;
    }

    .not-found-description {
        font-size: 1rem;
    }

    .not-found-button {
        font-size: 1rem;
        padding: 10px 25px;
    }
}

@media (max-width: 480px) {
    .not-found-card {
        padding: 20px 30px;
    }

    .not-found-title {
        font-size: 4rem;
    }

    .not-found-subtitle {
        font-size: 1.2rem;
    }

    .not-found-description {
        font-size: 0.9rem;
    }

    .not-found-button {
        font-size: 0.9rem;
        padding: 8px 20px;
    }

    .not-found-footer {
        font-size: 0.8rem;
    }
}
</style>
