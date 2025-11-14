/**
 * 动态加载极验验证码脚本
 * 解决浏览器 Tracking Prevention 阻止第三方脚本访问存储的问题
 */

// 使用 Set 存储回调函数，避免重复
const loadCallbacks = new Set<(value: void | PromiseLike<void>) => void>();
let geetestLoaded = false;
let geetestLoading = false;

export const loadGeetestScript = (): Promise<void> => {
    // 如果已经加载完成，直接返回
    if (geetestLoaded && typeof window.initGeetest4 === 'function') {
        return Promise.resolve();
    }

    // 如果正在加载，返回现有的 Promise
    if (geetestLoading) {
        return new Promise((resolve) => {
            loadCallbacks.add(resolve);
        });
    }

    // 开始加载
    geetestLoading = true;

    return new Promise((resolve, reject) => {
        const scriptUrl = 'https://static.geetest.com/v4/gt4.js';
        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        
        const handleLoad = () => {
            geetestLoaded = true;
            geetestLoading = false;
            resolve();
            // 执行所有等待的回调并清空
            loadCallbacks.forEach(callback => callback());
            loadCallbacks.clear();
        };

        const handleError = () => {
            geetestLoading = false;
            const error = new Error('Failed to load Geetest script');
            reject(error);
            loadCallbacks.forEach(callback => callback());
            loadCallbacks.clear();
        };

        if (existingScript) {
            // 如果脚本标签已存在，等待加载完成
            existingScript.addEventListener('load', handleLoad);
            existingScript.addEventListener('error', handleError);
            return;
        }

        // 创建新的脚本标签
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer-when-downgrade';

        script.onload = handleLoad;
        script.onerror = handleError;

        // 添加到文档头部
        document.head.appendChild(script);
    });
};