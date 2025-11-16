/**
 * 登录/注册页面类型定义
 */

export type AuthMode = 'login' | 'register' | 'reset';

export interface LoginModel {
    email: string | null;
    password: string | null;
}

export interface EmailCodeLoginModel {
    email: string;
    code: string;
}

export interface RegisterModel {
    username: string;
    qq: string;
    password: string;
    email: string;
    confirmPassword: string;
    verificationCode: string;
}

export interface ResetPasswordModel {
    email: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
}

export interface GeetestResult {
    lot_number: string;
    captcha_output: string;
    pass_token: string;
    gen_time: string;
}

export interface CaptchaObj {
    showCaptcha: () => void;
    onClose: (callback: () => void) => void;
    onSuccess: (callback: () => void) => void;
    getValidate: () => GeetestResult | null;
}

declare global {
    interface Window {
        initGeetest4: (config: any, callback: (captchaObj: CaptchaObj) => void) => void;
    }
}

