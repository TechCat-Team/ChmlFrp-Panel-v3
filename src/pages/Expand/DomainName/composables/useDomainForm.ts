import { ref, computed } from 'vue';
import type { DomainFormModel, FastDomainFormModel } from '../types';
import {
    DEFAULT_TTL,
    DEFAULT_RECORD_TYPE,
    DEFAULT_FAST_RECORD_TYPE,
    TARGET_PLACEHOLDER_MAP,
    DEFAULT_TARGET_PLACEHOLDER,
} from '../constants';

/**
 * 域名表单管理 composable
 */
export function useDomainForm() {
    const model = ref<DomainFormModel>({
        selectedDomain: '',
        selectedRecordType: DEFAULT_RECORD_TYPE,
        recordValue: '',
        TTLValue: DEFAULT_TTL,
        target: '',
    });

    const fastModel = ref<FastDomainFormModel>({
        selectedDomain: '',
        selectedRecordType: DEFAULT_FAST_RECORD_TYPE,
        selectedTunnel: null,
        recordValue: '',
    });

    const targetPlaceholder = computed(() => {
        return TARGET_PLACEHOLDER_MAP[model.value.selectedRecordType] || DEFAULT_TARGET_PLACEHOLDER;
    });

    const resetForm = () => {
        model.value = {
            selectedDomain: '',
            selectedRecordType: DEFAULT_RECORD_TYPE,
            recordValue: '',
            TTLValue: DEFAULT_TTL,
            target: '',
        };
    };

    const resetFastForm = () => {
        fastModel.value = {
            selectedDomain: '',
            selectedRecordType: DEFAULT_FAST_RECORD_TYPE,
            selectedTunnel: null,
            recordValue: '',
        };
    };

    return {
        model,
        fastModel,
        targetPlaceholder,
        resetForm,
        resetFastForm,
    };
}

