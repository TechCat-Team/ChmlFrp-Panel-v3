<template>
    <transition name="hero-fade" mode="out-in">
        <div class="hero" @click="isMobile && $emit('toggle-register')">
                <transition name="text-fade" mode="out-in">
                    <div :key="mode">
                        <template v-if="mode === 'login'">
                            <h1>Sign In to<br />ChmlFrp Panel</h1>
                            <p>
                                如果您还没有账号<br />请
                                <n-button text type="primary" @click.stop="$emit('toggle-register')">点击这里</n-button>
                                进行注册.
                            </p>
                        </template>
                        <template v-else-if="mode === 'register'">
                            <h1>Sign Up to<br />ChmlFrp Panel</h1>
                            <p>
                                已经有账号了?<br />请
                                <n-button text type="primary" @click.stop="$emit('toggle-register')">点击这里</n-button>
                                进行登录.
                            </p>
                        </template>
                        <template v-else>
                            <h1>Reset Your PW<br />ChmlFrp Panel</h1>
                            <p>
                                想起密码了?<br />请
                                <n-button text type="primary" @click.stop="$emit('to-login')">点击这里</n-button>
                                返回登录
                            </p>
                        </template>
                    </div>
                </transition>
            </div>
        </transition>
</template>

<script lang="ts" setup>
import type { AuthMode } from '../types';

interface Props {
    mode: AuthMode;
    isRegister: boolean;
    isMobile: boolean;
}

defineProps<Props>();
defineEmits<{
    'toggle-register': [];
    'to-login': [];
}>();
</script>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
    transition: opacity 0.5s ease;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
    opacity: 0;
}

.hero-fade-enter-to,
.hero-fade-leave-from {
    opacity: 1;
}

.text-fade-enter-active,
.text-fade-leave-active {
    transition: opacity 0.3s ease;
}

.text-fade-enter-from,
.text-fade-leave-to {
    opacity: 0;
}

.text-fade-enter-to,
.text-fade-leave-from {
    opacity: 1;
}

.hero {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 50px;
    padding: 70px 0;
    cursor: pointer;
}

h1 {
    font-size: 4em;
    font-weight: 700;
    line-height: normal;
}

.hero p {
    font-size: 1.2em;
    font-weight: 500;
}

.hero .n-button {
    font-size: 1em;
}

@keyframes moveGradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.hero::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 0;
    width: 280px;
    height: 100px;
    background: linear-gradient(to right, #4460f1, #c471ed, #f64f59);
    background-size: 200% 200%;
    animation: moveGradient 5s ease infinite;
    z-index: 1;
    filter: blur(70px);
}

@media (max-width: 768px) {
    .hero-container {
        transform: none !important;
        text-align: center;
    }

    .hero {
        padding: 20px;
    }
}
</style>

