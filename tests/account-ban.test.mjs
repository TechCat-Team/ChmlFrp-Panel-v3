import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeAccountBan } from '../src/utils/accountBan.ts';

const now = Date.parse('2026-10-18T12:00:00+08:00');
const tomorrow = now + 86400000;

test('permanent account ban does not inherit the membership expiry tomorrow', () => {
    const record = { scope: 'user', expires_at: null, active: true, unbanned_at: null };
    assert.deepEqual(summarizeAccountBan([record], now), { status: 'permanent', expiresAt: null });
    assert.deepEqual(summarizeAccountBan([record], tomorrow + 86400000), { status: 'permanent', expiresAt: null });
});

test('overlapping account bans last until the latest expiry, with permanent bans taking precedence', () => {
    const finite = [
        { scope: 'user', expires_at: tomorrow },
        { scope: 'user', expires_at: tomorrow + 86400000 },
    ];
    assert.deepEqual(summarizeAccountBan(finite, now), { status: 'temporary', expiresAt: tomorrow + 86400000 });
    assert.deepEqual(summarizeAccountBan([...finite, { scope: 'user', expires_at: null }], now), {
        status: 'permanent',
        expiresAt: null,
    });
});

test('tunnel restrictions, revoked records and expired account bans do not extend the account ban', () => {
    const ignored = [
        { scope: 'tunnel', expires_at: null },
        { scope: 'user', expires_at: null, active: false },
        { scope: 'user', expires_at: null, unbanned_at: '2026-10-18T11:00:00+08:00' },
        { scope: 'user', expires_at: now },
        { scope: 'user', expires_at: now - 1 },
    ];
    assert.deepEqual(summarizeAccountBan(ignored, now), { status: 'none', expiresAt: null });
    assert.deepEqual(summarizeAccountBan([...ignored, { scope: 'user', expires_at: tomorrow }], now), {
        status: 'temporary',
        expiresAt: tomorrow,
    });
});

test('legacy account ban records with no explicit scope or expiry retain permanent semantics', () => {
    assert.deepEqual(summarizeAccountBan([{}], now), { status: 'permanent', expiresAt: null });
    assert.deepEqual(summarizeAccountBan([], now), { status: 'none', expiresAt: null });
});
