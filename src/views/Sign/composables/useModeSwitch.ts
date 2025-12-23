import { ref, computed, watch } from 'vue';
import type { AuthMode } from '../types';

/**
 * 模式切换 composable
 */
export function useModeSwitch() {
    const isRegister = ref(false);
    const isReset = ref(false);
    const mode = computed<AuthMode>(() => (isReset.value ? 'reset' : isRegister.value ? 'register' : 'login'));
    const formTransitionName = ref('form-slide');

    watch(mode, (newMode, oldMode) => {
        // Reset -> Login use slide-down (从上往下)
        if (oldMode === 'reset' && newMode === 'login') {
            formTransitionName.value = 'slide-down';
        } else {
            formTransitionName.value = 'form-slide';
        }
    });

    const toLogin = () => {
        isRegister.value = false;
        isReset.value = false;
    };

    const toReset = () => {
        isReset.value = true;
        isRegister.value = false;
    };

    const toggleRegister = () => {
        isRegister.value = !isRegister.value;
    };

    return {
        isRegister,
        isReset,
        mode,
        formTransitionName,
        toLogin,
        toReset,
        toggleRegister,
    };
}
