/**
 * 格式化字节数为可读的单位
 */
export function formatBytes(bytes: string | number): { value: number; suffix: string } {
    let num: number;
    if (typeof bytes === 'string') {
        num = parseFloat(bytes);
    } else {
        num = bytes;
    }
    const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    if (num === 0) return { value: 0, suffix: 'Bytes' };
    let index = 0;
    while (num >= 1024 && index < units.length - 1) {
        num /= 1024;
        index++;
    }
    return { value: parseFloat(num.toFixed(2)), suffix: units[index] };
}

/**
 * 生成随机端口号
 */
export function generateRandomPort(minPort: number, maxPort: number): number {
    return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
}

/**
 * 生成随机隧道名称
 */
export function generateRandomTunnelName(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomName += chars[randomIndex];
    }
    return randomName;
}

