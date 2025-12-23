import { ref, onUnmounted } from 'vue';

/**
 * 封禁倒计时 composable
 */
export function useBanCountdown() {
    const banRemainingTime = ref<string>('');
    const banRemainingSeconds = ref<number>(0);
    let banCountdownTimer: ReturnType<typeof setInterval> | null = null;

    // 解析时间字符串为秒数
    const parseTimeToSeconds = (timeStr: string): number => {
        let totalSeconds = 0;

        // 匹配分钟
        const minuteMatch = timeStr.match(/(\d+)\s*分钟/);
        if (minuteMatch) {
            totalSeconds += parseInt(minuteMatch[1]) * 60;
        }

        // 匹配秒
        const secondMatch = timeStr.match(/(\d+)\s*秒/);
        if (secondMatch) {
            totalSeconds += parseInt(secondMatch[1]);
        }

        return totalSeconds;
    };

    // 格式化秒数为可读的时间字符串
    const formatSecondsToTime = (seconds: number): string => {
        if (seconds <= 0) {
            return '0秒';
        }

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (mins > 0 && secs > 0) {
            return `${mins}分钟${secs}秒`;
        } else if (mins > 0) {
            return `${mins}分钟`;
        } else {
            return `${secs}秒`;
        }
    };

    // 启动封禁倒计时
    const startBanCountdown = (timeStr: string) => {
        // 清除之前的定时器
        if (banCountdownTimer) {
            clearInterval(banCountdownTimer);
            banCountdownTimer = null;
        }

        // 解析时间字符串为秒数
        banRemainingSeconds.value = parseTimeToSeconds(timeStr);

        // 立即更新一次显示
        banRemainingTime.value = formatSecondsToTime(banRemainingSeconds.value);

        // 如果时间为0，不启动定时器
        if (banRemainingSeconds.value <= 0) {
            return;
        }

        // 启动倒计时
        banCountdownTimer = setInterval(() => {
            banRemainingSeconds.value -= 1;
            banRemainingTime.value = formatSecondsToTime(banRemainingSeconds.value);

            // 时间到0时停止倒计时
            if (banRemainingSeconds.value <= 0) {
                if (banCountdownTimer) {
                    clearInterval(banCountdownTimer);
                    banCountdownTimer = null;
                }
                banRemainingTime.value = '0秒';
            }
        }, 1000);
    };

    // 停止封禁倒计时
    const stopBanCountdown = () => {
        if (banCountdownTimer) {
            clearInterval(banCountdownTimer);
            banCountdownTimer = null;
        }
        banRemainingSeconds.value = 0;
        banRemainingTime.value = '';
    };

    onUnmounted(() => {
        stopBanCountdown();
    });

    return {
        banRemainingTime,
        banRemainingSeconds,
        startBanCountdown,
        stopBanCountdown,
    };
}
