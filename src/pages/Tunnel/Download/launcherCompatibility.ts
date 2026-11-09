import type { LauncherDownloadData, LauncherDownloadLink } from '@/api/v2/panel/panel';

const launcherPlatforms = new Map([
    ['Windows', 'windows'],
    ['Linux', 'linux'],
    ['macOS', 'darwin'],
    ['Android', 'android'],
]);

export interface LauncherDevice {
    platform: string;
    architecture: 'x64' | 'x86' | 'arm64' | 'arm';
}

interface NavigatorWithClientHints extends Navigator {
    userAgentData?: {
        platform: string;
        getHighEntropyValues(hints: string[]): Promise<{
            architecture?: string;
            bitness?: string;
            wow64?: boolean;
        }>;
    };
}

export async function detectLauncherDevice(browser: NavigatorWithClientHints): Promise<LauncherDevice | null> {
    const hints = browser.userAgentData;
    const platform = hints && launcherPlatforms.get(hints.platform);
    if (!hints || !platform) return null;

    try {
        const { architecture, bitness, wow64 } = await hints.getHighEntropyValues(['architecture', 'bitness', 'wow64']);
        const is64Bit = bitness === '64' || (platform === 'windows' && wow64 === true);
        if (architecture === 'x86' && (is64Bit || bitness === '32')) {
            return { platform, architecture: is64Bit ? 'x64' : 'x86' };
        }
        if (architecture === 'arm' && (is64Bit || bitness === '32')) {
            return { platform, architecture: is64Bit ? 'arm64' : 'arm' };
        }
    } catch {
        // 浏览器可能限制读取架构信息。
    }
    return null;
}

export function getLauncherDownloadMismatch(
    device: LauncherDevice | null,
    selected: LauncherDownloadLink,
    release: LauncherDownloadData | null
) {
    if (!device || !selected.architecture || selected.architecture === 'universal') return null;
    if (selected.architecture === device.architecture) return null;
    // 32 位 ARM 的浏览器提示不区分 armv7 等子架构。
    if (device.architecture === 'arm' && /^armv[5-8]/.test(selected.architecture)) return null;

    const matching = release?.platforms[device.platform]?.filter(
        ({ architecture }) => architecture === device.architecture || architecture === 'universal'
    );
    const recommended = matching?.find(({ format }) => format === selected.format) ?? matching?.[0];
    return { device, recommended };
}
