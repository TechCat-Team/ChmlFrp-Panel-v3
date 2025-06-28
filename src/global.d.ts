interface CaptchaObj {
    onNextReady(callback: () => void): void;
    showCaptcha(): void;
    onClose(callback: () => void): void;
    onSuccess(callback: () => void): void;
    getValidate(): any;
}

interface GeetestResult {
    captcha_output: string;
    gen_time: string;
    lot_number: string;
    pass_token: string;
}

interface Window {
    initGeetest4: (
        options: { product: string; captchaId: string; width: string },
        callback: (captchaObj: CaptchaObj) => void
    ) => void;
}
