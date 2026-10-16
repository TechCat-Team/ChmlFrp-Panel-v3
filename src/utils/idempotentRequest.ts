/** Keep the exact request (including absolute expiry) across timeout retries and page reloads. */
const memory = new Map<string, string>();

export function prepareIdempotentRequest<T extends object>(
    key: string,
    signature: string,
    create: () => T
): T & { request_id: string } {
    const storageKey = `violation-request:${key}`;
    let saved = memory.get(storageKey);
    try {
        saved = sessionStorage.getItem(storageKey) || saved;
    } catch {
        /* private storage may be unavailable */
    }
    if (saved) {
        try {
            const previous = JSON.parse(saved);
            if (previous.signature === signature) return previous.payload;
        } catch {
            /* replace invalid local state */
        }
    }
    const payload = { ...create(), request_id: crypto.randomUUID() };
    const serialized = JSON.stringify({ signature, payload });
    memory.set(storageKey, serialized);
    try {
        sessionStorage.setItem(storageKey, serialized);
    } catch {
        /* memory still preserves retries */
    }
    return payload;
}

export function completeIdempotentRequest(key: string): void {
    const storageKey = `violation-request:${key}`;
    memory.delete(storageKey);
    try {
        sessionStorage.removeItem(storageKey);
    } catch {
        /* no persistent state */
    }
}
