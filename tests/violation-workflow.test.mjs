import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';

const storage = new Map();
globalThis.sessionStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
};
globalThis.window = { crypto: webcrypto, atob };
const { prepareIdempotentRequest, completeIdempotentRequest } = await import('../src/utils/idempotentRequest.ts');

test('timeout retry and module reload preserve the exact request ID and absolute expiry', async () => {
    const first = prepareIdempotentRequest('test-case', 'same-decision', () => ({ expires_at: 12345 }));
    const retry = prepareIdempotentRequest('test-case', 'same-decision', () => ({ expires_at: 99999 }));
    assert.deepEqual(retry, first);
    const reloaded = await import('../src/utils/idempotentRequest.ts?reload=1');
    assert.deepEqual(reloaded.prepareIdempotentRequest('test-case', 'same-decision', () => ({})), first);
    const changed = prepareIdempotentRequest('test-case', 'different-decision', () => ({ expires_at: null }));
    assert.notEqual(changed.request_id, first.request_id);
    completeIdempotentRequest('test-case');
    assert.notEqual(prepareIdempotentRequest('test-case', 'different-decision', () => ({})).request_id, changed.request_id);
});

test('rotated evidence keys decrypt their own historical envelopes and reject tampering', async () => {
    const crypto = await import('../src/utils/evidenceCrypto.ts');
    const makeKey = async () => {
        const pair = await webcrypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
        const der = await webcrypto.subtle.exportKey('pkcs8', pair.privateKey);
        const pem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(der).toString('base64')}\n-----END PRIVATE KEY-----`;
        const id = await crypto.validateEvidencePrivateKey(pem);
        crypto.setEvidencePrivateKey(pem, id);
        return { pair, id };
    };
    const old = await makeKey();
    const session = await webcrypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const wrapped = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'RSA-OAEP' }, old.pair.publicKey,
        await webcrypto.subtle.exportKey('raw', session)));
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, session, new TextEncoder().encode('historical evidence')));
    const payload = new Uint8Array(2 + wrapped.length + iv.length + encrypted.length);
    payload[0] = wrapped.length >> 8; payload[1] = wrapped.length & 255;
    payload.set(wrapped, 2); payload.set(iv, 2 + wrapped.length); payload.set(encrypted, 2 + wrapped.length + iv.length);
    const current = await makeKey();
    assert.notEqual(current.id, old.id);
    assert.equal(await (await crypto.decryptEvidence(payload.buffer, 'image/png', old.id)).text(), 'historical evidence');
    const textEvidence = await crypto.decryptEvidence(payload.buffer, 'text/plain', old.id);
    assert.equal(textEvidence.type, 'text/plain');
    assert.equal(await textEvidence.text(), 'historical evidence');
    payload[payload.length - 1] ^= 1;
    await assert.rejects(crypto.decryptEvidence(payload.buffer, 'image/png', old.id), /损坏/);
    crypto.clearEvidencePrivateKey();
    assert.equal(crypto.getEvidencePrivateKey(old.id), '');
});
