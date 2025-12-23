import { pinyin } from 'pinyin-pro';

/**
 * 拼音搜索工具函数
 * 支持中文转拼音搜索，包括全拼、首字母、多音字等
 */

/**
 * 将中文转换为拼音（带声调）
 * @param text 要转换的中文文本
 * @returns 拼音字符串
 */
export function toPinyin(text: string): string {
    if (!text) return '';
    return pinyin(text, { toneType: 'symbol' });
}

/**
 * 将中文转换为拼音（不带声调）
 * @param text 要转换的中文文本
 * @returns 拼音字符串
 */
export function toPinyinWithoutTone(text: string): string {
    if (!text) return '';
    return pinyin(text, { toneType: 'none' });
}

/**
 * 将中文转换为拼音（不带声调，连续形式）
 * @param text 要转换的中文文本
 * @returns 连续拼音字符串
 */
export function toPinyinContinuous(text: string): string {
    if (!text) return '';
    return pinyin(text, { toneType: 'none' }).replace(/\s+/g, '');
}

/**
 * 获取中文文本的首字母拼音（带空格）
 * @param text 要转换的中文文本
 * @returns 首字母拼音字符串
 */
export function toPinyinInitials(text: string): string {
    if (!text) return '';
    return pinyin(text, { pattern: 'first', toneType: 'none' });
}

/**
 * 获取中文文本的首字母拼音（连续形式，如"bj"）
 * @param text 要转换的中文文本
 * @returns 连续首字母拼音字符串
 */
export function toPinyinInitialsContinuous(text: string): string {
    if (!text) return '';
    return pinyin(text, { pattern: 'first', toneType: 'none' }).replace(/\s+/g, '');
}

/**
 * 检查文本是否包含搜索关键词（支持拼音搜索）
 * @param text 要搜索的文本
 * @param keyword 搜索关键词
 * @returns 是否匹配
 */
export function matchPinyinSearch(text: string, keyword: string): boolean {
    if (!text || !keyword) return false;

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase().trim();

    // 1. 直接文本匹配
    if (lowerText.includes(lowerKeyword)) {
        return true;
    }

    // 2. 拼音全拼匹配（不带声调，带空格）
    const textPinyin = toPinyinWithoutTone(text).toLowerCase();
    if (textPinyin.includes(lowerKeyword)) {
        return true;
    }

    // 3. 拼音全拼匹配（不带声调，连续形式）
    const textPinyinContinuous = toPinyinContinuous(text).toLowerCase();
    if (textPinyinContinuous.includes(lowerKeyword)) {
        return true;
    }

    // 4. 拼音全拼匹配（带声调）
    const textPinyinWithTone = toPinyin(text).toLowerCase();
    if (textPinyinWithTone.includes(lowerKeyword)) {
        return true;
    }

    // 5. 首字母拼音匹配（带空格）
    const textInitials = toPinyinInitials(text).toLowerCase();
    if (textInitials.includes(lowerKeyword)) {
        return true;
    }

    // 6. 首字母拼音匹配（连续形式）
    const textInitialsContinuous = toPinyinInitialsContinuous(text).toLowerCase();
    if (textInitialsContinuous.includes(lowerKeyword)) {
        return true;
    }

    // 7. 混合匹配：支持拼音+中文混合搜索
    // 例如：搜索 "beijing" 可以匹配 "北京"
    const mixedText =
        lowerText + ' ' + textPinyin + ' ' + textPinyinContinuous + ' ' + textInitials + ' ' + textInitialsContinuous;
    if (mixedText.includes(lowerKeyword)) {
        return true;
    }

    return false;
}

/**
 * 高亮显示匹配的文本（用于搜索结果展示）
 * @param text 原始文本
 * @param keyword 搜索关键词
 * @returns 高亮后的HTML字符串
 */
export function highlightMatch(text: string, keyword: string): string {
    if (!text || !keyword) return text;

    const lowerText = text.toLowerCase();
    const lowerKeyword = keyword.toLowerCase().trim();

    // 查找匹配位置
    let matchIndex = -1;

    // 优先匹配原始文本
    matchIndex = lowerText.indexOf(lowerKeyword);

    // 如果原始文本没有匹配，尝试拼音匹配
    if (matchIndex === -1) {
        const textPinyin = toPinyinWithoutTone(text).toLowerCase();
        matchIndex = textPinyin.indexOf(lowerKeyword);
        if (matchIndex !== -1) {
            // 找到拼音匹配，但需要映射回原始文本位置
            // 这里简化处理，直接返回原始文本
            return text;
        }
    }

    if (matchIndex === -1) {
        return text;
    }

    // 高亮匹配部分
    const beforeMatch = text.substring(0, matchIndex);
    const matchText = text.substring(matchIndex, matchIndex + keyword.length);
    const afterMatch = text.substring(matchIndex + keyword.length);

    return `${beforeMatch}<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px;">${matchText}</mark>${afterMatch}`;
}

/**
 * 获取搜索建议（基于拼音）
 * @param text 原始文本
 * @param keyword 搜索关键词
 * @returns 搜索建议信息
 */
export function getSearchSuggestions(
    text: string,
    keyword: string
): {
    originalText: string;
    pinyin: string;
    initials: string;
    matchType: 'exact' | 'pinyin' | 'initials' | 'none';
} {
    const lowerKeyword = keyword.toLowerCase().trim();
    const lowerText = text.toLowerCase();

    let matchType: 'exact' | 'pinyin' | 'initials' | 'none' = 'none';

    if (lowerText.includes(lowerKeyword)) {
        matchType = 'exact';
    } else if (toPinyinWithoutTone(text).toLowerCase().includes(lowerKeyword)) {
        matchType = 'pinyin';
    } else if (toPinyinInitials(text).toLowerCase().includes(lowerKeyword)) {
        matchType = 'initials';
    }

    return {
        originalText: text,
        pinyin: toPinyinWithoutTone(text),
        initials: toPinyinInitials(text),
        matchType,
    };
}
