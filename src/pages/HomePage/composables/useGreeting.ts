import { ref, computed, onUnmounted } from 'vue';
import { TIME_UPDATE_INTERVAL } from '../constants';

/**
 * 问候语 composable
 */
export function useGreeting(username?: string) {
    const currentTime = ref(new Date());
    let timeUpdateTimer: ReturnType<typeof setInterval> | null = null;

    const greeting = computed(() => {
        const hour = currentTime.value.getHours();
        if (hour >= 0 && hour < 6) {
            return `夜深了，${username}，夜晚依然静谧，但新的希望已经开始萌芽。`;
        } else if (hour >= 6 && hour < 11) {
            return `早上好，${username}，今天又是充满活力的一天。`;
        } else if (hour >= 11 && hour < 14) {
            return `中午好，${username}，享受这温暖的阳光和美味的午餐吧。`;
        } else if (hour >= 14 && hour < 15) {
            return `饮茶先啦，${username}，3点多啦，饮茶先啦。`;
        } else if (hour >= 15 && hour < 17) {
            return `下午好，${username}，午后的时光总是最适合专注与思考。`;
        } else if (hour >= 17 && hour < 22) {
            return `晚上好，${username}，夜幕降临，是时候享受片刻宁静了。`;
        } else {
            return `夜深了，${username}，记得早点休息，明天会更美好`;
        }
    });

    const startTimer = () => {
        timeUpdateTimer = setInterval(() => {
            currentTime.value = new Date();
        }, TIME_UPDATE_INTERVAL);
    };

    const stopTimer = () => {
        if (timeUpdateTimer) {
            clearInterval(timeUpdateTimer);
            timeUpdateTimer = null;
        }
    };

    onUnmounted(() => {
        stopTimer();
    });

    return {
        greeting,
        startTimer,
        stopTimer,
    };
}

