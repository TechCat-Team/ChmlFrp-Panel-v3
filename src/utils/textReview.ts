import type { ViolationDetail } from '@/api/v2/admin/violation';

const reasons: Record<string, string> = {
    text_too_long: '达到 6000 字，直接人工审核',
    incomplete_response: '响应未完整传输，直接人工审核',
    ai_unavailable: 'AI 服务异常，已启动五分钟冷却',
    ai_circuit_open: 'AI 处于五分钟冷却或恢复探测阶段',
    ai_input_rejected: 'AI 拒绝输入（如 token 超限），直接人工审核',
    ai_unsafe: 'AI 判定为不安全内容',
    ai_controversial: 'AI 判定存在争议，需要人工审核',
};
const verdicts: Record<string, string> = {
    unsafe: '不安全',
    controversial: '存在争议',
    safe: '安全',
    unknown: '未获得有效判定',
};
const risks: Record<string, string> = { low: '低', medium: '中', high: '高' };
const displayList = (value: unknown) => {
    if (typeof value !== 'string') return '—';
    try {
        const items: unknown = JSON.parse(value);
        if (Array.isArray(items) && items.every((item) => typeof item === 'string')) return items.join('、') || '—';
    } catch {
        /* bounded legacy fact can have a truncated JSON list */
    }
    return value || '—';
};
export function summarizeTextReview(detail: ViolationDetail | null) {
    if (detail?.reporter !== 'frps-textcheck') return null;
    let facts: Record<string, unknown>;
    try {
        facts = JSON.parse(detail.description);
    } catch {
        return null;
    }
    if (!facts || typeof facts !== 'object' || Array.isArray(facts)) return null;
    const reason = String(facts.review_reason ?? '');
    const label = String(facts.ai_label ?? 'unknown');
    const risk = String(facts.risk_level ?? '');
    return {
        reason: reasons[reason] || reason || '待人工审核',
        characters: /^\d+$/.test(String(facts.characters)) ? String(facts.characters) : '—',
        keywords: displayList(facts.keywords),
        categories: displayList(facts.categories),
        verdict: `${verdicts[label] || label}${risks[risk] ? ` · ${risks[risk]}风险` : ''}`,
        truncated: facts.text_truncated === 'true',
        urlHold: facts.url_blocked === 'true',
    };
}
