import type { MyBanRecord } from '../api/v2/user/violation';

type BanTiming = Pick<MyBanRecord, 'scope' | 'expires_at' | 'active' | 'unbanned_at'>;

export type AccountBanSummary =
    { status: 'none' | 'permanent'; expiresAt: null } | { status: 'temporary'; expiresAt: number };

/** Account restrictions expire independently of membership; every active ban must end. */
export const summarizeAccountBan = (records: readonly BanTiming[], now = Date.now()): AccountBanSummary => {
    let latest: number | null = null;
    for (const record of records) {
        if (record.scope === 'tunnel' || record.unbanned_at || record.active === false) continue;
        if (record.expires_at == null) return { status: 'permanent', expiresAt: null };
        if (record.expires_at > now) latest = Math.max(latest ?? record.expires_at, record.expires_at);
    }
    return latest === null ? { status: 'none', expiresAt: null } : { status: 'temporary', expiresAt: latest };
};
