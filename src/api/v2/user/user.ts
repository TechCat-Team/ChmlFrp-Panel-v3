import axiosInstance from '../axios/axiosInstance';
import { BaseResponse } from '../axios/axiosInstance';

// 登录
interface LoginResponse extends BaseResponse {
    data: {
        id: number;
        username: string;
        password: string | null;
        userimg: string;
        qq: string;
        email: string;
        usertoken: string;
        usergroup: string;
        bandwidth: number;
        tunnel: number;
        realname: string;
        login_attempts: number;
        integral: number;
        term: string;
        scgm: string;
        regtime: string;
        t_token: string | null;
        realname_count: number;
        total_download: number;
        total_upload: number;
        tunnelCount: number;
        totalCurConns: number;
    };
}

/**
 * 登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<LoginResponse>} 登录响应
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    return axiosInstance.get('/login', {
        params: { username, password },
    });
};

/**
 * 发送邮箱验证码
 * @param {string} type - 验证码类型
 * @param {string} mail - 邮箱地址
 * @param {string} lot_number - 验证码批次号
 * @param {string} captcha_output - 验证码输出
 * @param {string} pass_token - 验证通过的令牌
 * @param {string} gen_time - 验证码生成时间
 * @returns {Promise<BaseResponse>} 邮箱验证码响应
 */
export const sendMailCode = async (
    type: string,
    mail: string,
    lot_number: string,
    captcha_output: string,
    pass_token: string,
    gen_time: string
): Promise<BaseResponse> => {
    return axiosInstance.post('/sendmailcode', {
        type,
        mail,
        lot_number,
        captcha_output,
        pass_token,
        gen_time,
    });
};

/**
 * 注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} mail - 邮箱地址
 * @param {string} qq - QQ号
 * @param {string} code - 验证码
 * @returns {Promise<BaseResponse>} 注册响应
 */
export const register = async (
    username: string,
    password: string,
    mail: string,
    qq: string,
    code: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/register', {
        params: { username, password, mail, qq, code },
    });
};

// 获取用户信息
interface UserInfoResponse extends BaseResponse {
    data: {
        id: number;
        username: string;
        password: string | null;
        userimg: string;
        qq: string;
        email: string;
        usertoken: string;
        usergroup: string;
        bandwidth: number;
        tunnel: number;
        realname: string;
        login_attempts: number;
        integral: number;
        term: string;
        scgm: string | null;
        regtime: string;
        t_token: string | null;
        realname_count: number;
        total_download: number;
        total_upload: number;
        tunnelCount: number;
        totalCurConns: number;
    };
}

/**
 * 获取用户信息
 * @param {string} token - 用户令牌
 * @returns {Promise<UserInfoResponse>} 用户信息响应
 */
export const getUserInfo = async (token: string): Promise<UserInfoResponse> => {
    return axiosInstance.get('/userinfo', {
        params: { token },
    });
};

/**
 * 重置令牌
 * @param {string} token - 用户令牌
 * @returns {Promise<BaseResponse>} 重置令牌响应
 */
export const resetToken = async (token: string): Promise<BaseResponse> => {
    return axiosInstance.get('/retoken', {
        params: { token },
    });
};

/**
 * 用户签到
 * @param {string} token - 用户令牌
 * @param {string} lot_number - 验证码批次号
 * @param {string} captcha_output - 验证码输出
 * @param {string} pass_token - 验证通过的令牌
 * @param {string} gen_time - 验证码生成时间
 * @returns {Promise<BaseResponse>} 签到响应
 */
export const signIn = async (
    token: string,
    lot_number: string,
    captcha_output: string,
    pass_token: string,
    gen_time: string
): Promise<BaseResponse> => {
    return axiosInstance.post('/qiandao', {
        token,
        lot_number,
        captcha_output,
        pass_token,
        gen_time,
    });
};

/**
 * 重置密码
 * @param {string} original_password - 原密码
 * @param {string} new_password - 新密码
 * @param {string} token - 用户令牌
 * @returns {Promise<BaseResponse>} 重置密码响应
 */
export const resetPassword = async (
    original_password: string,
    new_password: string,
    token: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/reset_password', {
        params: { original_password, new_password, token },
    });
};

/**
 * 修改用户名
 * @param {string} token - 用户令牌
 * @param {string} new_username - 新用户名
 * @returns {Promise<BaseResponse>} 修改用户名响应
 */
export const updateUserName = async (token: string, new_username: string): Promise<BaseResponse> => {
    return axiosInstance.get('/update_username', {
        params: { token, new_username },
    });
};

/**
 * 修改QQ
 * @param {string} token - 用户令牌
 * @param {string} new_qq - 新QQ号
 * @returns {Promise<BaseResponse>} 修改QQ响应
 */
export const updateQQ = async (token: string, new_qq: string): Promise<BaseResponse> => {
    return axiosInstance.get('/update_qq', {
        params: { token, new_qq },
    });
};

/**
 * 重置头像
 * @param {string} token - 用户令牌
 * @param {string} new_userimg - 新头像URL
 * @returns {Promise<BaseResponse>} 重置头像响应
 */
export const updateUserImage = async (token: string, new_userimg: string): Promise<BaseResponse> => {
    return axiosInstance.get('/update_userimg', {
        params: { token, new_userimg },
    });
};

// 获取消息
interface GetMessageResponse extends BaseResponse {
    data: Array<{
        id: number;
        userid: number;
        content: string;
        quanti: string;
        time: string;
    }> | null;
}

/**
 * 获取消息
 * @param {string} token - 用户令牌
 * @returns {Promise<GetMessageResponse>} 消息响应
 */
export const getMessages = async (token: string): Promise<GetMessageResponse> => {
    return axiosInstance.get('/messages', {
        params: { token },
    });
};

/**
 * 重置邮箱
 * @param {string} token - 用户令牌
 * @param {string} new_email - 新邮箱地址
 * @param {string} email_code - 邮箱验证码
 * @param {string} new_email_code - 新邮箱验证码
 * @returns {Promise<BaseResponse>} 重置邮箱响应
 */
export const resetEmail = async (
    token: string,
    new_email: string,
    email_code: string,
    new_email_code: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/reset_email', {
        params: { token, new_email, email_code, new_email_code },
    });
};

/**
 *
 * @param token 用户令牌
 * @param email_code 邮箱验证码
 * @returns {Promise<BaseResponse>} 删除账户响应
 */
export const deleteAccount = async (token: string, email_code: string): Promise<BaseResponse> => {
    return axiosInstance.get('/delete_account', {
        params: { token, email_code },
    });
};

/**
 * 重置密码通过邮箱
 * @param {string} email - 用户邮箱
 * @param {string} new_password - 新密码
 * @param {string} code - 验证码
 * @returns {Promise<BaseResponse>} 重置密码响应
 */
export const resetPasswordByEmail = async (
    email: string,
    new_password: string,
    code: string
): Promise<BaseResponse> => {
    return axiosInstance.get('/email_reset_password', {
        params: { email, new_password, code },
    });
};
