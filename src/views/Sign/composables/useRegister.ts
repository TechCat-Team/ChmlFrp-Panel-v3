import { ref, computed, watch } from 'vue';
import { useMessage } from 'naive-ui';
import api from '@/api';
import type { RegisterModel } from '../types';
import { MESSAGES } from '../constants';

/**
 * 注册 composable
 */
export function useRegister(formModel: { value: RegisterModel }, clause: { value: boolean }, onSuccess: () => void) {
    const message = useMessage();
    const RegLoading = ref(false);
    const currentStep = ref(1);
    const lastStep = ref(1);
    const transitionName = ref<'slide-left' | 'slide-right'>('slide-left');

    watch(currentStep, (newStep, oldStep) => {
        transitionName.value = newStep > oldStep ? 'slide-left' : 'slide-right';
        lastStep.value = oldStep;
    });

    const passwordMismatch = computed(() => {
        return currentStep.value === 2 && formModel.value.password !== formModel.value.confirmPassword;
    });

    const isNextStepDisabled = computed(() => {
        if (currentStep.value === 1) {
            return !formModel.value.username || !formModel.value.qq || !formModel.value.password;
        }
        if (currentStep.value === 2) {
            return !formModel.value.email || !formModel.value.confirmPassword;
        }
        if (currentStep.value === 3) {
            return (
                !formModel.value.verificationCode ||
                !clause.value ||
                RegLoading.value === true ||
                !formModel.value.username
            );
        }
        return false;
    });

    const nextStep = async () => {
        if (currentStep.value === 2 && passwordMismatch.value) {
            message.error(MESSAGES.PASSWORD_MISMATCH);
        } else if (currentStep.value === 3) {
            RegLoading.value = true;
            try {
                await api.v2.user.register(
                    formModel.value.username,
                    formModel.value.password,
                    formModel.value.email,
                    formModel.value.qq,
                    formModel.value.verificationCode
                );

                message.success(MESSAGES.REGISTER_SUCCESS);
                onSuccess();
            } catch (error) {
                message.error(MESSAGES.REGISTER_FAILED + ': ' + (error as Error).message);
            }
            RegLoading.value = false;
        } else {
            currentStep.value++;
        }
    };

    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
        }
    };

    return {
        RegLoading,
        currentStep,
        lastStep,
        transitionName,
        passwordMismatch,
        isNextStepDisabled,
        nextStep,
        prevStep,
    };
}
