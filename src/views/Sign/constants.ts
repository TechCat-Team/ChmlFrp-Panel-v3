/**
 * 登录/注册页面常量定义
 */

// 极验验证码配置
export const GEETEST_CONFIG = {
    CAPTCHA_ID: '8253677cc86aae19e1b760f01d78ef27',
    PRODUCT: 'bind',
    WIDTH: '100%',
} as const;

// 验证码倒计时配置
export const VERIFICATION_CODE_CONFIG = {
    COUNTDOWN_SECONDS: 60,
    CODE_LENGTH: 6,
} as const;

// 移动端断点
export const MOBILE_BREAKPOINT = 1023;

// 表单字段最大长度
export const MAX_LENGTH = {
    USERNAME: 20,
    EMAIL: 255,
    PASSWORD: 48,
    LOGIN_EMAIL: 30,
    LOGIN_PASSWORD: 64,
    QQ: 20,
    VERIFICATION_CODE: 6,
} as const;

// 服务条款链接
export const TERMS_LINKS = {
    TERMS_OF_SERVICE: 'https://docs.chmlfrp.net/terms/terms-of-service.html',
    PRIVACY_POLICY: 'https://docs.chmlfrp.net/terms/privacy-policy.html',
    DISCLAIMER: 'https://docs.chmlfrp.net/terms/disclaimer.html',
} as const;

// Logo URL
export const LOGO_URL = 'https://www.chmlfrp.net/favicon.ico';

// 邮箱验证码登录表单验证规则
export const EMAIL_CODE_LOGIN_RULES = {
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱格式', trigger: ['blur', 'input'] },
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        {
            pattern: /^[0-9]{6}$/,
            message: '验证码必须为6位数字',
            trigger: ['blur', 'input'],
        },
    ],
} as const;

// 重置密码表单验证规则
export const RESET_PASSWORD_RULES = {
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱格式', trigger: ['blur', 'input'] },
    ],
    verificationCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        {
            pattern: /^[0-9]{6}$/,
            message: '验证码必须为6位数字',
            trigger: ['blur', 'input'],
        },
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        {
            pattern: /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{6,48}$/,
            message: '密码6~48位，且至少包含字母、数字、特殊符号中任意两种',
            trigger: ['blur', 'input'],
        },
    ],
    confirmPassword: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }],
} as const;

// 消息文本
export const MESSAGES = {
    GEETEST_CLOSED: '人机验证关闭',
    VERIFICATION_CODE_SENT: '邮箱验证码发送成功',
    EMAIL_SEND_FAILED: '邮件发送失败',
    LOAD_GEETEST_FAILED: '加载验证码失败',
    REGISTER_SUCCESS: '注册成功，请登录',
    REGISTER_FAILED: '注册失败',
    RESET_PASSWORD_FAILED: '重置密码失败',
    LOGIN_FAILED: '登录失败',
    CODE_MUST_BE_6_DIGITS: '验证码必须是6位数字',
    PASSWORD_MISMATCH: '密码不匹配，请重新确认。',
    LOGIN_VERIFYING: '正在进行登录验证...',
    TOURIST_PANEL_WARNING: '游客页面功能不完全，如需完整功能请登录！',
    TOURIST_PANEL_TITLE: '提示',
    TOURIST_PANEL_CONTENT:
        '检测到您已登录账户，是否直接跳转到首页？选择是则不退出登录到首页，选择否则退出登录到游客页面。',
} as const;

// 按钮文本
export const BUTTON_TEXT = {
    SEND_CODE: '发送验证码',
    RESEND_CODE: (seconds: number) => `重新发送(${seconds}s)`,
    LOGIN: '登录',
    REGISTER: '注册',
    NEXT_STEP: '下一步',
    PREV_STEP: '上一步',
    RESET_PASSWORD: '重置密码',
    BACK_TO_LOGIN: '返回登录',
    BACK_TO_NORMAL_LOGIN: '返回普通登录',
    TOURIST_PANEL: '游客面板',
    REGISTER_ACCOUNT: '注册账号',
    LOGIN_ACCOUNT: '登录账号',
} as const;

// 占位符文本
export const PLACEHOLDERS = {
    USERNAME_OR_EMAIL: '用户名或邮箱',
    PASSWORD: '密码',
    EMAIL: '邮箱',
    REGISTER_EMAIL: '请输入注册邮箱',
    CONFIRM_PASSWORD: '确认密码',
    NEW_PASSWORD: '新密码',
    CONFIRM_NEW_PASSWORD: '确认新密码',
    QQ: 'QQ号，没有可随意填写',
    VERIFICATION_CODE: '验证码',
    VERIFICATION_CODE_6_DIGITS: '6位数字验证码',
    RESET_EMAIL: '请输入注册时使用的邮箱',
} as const;

// 标签文本
export const LABELS = {
    USERNAME: '用户名',
    PASSWORD: '密码',
    EMAIL: '邮箱',
    CONFIRM_PASSWORD: '确认密码',
    NEW_PASSWORD: '新密码',
    QQ: 'QQ',
    VERIFICATION_CODE: '验证码',
    CLAUSE: '条款',
    KEEP_LOGGED_IN: '保持登录',
    RESET_PASSWORD: '重置密码',
} as const;

// 警告信息
export const ALERT_MESSAGES = {
    EMAIL_CODE_LOGIN_REQUIRED: '您的账户或IP已被临时限制登录，请使用邮箱验证码登录',
    REMAINING_TIME: (time: string) => `剩余时间: ${time}`,
} as const;
