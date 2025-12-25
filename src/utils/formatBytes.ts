/**
 * 流量/存储单位换算工具函数
 * 将字节数转换为可读的格式（Bytes, KiB, MiB, GiB, TiB, PiB）
 *
 * @param bytes - 字节数，支持 number、string、undefined、null
 * @returns 包含格式化后的数值和单位的对象
 *
 * @example
 * formatBytes(1024) // { value: 1, suffix: 'KiB' }
 * formatBytes('2048') // { value: 2, suffix: 'KiB' }
 * formatBytes(undefined) // { value: 0, suffix: 'Bytes' }
 */
export function formatBytes(bytes: number | string | undefined | null): { value: number; suffix: string } {
    // 处理 null/undefined
    if (bytes === null || bytes === undefined) {
        return { value: 0, suffix: 'Bytes' };
    }

    // 转换为数字
    let num: number;
    if (typeof bytes === 'string') {
        num = parseFloat(bytes);
    } else {
        num = bytes;
    }

    // 处理无效值
    if (!Number.isFinite(num) || num < 0) {
        return { value: 0, suffix: 'Bytes' };
    }

    // 处理 0
    if (num === 0) {
        return { value: 0, suffix: 'Bytes' };
    }

    const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    let index = 0;
    let value = num;

    // 转换为合适的单位
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index++;
    }

    return {
        value: parseFloat(value.toFixed(2)),
        suffix: units[index],
    };
}
