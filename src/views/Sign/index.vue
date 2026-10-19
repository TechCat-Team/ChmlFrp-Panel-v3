<template>
    <div class="auth-redirect-container">
        <div class="aurora-bg">
            <div class="aurora-blob blob-blue"></div>
            <div class="aurora-blob blob-purple"></div>
            <div class="aurora-blob blob-orange"></div>
        </div>

        <div class="auth-content" :class="{ 'fade-in': showCard }">
            <div class="loader-wrapper" v-if="!hasSsoError">
                <svg class="circular-loader" viewBox="25 25 50 50">
                    <circle
                        class="loader-path"
                        cx="50"
                        cy="50"
                        r="20"
                        fill="none"
                        stroke-width="3"
                        stroke-miterlimit="10"
                    />
                </svg>
            </div>

            <div class="text-content">
                <h1 class="auth-title">{{ titleText }}</h1>
                <p class="auth-subtitle">{{ subtitleText }}</p>
                <p class="auth-desc" v-if="hasSsoError">您已取消授权，点击下方按钮可重新发起登录。</p>
            </div>

            <div class="auth-action" :class="{ 'show-action': showAction }">
                <a :href="authorizeUrl" class="action-link">
                    <span>{{ actionText }}</span>
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import { hasAuthTokens } from '@/utils/authToken';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const panelOrigin = 'https://panel.chmlfrp.net';

const route = useRoute();
const router = useRouter();

const resolveRedirectPath = (rawValue: unknown) => {
    if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
        return '/home';
    }

    try {
        const resolvedUrl = new URL(rawValue, panelOrigin);
        if (resolvedUrl.origin !== panelOrigin) {
            return '/home';
        }
        const fullPath = `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
        return fullPath === '/sign' ? '/home' : fullPath;
    } catch {
        return '/home';
    }
};

const showCard = ref(false);
const showAction = ref(false);
const ssoError = computed(() => String(route.query.sso_error || '').trim());
const hasSsoError = computed(() => ssoError.value.length > 0);
const redirectPath = computed(() => resolveRedirectPath(route.query.redirect));
const returnUrl = computed(() => new URL(redirectPath.value, panelOrigin).toString());
const authorizeUrl = computed(() => `${apiBaseUrl}/sso/authorize?return_url=${encodeURIComponent(returnUrl.value)}`);
const titleText = computed(() => (hasSsoError.value ? '登录已取消' : '正在安全连接'));
const subtitleText = computed(() => (hasSsoError.value ? ssoError.value : '请稍候'));
const actionText = computed(() => (hasSsoError.value ? '重新登录' : '手动跳转'));

onMounted(async () => {
    setTimeout(() => {
        showCard.value = true;
    }, 100);

    setTimeout(() => {
        showAction.value = true;
    }, 3000);

    if (hasSsoError.value) {
        return;
    }

    try {
        const res = await api.v2.user.getUserInfo();
        if (res?.data) {
            sessionStorage.removeItem('sso_last_redirect_at');
            setTimeout(async () => {
                await router.replace(redirectPath.value);
            }, 800);
            return;
        }
    } catch {
        void 0;
    }

    if (hasAuthTokens()) {
        sessionStorage.removeItem('sso_last_redirect_at');
    }

    const now = Date.now();
    const lastRedirectAt = Number(sessionStorage.getItem('sso_last_redirect_at') || 0);
    if (now - lastRedirectAt < 2000) {
        return;
    }
    sessionStorage.setItem('sso_last_redirect_at', String(now));

    setTimeout(() => {
        window.location.replace(authorizeUrl.value);
    }, 800);
});
</script>

<style scoped>
.auth-redirect-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #111111;
    z-index: 9999;
    overflow: hidden;
}

@media (prefers-color-scheme: dark) {
    .auth-redirect-container {
        background-color: #0a0a0a;
        color: #f5f5f5;
    }
}

.aurora-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    z-index: 1;
    opacity: 0.8;
    filter: blur(50px);
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (prefers-color-scheme: dark) {
    .aurora-bg {
        opacity: 0.6;
        filter: blur(70px);
    }
}

.aurora-blob {
    position: absolute;
    border-radius: 50%;
    mix-blend-mode: normal;
    /* Common animation base */
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-iteration-count: infinite;
}

@media (prefers-color-scheme: dark) {
    .aurora-blob {
        mix-blend-mode: screen;
    }
}

.blob-blue {
    width: 45vw;
    height: 45vw;
    max-width: 500px;
    max-height: 500px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0) 70%);
    animation: converge-blue 12s infinite;
}

.blob-purple {
    width: 45vw;
    height: 45vw;
    max-width: 500px;
    max-height: 500px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0) 70%);
    animation: converge-purple 12s infinite;
}
.blob-orange {
    width: 45vw;
    height: 45vw;
    max-width: 500px;
    max-height: 500px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(249, 115, 22, 0) 70%);
    animation: converge-orange 12s infinite;
}

@keyframes converge-blue {
    0% {
        transform: rotate(0deg) translateX(45vw) scale(1);
    }
    40% {
        transform: rotate(144deg) translateX(5vw) scale(1.2);
    }
    50% {
        transform: rotate(180deg) translateX(0%) scale(1.3);
    }
    60% {
        transform: rotate(216deg) translateX(5vw) scale(1.2);
    }
    100% {
        transform: rotate(360deg) translateX(45vw) scale(1);
    }
}

@keyframes converge-purple {
    0% {
        transform: rotate(120deg) translateX(45vw) scale(1);
    }
    40% {
        transform: rotate(264deg) translateX(5vw) scale(1.2);
    }
    50% {
        transform: rotate(300deg) translateX(0%) scale(1.3);
    }
    60% {
        transform: rotate(336deg) translateX(5vw) scale(1.2);
    }
    100% {
        transform: rotate(480deg) translateX(45vw) scale(1);
    }
}

@keyframes converge-orange {
    0% {
        transform: rotate(240deg) translateX(45vw) scale(1);
    }
    40% {
        transform: rotate(384deg) translateX(5vw) scale(1.2);
    }
    50% {
        transform: rotate(420deg) translateX(0%) scale(1.3);
    }
    60% {
        transform: rotate(456deg) translateX(5vw) scale(1.2);
    }
    100% {
        transform: rotate(600deg) translateX(45vw) scale(1);
    }
}

.auth-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    background: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: none;
}

@media (prefers-color-scheme: dark) {
    .auth-content {
        background: transparent;
        border: none;
        box-shadow: none;
    }
}

.auth-content.fade-in {
    opacity: 1;
    transform: translateY(0);
}

.loader-wrapper {
    width: 40px;
    height: 40px;
    position: relative;
}

.circular-loader {
    animation: rotate 2s linear infinite;
    height: 100%;
    width: 100%;
}

.loader-path {
    stroke: rgba(17, 17, 17, 0.9);
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite;
    stroke-linecap: round;
}

@media (prefers-color-scheme: dark) {
    .loader-path {
        stroke: rgba(255, 255, 255, 0.9);
    }
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}

.text-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.auth-title {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin: 0;
    color: rgba(17, 17, 17, 0.9);
}

.auth-subtitle {
    font-size: 14px;
    font-weight: 500;
    color: rgba(17, 17, 17, 0.6);
    margin: 0;
    letter-spacing: 0.01em;
}

.auth-desc {
    font-size: 13px;
    font-weight: 500;
    color: rgba(17, 17, 17, 0.75);
    margin: 6px 0 0;
    letter-spacing: 0.01em;
}

@media (prefers-color-scheme: dark) {
    .auth-title {
        color: rgba(255, 255, 255, 0.95);
    }
    .auth-subtitle {
        color: rgba(255, 255, 255, 0.6);
    }
    .auth-desc {
        color: rgba(255, 255, 255, 0.78);
    }
}

.auth-action {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.6s ease;
    margin-top: 16px;
}

.auth-action.show-action {
    opacity: 1;
    visibility: visible;
}

.action-link {
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    color: rgba(17, 17, 17, 0.5);
    text-decoration: none;
    padding: 8px 0;
    background: transparent;
    transition: all 0.3s ease;
}

.action-link:hover {
    color: rgba(17, 17, 17, 0.9);
}

@media (prefers-color-scheme: dark) {
    .action-link {
        color: rgba(255, 255, 255, 0.4);
        background: transparent;
    }
    .action-link:hover {
        color: rgba(255, 255, 255, 0.9);
        background: transparent;
    }
}
</style>
