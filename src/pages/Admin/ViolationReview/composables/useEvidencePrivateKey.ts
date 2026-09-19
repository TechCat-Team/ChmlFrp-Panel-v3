/**
 * 证据解密私钥的前端状态。
 *
 * 私钥只写入当前浏览器会话（sessionStorage），不会提交到服务端；
 * 模块级 ref 让页面与详情弹窗共享同一份状态，私钥变更后弹窗可自动重新解密。
 */
import { computed, ref } from 'vue';
import {
    clearEvidencePrivateKey,
    getEvidencePrivateKey,
    setEvidencePrivateKey,
    validateEvidencePrivateKey,
} from '@/utils/evidenceCrypto';

const privateKeyValue = ref(getEvidencePrivateKey());
const revision = ref(0);

export function useEvidencePrivateKey() {
    const hasPrivateKey = computed(() => privateKeyValue.value.length > 0);

    const savePrivateKey = async (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            clearEvidencePrivateKey();
            privateKeyValue.value = '';
            revision.value += 1;
            return;
        }
        await validateEvidencePrivateKey(trimmed);
        setEvidencePrivateKey(trimmed);
        privateKeyValue.value = getEvidencePrivateKey();
        revision.value += 1;
    };

    const resetPrivateKey = () => {
        clearEvidencePrivateKey();
        privateKeyValue.value = '';
        revision.value += 1;
    };

    return { privateKeyValue, hasPrivateKey, revision, savePrivateKey, resetPrivateKey };
}
