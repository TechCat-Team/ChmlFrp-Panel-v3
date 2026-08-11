import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const readSource = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8');

test('router no longer registers the /node/info page', () => {
    const routerSource = readSource('src/router/index.ts');

    assert.doesNotMatch(routerSource, /path:\s*['"`]\/node\/info['"`]/);
    assert.doesNotMatch(routerSource, /views\/NodeInfo\/index\.vue/);
});

test('tunnel status page no longer links to /node/info', () => {
    const statusPageSource = readSource('src/pages/Tunnel/Status/index.vue');

    assert.doesNotMatch(statusPageSource, /\/node\/info/);
    assert.doesNotMatch(statusPageSource, /goToNodeInfo/);
    assert.doesNotMatch(statusPageSource, /window\.open/);
});
