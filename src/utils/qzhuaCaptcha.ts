const CAPTCHA_SCRIPT_URL = 'https://captcha.qzhua.net/qzhuacaptcha.js';
const SIGN_IN_SCENE_ID = 'scn_pSyEm8Z0YJAaCYGGNxw9SEHgGDon0iYQ';

interface CaptchaInstance {
    destroy(): void;
}

interface QzhuaCaptcha {
    init(
        container: string,
        options: {
            sceneId: string;
            display: 'inline';
            onSuccess: (token: string) => void;
            onFail: (message?: string) => void;
            onError: (error: { message: string }) => void;
            onClose: () => void;
        }
    ): Promise<CaptchaInstance>;
}

declare global {
    interface Window {
        QzhuaCaptcha?: QzhuaCaptcha;
    }
}

let scriptPromise: Promise<QzhuaCaptcha> | null = null;

const loadQzhuaCaptcha = (): Promise<QzhuaCaptcha> => {
    if (window.QzhuaCaptcha) {
        return Promise.resolve(window.QzhuaCaptcha);
    }

    if (scriptPromise) {
        return scriptPromise;
    }

    scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CAPTCHA_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
            if (window.QzhuaCaptcha) {
                resolve(window.QzhuaCaptcha);
                return;
            }
            reject(new Error('验证码 SDK 初始化失败'));
        };
        script.onerror = () => reject(new Error('验证码 SDK 加载失败'));
        document.head.appendChild(script);
    });

    return scriptPromise;
};

export const verifySignInCaptcha = async (): Promise<string> => {
    const captcha = await loadQzhuaCaptcha();
    const containerId = `qzhua-captcha-${Date.now()}`;
    const container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);

    return new Promise((resolve, reject) => {
        let instance: CaptchaInstance | undefined;
        let settled = false;
        const cleanup = () => {
            instance?.destroy();
            container.remove();
        };
        const succeed = (token: string) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(token);
        };
        const fail = (message: string) => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error(message));
        };

        captcha.init(`#${containerId}`, {
            sceneId: SIGN_IN_SCENE_ID,
            display: 'inline',
            onSuccess: succeed,
            onFail: (message) => fail(message || '验证码验证未通过'),
            onError: (error) => fail(error.message || '验证码加载失败'),
            onClose: () => fail('验证码已关闭'),
        }).then((captchaInstance) => {
            instance = captchaInstance;
            if (settled) captchaInstance.destroy();
        }).catch((error: unknown) => {
            fail(error instanceof Error ? error.message : '验证码加载失败');
        });
    });
};
