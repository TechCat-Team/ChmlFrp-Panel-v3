import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { requiresTunnelDomainWhitelist, isTunnelDomainWhitelistError } from '../src/utils/tunnelDomainWhitelist.ts';

const cases = new Map();
globalThis.__tunnelWhitelistCases = cases;
const createUrl = new URL('../src/pages/Tunnel/List/composables/useTunnelCreate.ts', import.meta.url).href;
const editUrl = new URL('../src/pages/Tunnel/List/composables/useTunnelEdit.ts', import.meta.url).href;
const guardUrl = new URL('../src/pages/Tunnel/List/composables/useTunnelDomainWhitelist.ts', import.meta.url).href;
const policyUrl = new URL('../src/utils/tunnelDomainWhitelist.ts', import.meta.url).href;
const dataModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({
    resolve(specifier, context, nextResolve) {
        const caseId = context.parentURL?.startsWith('file:') ? new URL(context.parentURL).searchParams.get('case') : null;
        if (specifier === '@/utils/tunnelDomainWhitelist') return { url: policyUrl, shortCircuit: true };
        if (!caseId) return nextResolve(specifier, context);
        const getCase = `globalThis.__tunnelWhitelistCases.get(${JSON.stringify(caseId)})`;
        if (specifier === './useTunnelDomainWhitelist') return { url: `${guardUrl}?case=${caseId}`, shortCircuit: true };
        if (specifier === '@/api') return { url: dataModule(`export default ${getCase}.api`), shortCircuit: true };
        if (specifier === 'naive-ui') return { url: dataModule(`export const useMessage=()=>${getCase}.message;export const useDialog=()=>${getCase}.dialog;`), shortCircuit: true };
        if (specifier === 'vue-router') return { url: dataModule(`export const useRouter=()=>${getCase}.router;`), shortCircuit: true };
        return nextResolve(specifier, context);
    },
});

let sequence = 0;
async function flow({ approved = false, error = null, backendError = null, free = true, type = 'HTTP', name = '北京一区', china = 'yes', edit = false } = {}) {
    const events = [], warnings = [], errors = [], routes = [];
    const mock = {
        api: { v2: {
            whitelist: { checkTunnel: async body => { events.push(['check', body]); if (error) throw error; return { data: { required: true, approved, domain: 'example.com.cn' } }; } },
            domain: {
                createFreeSubdomain: async body => { events.push(['dns-create',body]); return {}; },
                deleteFreeSubdomain: async body => { events.push(['dns-delete',body]); return {}; },
                getUserFreeSubdomains: async () => { events.push(['dns-list']); return { data: [] }; },
            },
            tunnel: {
                createTunnel: async body => { events.push(['tunnel-create',body]); if (backendError) throw backendError; return {}; },
                updateTunnel: async body => { events.push(['tunnel-update',body]); if (backendError) throw backendError; return {}; },
            },
        } },
        message: { error: text => errors.push(text), info: () => {}, success: () => {} },
        dialog: { warning: options => warnings.push(options), success: () => {} },
        router: { push: path => routes.push(path) },
    };
    const id = String(++sequence); cases.set(id, mock);
    const module = await import(`${edit ? editUrl : createUrl}?case=${id}`);
    const form = { name:'demo',node:name,nodeOld:name,nameOld:'old',type,nport:'8080',dorp:'10000',localip:'127.0.0.1',domainNameLabel:free?'免费域名':'自定义',domain:'www.example.com.cn',recordValue:'www',choose:'example.com.cn',chooseOld:'example.com.cn',recordValueOld:'old',tunnelid:42,encryption:false,compression:false,forceHttps:false,ap:'',ipRuleMode:'none',ipRules:[],regionRuleMode:'none',regionRules:[] };
    const node={value:{name,china,ip:'frp.example.com'}};
    const onSuccess=()=>events.push(['success']);
    const result=edit?module.useTunnelEdit({},form,node,()=>true,onSuccess):module.useTunnelCreate({},form,node,()=>true,onSuccess);
    await (edit?result.editTunnel():result.createTunnel());
    return { events,warnings,errors,routes,result };
}

test('mainland rule uses china=yes and node name, excluding Hong Kong, Taiwan and Macau', () => {
    for (const type of ['HTTP','HTTPS','http','https']) assert.equal(requiresTunnelDomainWhitelist({china:'yes',name:'北京一区'},type),true);
    for (const name of ['香港一区','台湾二区','澳门一区']) assert.equal(requiresTunnelDomainWhitelist({china:'yes',name},'HTTP'),false);
    assert.equal(requiresTunnelDomainWhitelist({china:'no',name:'北京一区'},'HTTPS'),false);
    for (const type of ['TCP','UDP']) assert.equal(requiresTunnelDomainWhitelist({china:'yes',name:'北京一区'},type),false);
    assert.equal(isTunnelDomainWhitelistError({details:{data:{reason:'domain_whitelist_required'}}}),true);
    assert.equal(isTunnelDomainWhitelistError(new Error('unrelated')),false);
});

test('missing whitelist blocks creation before DNS allocation and offers the application route', async () => {
    const f=await flow();
    assert.deepEqual(f.events.map(e=>e[0]),['check']);
    assert.equal(f.warnings.length,1); assert.match(f.warnings[0].content,/扩展功能 → 备案过白/);
    f.warnings[0].onPositiveClick(); assert.deepEqual(f.routes,['/expand/domain-whitelist']);
    assert.equal(f.result.loading.value,false);
});

test('approved root is checked before DNS and tunnel creation', async () => {
    const f=await flow({approved:true});
    assert.deepEqual(f.events.map(e=>e[0]),['check','dns-create','tunnel-create','success']);
    assert.equal(f.events[0][1].domain,'www.example.com.cn');
});

test('preflight errors fail closed before creating resources', async () => {
    const f=await flow({error:new Error('上游不可用')});
    assert.deepEqual(f.events.map(e=>e[0]),['check']);assert.equal(f.errors.length,1);
});

test('special regions, overseas nodes, TCP and UDP retain their existing flow', async () => {
    for (const options of [{name:'香港一区'},{name:'台湾一区'},{name:'澳门一区'},{china:'no'},{type:'TCP'},{type:'UDP'}]) {
        const f=await flow({...options,free:false});
        assert.deepEqual(f.events.map(e=>e[0]),['tunnel-create','success']);assert.equal(f.warnings.length,0);
    }
});

test('backend rejection after preflight still guides the user and rolls back newly created DNS', async () => {
    const error=Object.assign(new Error('请前往扩展功能 → 备案过白'),{details:{data:{reason:'domain_whitelist_required'}}});
    const f=await flow({approved:true,backendError:error});
    assert.deepEqual(f.events.map(e=>e[0]),['check','dns-create','tunnel-create','dns-delete']);
    assert.equal(f.warnings.length,1);assert.equal(f.errors.length,0);
});

test('editing to a blocked binding stops before modifying existing DNS or tunnel', async () => {
    const f=await flow({edit:true});
    assert.deepEqual(f.events.map(e=>e[0]),['check']);assert.equal(f.warnings.length,1);
});
