import { ref, onMounted, onUnmounted } from 'vue';
import { MOBILE_BREAKPOINT } from '../constants';

/**
 * 移动端检测 composable
 */
export function useMobileDetection() {
    const isMobile = ref(false);

    const handleResize = () => {
        isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT;
    };

    onMounted(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });

    return {
        isMobile,
    };
}

