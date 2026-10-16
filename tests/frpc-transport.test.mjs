import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as vue from 'vue';
import * as transport from '../src/utils/frpcTransport.ts';

const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
    return { promise, resolve, reject };
};

function configFlow(getConfig, quic = true) {
    const errors = [];
    const api = { v2: {
        tunnel: { getTunnelConfig: getConfig },
        node: { getNodeList: async () => ({ data: [{ name: 'node-a', quic }] }) },
    } };
    const source = readFileSync(new URL('../src/pages/Tunnel/List/composables/useTunnelConfig.ts', import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
    const exports = {};
    const imports = { vue, 'naive-ui': { useMessage: () => ({ error: text => errors.push(text) }) },
        '@/api': { __esModule: true, default: api }, '@/utils/frpcTransport': transport };
    new Function('require', 'exports', outputText)(name => {
        assert.ok(name in imports, `unexpected dependency ${name}`);
        return imports[name];
    }, exports);
    return { flow: exports.useTunnelConfig({ usertoken: 'test-token' }), errors };
}
const card = { id: 42, node: 'node-a', name: 'demo' };

test('QUIC shortcuts select QUIC explicitly, while TCP retains the compatible default invocation', () => {
    assert.equal(transport.frpcStartCommand('token', [1, 2], 'tcp'), 'frpc.exe -u token -p 1,2');
    assert.equal(transport.frpcStartCommand('token', [1, 2], 'quic'), 'frpc.exe -u token -p 1,2 --protocol quic');
    assert.equal(transport.frpcStartCommand('token', [1], 'quic', 'unix'), 'chmod +x frpc && ./frpc -u token -p 1 --protocol quic');
    assert.equal(transport.frpcStartCommand(undefined, [1], 'tcp'), '');
    assert.equal(transport.connectionProtocolOptions(false).find(x => x.value === 'quic').disabled, true);
});

test('late TCP response cannot replace a newer QUIC configuration or its shortcuts', async () => {
    const tcp = deferred(), quic = deferred();
    const calls = [];
    const { flow } = configFlow((node, name, protocol) => {
        calls.push({ node, name, protocol });
        return protocol === 'tcp' ? tcp.promise : quic.promise;
    });
    const opening = flow.getConfigCode(card);
    await tick();
    flow.changeProtocol('quic');
    assert.equal(flow.frpcIniConfig.value, '');
    assert.equal(flow.windowsdaima.value, '');
    tcp.resolve({ data: 'tcp-config' });
    await opening;
    assert.equal(flow.frpcIniConfig.value, '');
    assert.equal(flow.loading.value, true);
    quic.resolve({ data: 'quic-config' });
    await tick();
    assert.equal(flow.frpcIniConfig.value, 'quic-config');
    assert.match(flow.windowsdaima.value, /--protocol quic$/);
    assert.match(flow.linuxdaima.value, /--protocol quic$/);
    assert.equal(flow.loading.value, false);
    assert.deepEqual(calls.map(x => x.protocol), ['tcp', 'quic']);
    flow.showModal.value = false;
});

test('closing a pending modal discards its response; unsupported nodes cannot request QUIC', async () => {
    const pending = deferred();
    let calls = 0;
    const { flow } = configFlow(() => { calls++; return pending.promise; }, false);
    const opening = flow.getConfigCode(card);
    await tick();
    flow.changeProtocol('quic');
    assert.equal(calls, 1);
    assert.equal(flow.protocol.value, 'tcp');
    flow.showModal.value = false;
    pending.resolve({ data: 'obsolete-config' });
    await opening;
    assert.equal(flow.frpcIniConfig.value, '');
    assert.equal(flow.windowsdaima.value, '');
});

test('failed protocol regeneration leaves no stale downloadable config or startup command', async () => {
    const { flow, errors } = configFlow(async (_node, _name, protocol) => {
        if (protocol === 'quic') throw new Error('QUIC unavailable');
        return { data: 'tcp-config' };
    });
    await flow.getConfigCode(card);
    assert.equal(flow.frpcIniConfig.value, 'tcp-config');
    flow.changeProtocol('quic');
    await tick();
    assert.equal(flow.frpcIniConfig.value, '');
    assert.equal(flow.windowsdaima.value, '');
    assert.equal(flow.linuxdaima.value, '');
    assert.match(errors[0], /QUIC unavailable/);
    flow.showModal.value = false;
});
