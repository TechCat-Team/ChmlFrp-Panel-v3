/**
 * 违规证据附件的解密工具（非对称混合加密，端到端）。
 *
 * 节点侧加密流程：
 *   1. 调 GET /v2/node/violation/public-key 获取 RSA 公钥
 *   2. 随机生成 32 字节 AES-256 会话密钥，用它以 AES-256-GCM 加密证据
 *   3. 用 RSA 公钥以 RSA-OAEP(SHA-256) 包裹该会话密钥
 *   4. 拼装上传：[2 字节大端被包裹密钥长度][被包裹的会话密钥][12 字节 IV][AES-GCM 密文 + 16 字节标签]
 *
 * 解密全在本浏览器完成：RSA 私钥只保存在 sessionStorage，
 * 服务端与对象存储只有密文，无法还原证据。
 */
const KEY_STORAGE = 'chmlfrp_violation_evidence_private_key';
const KEY_RING_STORAGE = `${KEY_STORAGE}_versions`;

const WRAPPED_KEY_LENGTH_FIELD = 2;
const IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

const isClient = () => typeof window !== 'undefined';

/**
 * 读取管理员在面板中粘贴的 PKCS#8 RSA 私钥（PEM），未设置时返回空串。
 */
export const getEvidencePrivateKey = (keyId?: string | null): string => {
    if (!isClient()) {
        return '';
    }
    if (keyId) {
        try {
            const keys = JSON.parse(sessionStorage.getItem(KEY_RING_STORAGE) || '{}');
            if (keys[keyId]) return keys[keyId];
        } catch {
            /* legacy single key remains supported */
        }
    }
    return sessionStorage.getItem(KEY_STORAGE)?.trim() ?? '';
};

export const hasEvidencePrivateKey = () => getEvidencePrivateKey().length > 0;

export const setEvidencePrivateKey = (value: string, keyId?: string) => {
    if (!isClient()) {
        return;
    }
    const trimmed = value.trim();
    if (trimmed) {
        sessionStorage.setItem(KEY_STORAGE, trimmed);
        if (keyId) {
            let keys: Record<string, string> = {};
            try {
                keys = JSON.parse(sessionStorage.getItem(KEY_RING_STORAGE) || '{}');
            } catch {
                /* replace corrupt ring */
            }
            keys[keyId] = trimmed;
            sessionStorage.setItem(KEY_RING_STORAGE, JSON.stringify(keys));
        }
    } else {
        sessionStorage.removeItem(KEY_STORAGE);
    }
};

export const clearEvidencePrivateKey = () => {
    if (!isClient()) {
        return;
    }
    sessionStorage.removeItem(KEY_STORAGE);
    sessionStorage.removeItem(KEY_RING_STORAGE);
    cachedPem = '';
    cachedPrivateKey = null;
};

const pemToArrayBuffer = (pem: string): ArrayBuffer => {
    const base64 = pem
        .replace(/-----BEGIN [A-Z ]+-----/g, '')
        .replace(/-----END [A-Z ]+-----/g, '')
        .replace(/\s/g, '');
    if (!base64) {
        throw new Error('私钥内容为空');
    }
    let binary: string;
    try {
        binary = window.atob(base64);
    } catch {
        throw new Error('私钥不是合法的 PEM / Base64 内容');
    }
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
};

let cachedPem = '';
let cachedPrivateKey: CryptoKey | null = null;

const importPrivateKey = async (pem: string): Promise<CryptoKey> => {
    if (!isClient() || !window.crypto?.subtle) {
        throw new Error('当前环境不支持 WebCrypto，无法解密证据附件（请使用 HTTPS 访问面板）');
    }
    if (cachedPrivateKey && cachedPem === pem) {
        return cachedPrivateKey;
    }

    let key: CryptoKey;
    try {
        key = await window.crypto.subtle.importKey(
            'pkcs8',
            pemToArrayBuffer(pem),
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['decrypt']
        );
    } catch {
        throw new Error(
            '私钥格式不正确，需要 PKCS#8 PEM（BEGIN PRIVATE KEY），可用 openssl pkcs8 -topk8 -nocrypt 转换'
        );
    }

    cachedPem = pem;
    cachedPrivateKey = key;
    return key;
};

/**
 * 校验私钥格式，供管理员保存前做即时反馈。
 */
export const validateEvidencePrivateKey = async (pem: string) => {
    await importPrivateKey(pem.trim());
    const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(pem),
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['decrypt']
    );
    const jwk = await window.crypto.subtle.exportKey('jwk', privateKey);
    const publicKey = await window.crypto.subtle.importKey(
        'jwk',
        { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RSA-OAEP-256', ext: true },
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
    );
    const der = await window.crypto.subtle.exportKey('spki', publicKey);
    const digest = await window.crypto.subtle.digest('SHA-256', der);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * 解密一张证据附件，返回可直接用于展示的 Blob。
 */
export const decryptEvidence = async (
    payload: ArrayBuffer,
    contentType?: string,
    keyId?: string | null
): Promise<Blob> => {
    const bytes = new Uint8Array(payload);
    if (bytes.byteLength <= WRAPPED_KEY_LENGTH_FIELD + IV_LENGTH + GCM_TAG_LENGTH) {
        throw new Error('证据数据不完整，无法解密');
    }

    const wrappedKeyLength = (bytes[0] << 8) | bytes[1];
    const contentOffset = WRAPPED_KEY_LENGTH_FIELD + wrappedKeyLength;
    if (wrappedKeyLength <= 0 || bytes.byteLength <= contentOffset + IV_LENGTH + GCM_TAG_LENGTH) {
        throw new Error('证据数据格式不正确，无法解密');
    }

    const privateKey = await importPrivateKey(getEvidencePrivateKey(keyId));

    let rawSessionKey: ArrayBuffer;
    try {
        rawSessionKey = await window.crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            bytes.subarray(WRAPPED_KEY_LENGTH_FIELD, contentOffset)
        );
    } catch {
        throw new Error('会话密钥解密失败，请确认私钥与服务端配置的公钥是同一对');
    }

    const sessionKey = await window.crypto.subtle.importKey('raw', rawSessionKey, { name: 'AES-GCM' }, false, [
        'decrypt',
    ]);
    const iv = bytes.subarray(contentOffset, contentOffset + IV_LENGTH);
    const ciphertext = bytes.subarray(contentOffset + IV_LENGTH);

    try {
        const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sessionKey, ciphertext);
        return new Blob([plain], { type: contentType || 'image/jpeg' });
    } catch {
        throw new Error('证据解密失败，数据可能已损坏');
    }
};
