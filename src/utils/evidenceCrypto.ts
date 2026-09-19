/**
 * 违规证据图片的解密工具（非对称混合加密，端到端）。
 *
 * 节点侧加密流程：
 *   1. 调 GET /v2/node/violation/public-key 获取 RSA 公钥
 *   2. 随机生成 32 字节 AES-256 会话密钥，用它以 AES-256-GCM 加密图片
 *   3. 用 RSA 公钥以 RSA-OAEP(SHA-256) 包裹该会话密钥
 *   4. 拼装上传：[2 字节大端被包裹密钥长度][被包裹的会话密钥][12 字节 IV][AES-GCM 密文 + 16 字节标签]
 *
 * 解密全在本浏览器完成：RSA 私钥只保存在 sessionStorage，
 * 服务端与对象存储只有密文，无法还原图片。
 */
const KEY_STORAGE = 'chmlfrp_violation_evidence_private_key';

const WRAPPED_KEY_LENGTH_FIELD = 2;
const IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

const isClient = () => typeof window !== 'undefined';

/**
 * 读取管理员在面板中粘贴的 PKCS#8 RSA 私钥（PEM），未设置时返回空串。
 */
export const getEvidencePrivateKey = (): string => {
    if (!isClient()) {
        return '';
    }
    return sessionStorage.getItem(KEY_STORAGE)?.trim() ?? '';
};

export const hasEvidencePrivateKey = () => getEvidencePrivateKey().length > 0;

export const setEvidencePrivateKey = (value: string) => {
    if (!isClient()) {
        return;
    }
    const trimmed = value.trim();
    if (trimmed) {
        sessionStorage.setItem(KEY_STORAGE, trimmed);
    } else {
        sessionStorage.removeItem(KEY_STORAGE);
    }
};

export const clearEvidencePrivateKey = () => {
    if (!isClient()) {
        return;
    }
    sessionStorage.removeItem(KEY_STORAGE);
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
        throw new Error('当前环境不支持 WebCrypto，无法解密证据图片（请使用 HTTPS 访问面板）');
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
        throw new Error('私钥格式不正确，需要 PKCS#8 PEM（BEGIN PRIVATE KEY），可用 openssl pkcs8 -topk8 -nocrypt 转换');
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
};

/**
 * 解密一张证据图片，返回可直接用于展示的 Blob。
 */
export const decryptEvidence = async (payload: ArrayBuffer, contentType?: string): Promise<Blob> => {
    const bytes = new Uint8Array(payload);
    if (bytes.byteLength <= WRAPPED_KEY_LENGTH_FIELD + IV_LENGTH + GCM_TAG_LENGTH) {
        throw new Error('证据数据不完整，无法解密');
    }

    const wrappedKeyLength = (bytes[0] << 8) | bytes[1];
    const contentOffset = WRAPPED_KEY_LENGTH_FIELD + wrappedKeyLength;
    if (wrappedKeyLength <= 0 || bytes.byteLength <= contentOffset + IV_LENGTH + GCM_TAG_LENGTH) {
        throw new Error('证据数据格式不正确，无法解密');
    }

    const privateKey = await importPrivateKey(getEvidencePrivateKey());

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

    const sessionKey = await window.crypto.subtle.importKey(
        'raw',
        rawSessionKey,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
    const iv = bytes.subarray(contentOffset, contentOffset + IV_LENGTH);
    const ciphertext = bytes.subarray(contentOffset + IV_LENGTH);

    try {
        const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sessionKey, ciphertext);
        return new Blob([plain], { type: contentType || 'image/jpeg' });
    } catch {
        throw new Error('图片解密失败，数据可能已损坏');
    }
};
