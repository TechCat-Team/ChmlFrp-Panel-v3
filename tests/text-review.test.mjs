import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeTextReview } from '../src/utils/textReview.ts';

test('text review explains fallback reasons and bounded evidence without treating an unknown verdict as safe', () => {
    const detail = { reporter: 'frps-textcheck', description: JSON.stringify({
        review_reason: 'ai_circuit_open', ai_label: 'unknown', characters: '9500',
        keywords: '["测试关键词"]', categories: '[]', text_truncated: 'true',
    }) };
    const result = summarizeTextReview(detail);
    assert.match(result.reason, /五分钟冷却/);
    assert.equal(result.verdict, '未获得有效判定');
    assert.equal(result.characters, '9500');
    assert.equal(result.keywords, '测试关键词');
    assert.equal(result.categories, '—');
    assert.equal(result.truncated, true);
});

test('text verdict preserves model categories, handles legacy malformed facts, and leaves image reports alone', () => {
    assert.equal(summarizeTextReview({ reporter: 'frps-imagecheck', description: '{}' }), null);
    assert.equal(summarizeTextReview({ reporter: 'frps-textcheck', description: '<script>bad</script>' }), null);
    assert.equal(summarizeTextReview({ reporter: 'frps-textcheck', description: 'null' }), null);
    const result = summarizeTextReview({ reporter: 'frps-textcheck', description: JSON.stringify({
        review_reason: 'ai_unsafe', ai_label: 'unsafe', risk_level: 'high', characters: '25', url_blocked: 'true',
        categories: '["Sexual Content or Sexual Acts"]', keywords: '["truncated', text_truncated: 'false',
    }) });
    assert.equal(result.verdict, '不安全 · 高风险');
    assert.equal(result.categories, 'Sexual Content or Sexual Acts');
    assert.equal(result.keywords, '["truncated');
    assert.equal(result.truncated, false);
    assert.equal(result.urlHold, true);
});
