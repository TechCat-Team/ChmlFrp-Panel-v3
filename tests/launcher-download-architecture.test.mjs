import test from 'node:test';
import assert from 'node:assert/strict';
import {
    detectLauncherDevice,
    getLauncherDownloadMismatch,
} from '../src/pages/Tunnel/Download/launcherCompatibility.ts';

test('uses browser client hints for Windows x64 and ARM64, including a 32-bit browser on Windows x64', async () => {
    const detect = (architecture, bitness, wow64) =>
        detectLauncherDevice({
            userAgentData: {
                platform: 'Windows',
                getHighEntropyValues: async (hints) => {
                    assert.deepEqual(hints, ['architecture', 'bitness', 'wow64']);
                    return { architecture, bitness, wow64 };
                },
            },
        });

    assert.deepEqual(await detect('x86', '64'), { platform: 'windows', architecture: 'x64' });
    assert.deepEqual(await detect('arm', '64'), { platform: 'windows', architecture: 'arm64' });
    assert.deepEqual(await detect('x86', '32', true), { platform: 'windows', architecture: 'x64' });
});

test('leaves architecture unknown when hints are unavailable, incomplete, or denied', async () => {
    assert.equal(await detectLauncherDevice({ userAgent: 'Windows NT 10.0; Win64; x64' }), null);
    for (const getHighEntropyValues of [
        async () => ({ architecture: 'arm' }),
        async () => {
            throw new Error('permission denied');
        },
    ]) {
        assert.equal(await detectLauncherDevice({ userAgentData: { platform: 'Linux', getHighEntropyValues } }), null);
    }
});

test('recommends the matching Linux architecture in the selected package format when available', () => {
    const device = { platform: 'linux', architecture: 'arm64' };
    const selected = { architecture: 'x64', format: 'DEB' };
    const appImage = { architecture: 'arm64', format: 'AppImage' };
    const deb = { architecture: 'arm64', format: 'DEB' };

    assert.equal(
        getLauncherDownloadMismatch(device, selected, { platforms: { linux: [appImage, deb] } }).recommended,
        deb
    );
    assert.equal(
        getLauncherDownloadMismatch(device, selected, { platforms: { linux: [appImage] } }).recommended,
        appImage
    );
    assert.deepEqual(getLauncherDownloadMismatch(device, selected, { platforms: {} }), {
        device,
        recommended: undefined,
    });
});

test('compatible and universal packages, unknown devices and older API responses need no prompt', () => {
    const device = { platform: 'darwin', architecture: 'arm64' };
    assert.equal(getLauncherDownloadMismatch(device, { architecture: 'arm64' }, null), null);
    assert.equal(getLauncherDownloadMismatch(device, { architecture: 'universal' }, null), null);
    assert.equal(getLauncherDownloadMismatch(device, { label: 'Intel 芯片' }, null), null);
    assert.equal(getLauncherDownloadMismatch(null, { architecture: 'x64' }, null), null);
});
