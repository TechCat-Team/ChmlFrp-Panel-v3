// 多端适配
import { defineStore } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';

export const useScreenStore = defineStore('screen', () => {
    const screenWidth = ref(window.innerWidth);
    const isHidden = ref(screenWidth.value < 600); // 初始判断屏幕宽度

    const checkScreenWidth = () => {
        screenWidth.value = window.innerWidth;
        isHidden.value = screenWidth.value < 600;
    };

    onMounted(() => {
        window.addEventListener('resize', checkScreenWidth);
        checkScreenWidth(); // 初始检查
    });

    onUnmounted(() => {
        window.removeEventListener('resize', checkScreenWidth);
    });

    return {
        screenWidth,
        isHidden,
    };
});
