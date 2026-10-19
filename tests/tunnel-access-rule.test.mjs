import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const readSource = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8');

test('tunnel create and edit payloads include access rules', () => {
    const createSource = readSource('src/pages/Tunnel/List/composables/useTunnelCreate.ts');
    const editSource = readSource('src/pages/Tunnel/List/composables/useTunnelEdit.ts');

    for (const field of ['ipRuleMode', 'ipRules', 'regionRuleMode', 'regionRules']) {
        assert.match(createSource, new RegExp(`${field}\\s*:`));
        assert.match(editSource, new RegExp(`${field}\\s*:`));
    }
});

test('tunnel list edit flow restores access rules into form data', () => {
    const typesSource = readSource('src/pages/Tunnel/List/types.ts');
    const listSource = readSource('src/pages/Tunnel/List/index.vue');

    assert.match(typesSource, /ipRuleMode:/);
    assert.match(typesSource, /ipRules:/);
    assert.match(typesSource, /regionRuleMode:/);
    assert.match(typesSource, /regionRules:/);
    assert.match(listSource, /formData\.ipRuleMode\s*=\s*card\.ipRuleMode/);
    assert.match(listSource, /formData\.regionRules\s*=\s*card\.regionRules/);
});
