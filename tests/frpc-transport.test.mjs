import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import * as transport from '../src/utils/frpcTransport.ts';

const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
    return { promise, resolve, reject };
};

// Node 原生类型擦除直接加载 .ts，依赖通过 loader hook 按用例隔离地注入。
const composableUrl = new URL('../src/pages/Tunnel/List/composables/useTunnelConfig.ts', import.meta.url).href;
const transportUrl = new URL('../src/utils/frpcTransport.ts', import.meta.url).href;
const mocks = new Map();
const dataModule = code => `data:text/javascript,${encodeURIComponent(code)}`;
const caseIdOf = parentURL => new URL(parentURL).searchParams.get('case');

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '@/utils/frpcTransport') {
            return { url: transportUrl, shortCircuit: true };
        }
        const caseId = context.parentURL?.startsWith('file:') ? caseIdOf(context.parentURL) : null;
        if (specifier === '@/api') {
            assert.ok(mocks.has(caseId), `unexpected dependency ${specifier} loaded outside a config flow`);
            return { url: dataModule(`export default globalThis.__configFlowMocks.get(${JSON.stringify(caseId)}).api`), shortCircuit: true };
        }
        if (specifier === 'naive-ui') {
            assert.ok(mocks.has(caseId), `unexpected dependency ${specifier} loaded outside a config flow`);
            return { url: dataModule(`export const useMessage = () => globalThis.__configFlowMocks.get(${JSON.stringify(caseId)}).message`), shortCircuit: true };
        }
        return nextResolve(specifier, context);
    },
});
globalThis.__configFlowMocks = mocks;

let caseSeq = 0;
async function configFlow(getConfig, quic = true) {
    const errors = [];
    const caseId = String(++caseSeq);
    mocks.set(caseId, {
        api: { v2: {
            tunnel: { getTunnelConfig: getConfig },
            node: { getNodeList: async () => ({ data: [{ name: 'node-a', quic }] }) },
        } },
        message: { error: text => errors.push(text) },
    });
    const module = await import(`${composableUrl}?case=${caseId}`);
    return { flow: module.useTunnelConfig({ usertoken: 'test-token' }), errors };
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
    const { flow } = await configFlow((node, name, protocol) => {
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
    const { flow } = await configFlow(() => { calls++; return pending.promise; }, false);
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
    const { flow, errors } = await configFlow(async (_node, _name, protocol) => {
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
